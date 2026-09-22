import { supabase } from '../lib/supabase';

export interface ClientDb {
  id: string;
  doc_type: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';
  doc_number: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  total_spent: number;
  orders_count: number;
  credit_limit?: number;
  created_at?: string;
}

export interface SaleItemPayload {
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreateSalePayload {
  client_id?: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: 'Efectivo' | 'Tarjeta Débito' | 'Tarjeta Crédito' | 'Transferencia' | 'Yape/Plin' | 'Crédito';
  status?: 'Pagado' | 'Pendiente' | 'Anulado';
  items: SaleItemPayload[];
  receipt_type?: 'BOLETA' | 'FACTURA';
}

export interface SaleDb {
  id: string;
  sale_number: string;
  client_id?: string;
  cashier_id?: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string;
  status: 'Pagado' | 'Pendiente' | 'Anulado';
  created_at: string;
  clients?: {
    id: string;
    full_name: string;
    doc_type: string;
    doc_number: string;
    email?: string;
  } | null;
  sale_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    total: number;
    product_id: string;
    products?: {
      name: string;
      sku: string;
    } | null;
  }[];
  electronic_receipts?: {
    full_number: string;
    receipt_type: string;
    sunat_status: string;
  }[];
}

export const salesService = {
  // 1. Obtener listado de clientes
  async getClients(): Promise<ClientDb[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
    return data || [];
  },

  // 2. Crear nuevo cliente
  async createClient(client: {
    doc_type: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';
    doc_number: string;
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Promise<ClientDb> {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }
    return data;
  },

  // 3. Obtener listado de ventas históricas
  async getSales(): Promise<SaleDb[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        clients (id, full_name, doc_type, doc_number, email),
        sale_items (
          id, quantity, unit_price, total, product_id,
          products (name, sku)
        ),
        electronic_receipts (full_number, receipt_type, sunat_status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
    return data || [];
  },

  // 4. Completar venta POS (Transacción en BD: Venta + Items + Comprobante)
  async createSale(payload: CreateSalePayload): Promise<SaleDb> {
    // Generar correlativo amigable ej. PED-10293
    const saleNumber = `PED-${Date.now().toString().slice(-6)}`;

    // 4.1 Insertar venta
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          sale_number: saleNumber,
          client_id: payload.client_id || null,
          subtotal: payload.subtotal,
          tax: payload.tax,
          total: payload.total,
          payment_method: payload.payment_method,
          status: payload.status || 'Pagado'
        }
      ])
      .select()
      .single();

    if (saleError) {
      console.error('Error creating sale:', saleError);
      throw saleError;
    }

    const saleId = saleData.id;

    // 4.2 Insertar detalles de la venta (sale_items)
    // El trigger en PostgreSQL 'handle_sale_stock_reduction' descontará automáticamente el stock y registrará en inventory_movements
    if (payload.items && payload.items.length > 0) {
      const itemsToInsert = payload.items.map(it => ({
        sale_id: saleId,
        product_id: it.product_id,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total: it.total
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error creating sale items:', itemsError);
        throw itemsError;
      }
    }

    // 4.3 Generar Comprobante Electrónico SUNAT si fue solicitado
    if (payload.receipt_type) {
      const isBoleta = payload.receipt_type === 'BOLETA';
      const series = isBoleta ? 'B001' : 'F001';
      const correlative = Math.floor(1000 + Math.random() * 9000);
      const fullNumber = `${series}-${String(correlative).padStart(6, '0')}`;

      // Extraer datos del cliente si existen
      let docType = 'DNI';
      let docNumber = '00000000';
      let custName = 'CLIENTES VARIOS';

      if (payload.client_id) {
        const { data: cData } = await supabase
          .from('clients')
          .select('doc_type, doc_number, full_name')
          .eq('id', payload.client_id)
          .single();

        if (cData) {
          docType = cData.doc_type;
          docNumber = cData.doc_number;
          custName = cData.full_name;
        }
      }

      await supabase
        .from('electronic_receipts')
        .insert([
          {
            sale_id: saleId,
            receipt_type: payload.receipt_type,
            series: series,
            correlative_number: correlative,
            full_number: fullNumber,
            customer_doc_type: docType,
            customer_doc_number: docNumber,
            customer_name: custName,
            total_amount: payload.total,
            sunat_status: 'Aceptado SUNAT'
          }
        ]);
    }

    // Devolver la venta completa con relaciones
    const { data: fullSale, error: fetchErr } = await supabase
      .from('sales')
      .select(`
        *,
        clients (id, full_name, doc_type, doc_number, email),
        sale_items (
          id, quantity, unit_price, total, product_id,
          products (name, sku)
        ),
        electronic_receipts (full_number, receipt_type, sunat_status)
      `)
      .eq('id', saleId)
      .single();

    if (fetchErr) return saleData;
    return fullSale;
  }
};

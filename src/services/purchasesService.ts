import { supabase } from '../lib/supabase';

export interface SupplierDb {
  id: string;
  ruc: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at?: string;
}

export interface PurchaseItemPayload {
  product_id: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

export interface CreatePurchasePayload {
  supplier_id: string;
  total: number;
  delivery_date?: string;
  notes?: string;
  items: PurchaseItemPayload[];
}

export interface PurchaseDb {
  id: string;
  purchase_code: string;
  supplier_id: string;
  user_id?: string;
  total: number;
  status: 'Pendiente' | 'Recibido' | 'Cancelado';
  delivery_date?: string;
  notes?: string;
  created_at: string;
  suppliers?: {
    id: string;
    company_name: string;
    ruc: string;
    contact_name?: string;
    phone?: string;
    email?: string;
  } | null;
  purchase_items?: {
    id: string;
    quantity: number;
    unit_cost: number;
    total: number;
    product_id: string;
    products?: {
      name: string;
      sku: string;
    } | null;
  }[];
  goods_receipts?: {
    id: string;
    receipt_code: string;
    carrier_guide?: string;
    status: string;
    received_at: string;
  }[];
}

export interface GoodsReceiptPayload {
  purchase_id: string;
  carrier_guide?: string;
  warehouse_id?: string;
  status?: 'Conforme' | 'Observado' | 'Parcial';
  observations?: string;
}

export const purchasesService = {
  // 1. Obtener lista de proveedores
  async getSuppliers(): Promise<SupplierDb[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
    return data || [];
  },

  // 2. Registrar nuevo proveedor
  async createSupplier(supplier: {
    ruc: string;
    company_name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Promise<SupplierDb> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ ...supplier, is_active: true }])
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
    return data;
  },

  // 3. Obtener órdenes de compra con detalles
  async getPurchases(): Promise<PurchaseDb[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        suppliers (id, company_name, ruc, contact_name, phone, email),
        purchase_items (
          id, quantity, unit_cost, total, product_id,
          products (name, sku)
        ),
        goods_receipts (id, receipt_code, carrier_guide, status, received_at)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
    return data || [];
  },

  // 4. Crear nueva orden de compra
  async createPurchase(payload: CreatePurchasePayload): Promise<PurchaseDb> {
    const purchaseCode = `OC-${Date.now().toString().slice(-5)}`;

    const { data: purchase, error: pError } = await supabase
      .from('purchases')
      .insert([
        {
          purchase_code: purchaseCode,
          supplier_id: payload.supplier_id,
          total: payload.total,
          status: 'Pendiente',
          delivery_date: payload.delivery_date || null,
          notes: payload.notes || null
        }
      ])
      .select()
      .single();

    if (pError) {
      console.error('Error creating purchase:', pError);
      throw pError;
    }

    // Insertar ítems de la orden
    if (payload.items.length > 0) {
      const itemsToInsert = payload.items.map(it => ({
        purchase_id: purchase.id,
        product_id: it.product_id,
        quantity: it.quantity,
        unit_cost: it.unit_cost,
        total: it.total
      }));

      const { error: iError } = await supabase
        .from('purchase_items')
        .insert(itemsToInsert);

      if (iError) {
        console.error('Error creating purchase items:', iError);
        throw iError;
      }
    }

    return purchase;
  },

  // 5. Recepcionar mercadería (Actualizar estado de OC a Recibido + Ingreso a Kardex)
  async receiveGoods(payload: GoodsReceiptPayload): Promise<void> {
    const receiptCode = `REC-${Date.now().toString().slice(-5)}`;

    // 5.1 Insertar recepción de mercadería
    const { error: rError } = await supabase
      .from('goods_receipts')
      .insert([
        {
          receipt_code: receiptCode,
          purchase_id: payload.purchase_id,
          warehouse_id: payload.warehouse_id || null,
          carrier_guide: payload.carrier_guide || null,
          status: payload.status || 'Conforme',
          observations: payload.observations || null
        }
      ]);

    if (rError) {
      console.error('Error registering goods receipt:', rError);
      throw rError;
    }

    // 5.2 Actualizar estado de la Orden de Compra a 'Recibido'
    const { error: uError } = await supabase
      .from('purchases')
      .update({ status: 'Recibido' })
      .eq('id', payload.purchase_id);

    if (uError) {
      console.error('Error updating purchase status:', uError);
      throw uError;
    }

    // 5.3 Obtener items de la orden para sumar stock al Kardex
    const { data: items } = await supabase
      .from('purchase_items')
      .select('product_id, quantity')
      .eq('purchase_id', payload.purchase_id);

    if (items && items.length > 0) {
      for (const it of items) {
        // Consultar stock actual
        const { data: prod } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', it.product_id)
          .single();

        if (prod) {
          const current = Number(prod.current_stock);
          const nextStock = current + Number(it.quantity);

          // Actualizar stock del producto
          await supabase
            .from('products')
            .update({ current_stock: nextStock, updated_at: new Date().toISOString() })
            .eq('id', it.product_id);

          // Registrar en Kardex de inventario
          await supabase
            .from('inventory_movements')
            .insert([
              {
                product_id: it.product_id,
                warehouse_id: payload.warehouse_id || null,
                type: 'COMPRA',
                quantity: it.quantity,
                stock_before: current,
                stock_after: nextStock,
                reason: `Ingreso de compra ${receiptCode}`
              }
            ]);
        }
      }
    }
  }
};

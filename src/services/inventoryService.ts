import { supabase } from '../lib/supabase';

export interface ProductDb {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  warehouse_id?: string;
  price: number;
  cost: number;
  current_stock: number;
  min_stock: number;
  image_icon?: string;
  is_active: boolean;
  created_at?: string;
  categories?: { id: string; name: string } | null;
  warehouses?: { id: string; name: string; location: string } | null;
}

export interface CategoryDb {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  products_count?: number;
}

export interface WarehouseDb {
  id: string;
  name: string;
  location?: string;
  is_active: boolean;
  created_at?: string;
  items_count?: number;
}

export interface InventoryMovementDb {
  id: string;
  product_id: string;
  warehouse_id?: string;
  type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'VENTA' | 'COMPRA' | 'TRASLADO';
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason?: string;
  created_at: string;
  products?: { name: string; sku: string } | null;
  warehouses?: { name: string } | null;
}

export const inventoryService = {
  // --- PRODUCTOS ---
  async getProducts(): Promise<ProductDb[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name), warehouses(id, name, location)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    return data || [];
  },

  async createProduct(product: {
    name: string;
    sku: string;
    category_id?: string;
    warehouse_id?: string;
    price: number;
    cost?: number;
    current_stock: number;
    min_stock: number;
    image_icon?: string;
  }): Promise<ProductDb> {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: product.name,
          sku: product.sku,
          category_id: product.category_id || null,
          warehouse_id: product.warehouse_id || null,
          price: product.price,
          cost: product.cost || product.price * 0.6,
          current_stock: product.current_stock,
          min_stock: product.min_stock,
          image_icon: product.image_icon || '📦',
          is_active: true
        }
      ])
      .select('*, categories(id, name), warehouses(id, name, location)')
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    return data;
  },

  async updateProduct(id: string, updates: Partial<ProductDb>): Promise<ProductDb> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories(id, name), warehouses(id, name, location)')
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // --- CATEGORÍAS ---
  async getCategories(): Promise<CategoryDb[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      products_count: 0
    }));
  },

  async createCategory(name: string, description?: string): Promise<CategoryDb> {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    return data;
  },

  // --- ALMACENES ---
  async getWarehouses(): Promise<WarehouseDb[]> {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }

    return (data || []).map((wh: any) => ({
      id: wh.id,
      name: wh.name,
      location: wh.location,
      is_active: wh.is_active ?? true,
      items_count: 0
    }));
  },

  async createWarehouse(name: string, location?: string): Promise<WarehouseDb> {
    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ name, location, is_active: true }])
      .select()
      .single();

    if (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
    return data;
  },

  // --- MOVIMIENTOS (KARDEX) ---
  async getMovements(): Promise<InventoryMovementDb[]> {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*, products(name, sku), warehouses(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }
    return data || [];
  },

  async registerAdjustment(params: {
    product_id: string;
    warehouse_id?: string;
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    quantity: number;
    currentStock: number;
    reason: string;
  }): Promise<void> {
    const stockAfter = params.type === 'SALIDA' 
      ? params.currentStock - params.quantity 
      : params.currentStock + params.quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: stockAfter })
      .eq('id', params.product_id);

    if (updateError) throw updateError;

    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert([
        {
          product_id: params.product_id,
          warehouse_id: params.warehouse_id || null,
          type: params.type,
          quantity: params.quantity,
          stock_before: params.currentStock,
          stock_after: stockAfter,
          reason: params.reason
        }
      ]);

    if (movementError) throw movementError;
  },

  // --- SEMILLAS INICIALES EN CASO DE TABLAS VACÍAS ---
  async seedInitialData(): Promise<void> {
    // 1. Sembrar categorías si no hay
    const { data: cats } = await supabase.from('categories').select('id').limit(1);
    if (!cats || cats.length === 0) {
      await supabase.from('categories').insert([
        { name: 'Electrónicos', description: 'Audio, gadgets y accesorios tecnológicos' },
        { name: 'Accesorios', description: 'Mochilas, correas y complementos' },
        { name: 'Ropa', description: 'Prendas y calzado textil' },
        { name: 'Hogar', description: 'Artículos de oficina, cocina y descanso' },
        { name: 'Alimentos', description: 'Cafetería, snacks y abarrotes' }
      ]);
    }

    // 2. Sembrar almacenes si no hay
    const { data: whs } = await supabase.from('warehouses').select('id').limit(1);
    if (!whs || whs.length === 0) {
      await supabase.from('warehouses').insert([
        { name: 'Almacén Central', location: 'Sede Principal - Ate, Lima', is_active: true },
        { name: 'Tienda Principal', location: 'Mostrador de Ventas - Cercado', is_active: true },
        { name: 'Almacén Secundario', location: 'Depósito Norte - Panamericana', is_active: true }
      ]);
    }
  }
};

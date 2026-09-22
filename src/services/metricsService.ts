import { supabase } from '../lib/supabase';

export interface SystemCounts {
  // Inventario
  productsCount: number;
  categoriesCount: number;
  warehousesCount: number;
  lowStockCount: number;

  // Ventas
  clientsCount: number;
  salesCount: number;
  receiptsCount: number;

  // Compras
  suppliersCount: number;
  purchasesCount: number;

  // RRHH
  employeesCount: number;
  departmentsCount: number;
  leavesPendingCount: number;

  // Finanzas
  accountsCount: number;
  transactionsCount: number;
}

export const metricsService = {
  async getSystemCounts(): Promise<SystemCounts> {
    try {
      const [
        { count: productsCount },
        { count: categoriesCount },
        { count: warehousesCount },
        { data: lowStockProducts },
        { count: clientsCount },
        { count: salesCount },
        { count: receiptsCount },
        { count: suppliersCount },
        { count: purchasesCount },
        { count: employeesCount },
        { count: departmentsCount },
        { count: leavesPendingCount },
        { count: accountsCount },
        { count: transactionsCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('warehouses').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('id, current_stock, min_stock'),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('sales').select('*', { count: 'exact', head: true }),
        supabase.from('electronic_receipts').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('purchases').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('employee_leaves').select('*', { count: 'exact', head: true }).eq('status', 'Pendiente'),
        supabase.from('financial_accounts').select('*', { count: 'exact', head: true }),
        supabase.from('financial_transactions').select('*', { count: 'exact', head: true })
      ]);

      const lowStockCount = (lowStockProducts || []).filter(
        (p: any) => Number(p.current_stock) <= Number(p.min_stock)
      ).length;

      return {
        productsCount: productsCount || 0,
        categoriesCount: categoriesCount || 0,
        warehousesCount: warehousesCount || 0,
        lowStockCount: lowStockCount || 0,
        clientsCount: clientsCount || 0,
        salesCount: salesCount || 0,
        receiptsCount: receiptsCount || 0,
        suppliersCount: suppliersCount || 0,
        purchasesCount: purchasesCount || 0,
        employeesCount: employeesCount || 0,
        departmentsCount: departmentsCount || 0,
        leavesPendingCount: leavesPendingCount || 0,
        accountsCount: accountsCount || 0,
        transactionsCount: transactionsCount || 0
      };
    } catch (err) {
      console.error('Error fetching system counts from Supabase:', err);
      return {
        productsCount: 0,
        categoriesCount: 0,
        warehousesCount: 0,
        lowStockCount: 0,
        clientsCount: 0,
        salesCount: 0,
        receiptsCount: 0,
        suppliersCount: 0,
        purchasesCount: 0,
        employeesCount: 0,
        departmentsCount: 0,
        leavesPendingCount: 0,
        accountsCount: 0,
        transactionsCount: 0
      };
    }
  }
};

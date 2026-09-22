import { supabase } from '../lib/supabase';

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  salesByDay: {
    date: string;
    dayLabel: string;
    total: number;
    count: number;
  }[];
  salesByCategory: {
    categoryName: string;
    totalAmount: number;
    percentage: number;
    color: string;
  }[];
  topSellingProducts: {
    productName: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }[];
}

export interface InventoryAnalytics {
  totalStockUnits: number;
  totalInventoryValuation: number;
  lowStockItemsCount: number;
  outOfStockCount: number;
  stockByCategory: {
    categoryName: string;
    totalUnits: number;
    valuation: number;
  }[];
  criticalProducts: {
    id: string;
    name: string;
    sku: string;
    current_stock: number;
    min_stock: number;
    deficit: number;
  }[];
}

export interface FinanceAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  totalBankBalances: number;
  receivablesTotal: number;
  payablesTotal: number;
  expensesByCategory: {
    category: string;
    total: number;
    percentage: number;
  }[];
}

export interface RrhhAnalytics {
  totalEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  employeesByDepartment: {
    departmentName: string;
    headcount: number;
    payrollTotal: number;
  }[];
  punctualityRate: number;
  activeLeavesCount: number;
}

export interface BiConsolidatedMetrics {
  sales: SalesAnalytics;
  inventory: InventoryAnalytics;
  finance: FinanceAnalytics;
  rrhh: RrhhAnalytics;
}

export const biService = {
  async getConsolidatedBiMetrics(): Promise<BiConsolidatedMetrics> {
    const [
      { data: sales },
      { data: saleItems },
      { data: products },
      { data: categories },
      { data: transactions },
      { data: accounts },
      { data: credits },
      { data: employees },
      { data: departments },
      { data: attendances },
      { data: leaves }
    ] = await Promise.all([
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('sale_items').select('*, products(id, name, sku, category_id)'),
      supabase.from('products').select('*, categories(name)'),
      supabase.from('categories').select('*'),
      supabase.from('financial_transactions').select('*'),
      supabase.from('financial_accounts').select('*'),
      supabase.from('credit_accounts').select('*'),
      supabase.from('employees').select('*, departments(name)'),
      supabase.from('departments').select('*'),
      supabase.from('employee_attendance').select('*'),
      supabase.from('employee_leaves').select('*')
    ]);

    const salesList = sales || [];
    const saleItemsList = saleItems || [];
    const productsList = products || [];
    const categoriesList = categories || [];
    const transactionsList = transactions || [];
    const accountsList = accounts || [];
    const creditsList = credits || [];
    const employeesList = employees || [];
    const departmentsList = departments || [];
    const attendancesList = attendances || [];
    const leavesList = leaves || [];

    // ==========================================
    // 1. ANALÍTICA DE VENTAS
    // ==========================================
    const totalRevenue = salesList.reduce((acc, s) => acc + (s.status === 'Pagado' ? Number(s.total) : 0), 0);
    const totalOrders = salesList.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / (salesList.filter(s => s.status === 'Pagado').length || 1) : 0;
    const paidOrdersCount = salesList.filter(s => s.status === 'Pagado').length;
    const pendingOrdersCount = salesList.filter(s => s.status === 'Pendiente').length;

    // Ventas de los últimos 7 días
    const last7DaysMap = new Map<string, { total: number; count: number; dayLabel: string }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;
      last7DaysMap.set(dateStr, { total: 0, count: 0, dayLabel });
    }

    salesList.forEach(s => {
      const saleDate = s.created_at?.split('T')[0];
      if (saleDate && last7DaysMap.has(saleDate)) {
        const item = last7DaysMap.get(saleDate)!;
        item.total += Number(s.total);
        item.count += 1;
      }
    });

    const salesByDay = Array.from(last7DaysMap.entries()).map(([date, val]) => ({
      date,
      dayLabel: val.dayLabel,
      total: val.total,
      count: val.count
    }));

    // Ventas por categoría
    const categoryTotalsMap = new Map<string, number>();
    saleItemsList.forEach(item => {
      const catId = item.products?.category_id;
      const catObj = categoriesList.find(c => c.id === catId);
      const catName = catObj?.name || 'General';
      const current = categoryTotalsMap.get(catName) || 0;
      categoryTotalsMap.set(catName, current + Number(item.total));
    });

    const distinctColors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];
    let colorIdx = 0;
    const salesByCategory = Array.from(categoryTotalsMap.entries()).map(([categoryName, totalAmount]) => {
      const percentage = totalRevenue > 0 ? (totalAmount / totalRevenue) * 100 : 0;
      const color = distinctColors[colorIdx % distinctColors.length];
      colorIdx++;
      return {
        categoryName,
        totalAmount,
        percentage: Number(percentage.toFixed(1)),
        color
      };
    });

    // Top productos más vendidos
    const productSalesMap = new Map<string, { name: string; sku: string; units: number; revenue: number }>();
    saleItemsList.forEach(item => {
      const pId = item.product_id;
      const pName = item.products?.name || 'Producto';
      const pSku = item.products?.sku || '';
      const existing = productSalesMap.get(pId) || { name: pName, sku: pSku, units: 0, revenue: 0 };
      existing.units += Number(item.quantity);
      existing.revenue += Number(item.total);
      productSalesMap.set(pId, existing);
    });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({
        productName: p.name,
        sku: p.sku,
        unitsSold: p.units,
        revenue: p.revenue
      }));

    // ==========================================
    // 2. ANALÍTICA DE INVENTARIO
    // ==========================================
    const totalStockUnits = productsList.reduce((acc, p) => acc + Number(p.current_stock || 0), 0);
    const totalInventoryValuation = productsList.reduce(
      (acc, p) => acc + Number(p.current_stock || 0) * Number(p.cost || p.price * 0.6),
      0
    );
    const lowStockItemsCount = productsList.filter(p => Number(p.current_stock) <= Number(p.min_stock)).length;
    const outOfStockCount = productsList.filter(p => Number(p.current_stock) <= 0).length;

    // Stock y Valorización por Categoría
    const stockCatMap = new Map<string, { units: number; valuation: number }>();
    productsList.forEach(p => {
      const catName = p.categories?.name || 'Otras Familias';
      const curr = stockCatMap.get(catName) || { units: 0, valuation: 0 };
      curr.units += Number(p.current_stock || 0);
      curr.valuation += Number(p.current_stock || 0) * Number(p.cost || p.price * 0.6);
      stockCatMap.set(catName, curr);
    });

    const stockByCategory = Array.from(stockCatMap.entries()).map(([categoryName, data]) => ({
      categoryName,
      totalUnits: data.units,
      valuation: Number(data.valuation.toFixed(2))
    }));

    const criticalProducts = productsList
      .filter(p => Number(p.current_stock) <= Number(p.min_stock))
      .map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        current_stock: Number(p.current_stock),
        min_stock: Number(p.min_stock),
        deficit: Math.max(0, Number(p.min_stock) - Number(p.current_stock))
      }))
      .sort((a, b) => b.deficit - a.deficit)
      .slice(0, 6);

    // ==========================================
    // 3. ANALÍTICA DE FINANZAS
    // ==========================================
    const directIncome = transactionsList
      .filter(t => t.flow_type === 'INGRESO' && t.status === 'Pagado')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const totalIncome = directIncome + totalRevenue;

    const totalExpenses = transactionsList
      .filter(t => t.flow_type === 'EGRESO' && t.status === 'Pagado')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const netCashFlow = totalIncome - totalExpenses;
    const totalBankBalances = accountsList.reduce((acc, a) => acc + Number(a.current_balance || 0), 0);

    const receivablesTotal = creditsList
      .filter(c => c.type === 'POR_COBRAR' && c.status !== 'Pagado')
      .reduce((acc, c) => acc + (Number(c.total_amount) - Number(c.paid_amount || 0)), 0);

    const payablesTotal = creditsList
      .filter(c => c.type === 'POR_PAGAR' && c.status !== 'Pagado')
      .reduce((acc, c) => acc + (Number(c.total_amount) - Number(c.paid_amount || 0)), 0);

    // Desglose de Gastos por Categoría
    const expenseCatMap = new Map<string, number>();
    transactionsList
      .filter(t => t.flow_type === 'EGRESO' && t.status === 'Pagado')
      .forEach(t => {
        const cat = t.category || 'Otros';
        const cur = expenseCatMap.get(cat) || 0;
        expenseCatMap.set(cat, cur + Number(t.amount));
      });

    const expensesByCategory = Array.from(expenseCatMap.entries()).map(([category, total]) => ({
      category,
      total,
      percentage: totalExpenses > 0 ? Number(((total / totalExpenses) * 100).toFixed(1)) : 0
    }));

    // ==========================================
    // 4. ANALÍTICA DE RRHH
    // ==========================================
    const totalEmployees = employeesList.length;
    const totalPayroll = employeesList.reduce((acc, e) => acc + Number(e.salary || 0), 0);
    const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

    const deptMap = new Map<string, { headcount: number; payroll: number }>();
    employeesList.forEach(e => {
      const dName = e.departments?.name || 'Sin Asignar';
      const cur = deptMap.get(dName) || { headcount: 0, payroll: 0 };
      cur.headcount += 1;
      cur.payroll += Number(e.salary || 0);
      deptMap.set(dName, cur);
    });

    const employeesByDepartment = Array.from(deptMap.entries()).map(([departmentName, d]) => ({
      departmentName,
      headcount: d.headcount,
      payrollTotal: d.payroll
    }));

    const totalAtt = attendancesList.length;
    const punctualAtt = attendancesList.filter(a => a.status === 'Puntual').length;
    const punctualityRate = totalAtt > 0 ? Math.round((punctualAtt / totalAtt) * 100) : 100;
    const activeLeavesCount = leavesList.filter(l => l.status === 'Pendiente').length;

    return {
      sales: {
        totalRevenue,
        totalOrders,
        averageTicket,
        paidOrdersCount,
        pendingOrdersCount,
        salesByDay,
        salesByCategory,
        topSellingProducts
      },
      inventory: {
        totalStockUnits,
        totalInventoryValuation,
        lowStockItemsCount,
        outOfStockCount,
        stockByCategory,
        criticalProducts
      },
      finance: {
        totalIncome,
        totalExpenses,
        netCashFlow,
        totalBankBalances,
        receivablesTotal,
        payablesTotal,
        expensesByCategory
      },
      rrhh: {
        totalEmployees,
        totalPayroll,
        averageSalary,
        employeesByDepartment,
        punctualityRate,
        activeLeavesCount
      }
    };
  }
};

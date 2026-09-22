import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar, 
  Download,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { biService, BiConsolidatedMetrics } from '../../services/biService';

interface BiViewProps {
  activeSubmodule: string;
}

export const BiView: React.FC<BiViewProps> = ({ activeSubmodule }) => {
  const [data, setData] = useState<BiConsolidatedMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'30d' | 'q2' | 'year'>('30d');

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await biService.getConsolidatedBiMetrics();
      setData(metrics);
    } catch (err: any) {
      console.error('Error cargando métricas BI:', err);
      setError(err.message || 'Error al conectar con la base de datos para generar reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeSubmodule === 'bi_ventas') {
      csvContent += 'Fecha,Dia,Ventas Soles,Ordenes\n';
      data.sales.salesByDay.forEach(row => {
        csvContent += `${row.date},${row.dayLabel},${row.total},${row.count}\n`;
      });
    } else if (activeSubmodule === 'bi_inventario') {
      csvContent += 'Familia,Unidades,Valorizacion Soles\n';
      data.inventory.stockByCategory.forEach(row => {
        csvContent += `${row.categoryName},${row.totalUnits},${row.valuation}\n`;
      });
    } else if (activeSubmodule === 'bi_finanzas') {
      csvContent += 'Metrica,Monto Soles\n';
      csvContent += `Ingresos Totales,${data.finance.totalIncome}\n`;
      csvContent += `Egresos Totales,${data.finance.totalExpenses}\n`;
      csvContent += `Flujo Neto,${data.finance.netCashFlow}\n`;
      csvContent += `Cuentas por Cobrar,${data.finance.receivablesTotal}\n`;
      csvContent += `Cuentas por Pagar,${data.finance.payablesTotal}\n`;
    } else {
      csvContent += 'Departamento,Colaboradores,Planilla Soles\n';
      data.rrhh.employeesByDepartment.forEach(row => {
        csvContent += `${row.departmentName},${row.headcount},${row.payrollTotal}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_bi_${activeSubmodule}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <h3 className="font-bold text-sm text-slate-800">Procesando Inteligencia de Negocios (BI)...</h3>
        <p className="text-xs text-slate-400">Calculando indicadores financieros, rotación y ventas desde Supabase</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 text-rose-700 text-xs space-y-2">
        <p className="font-bold text-sm">No se pudieron consolidar las métricas de BI</p>
        <p>{error}</p>
        <button onClick={loadMetrics} className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-semibold">
          Reintentar
        </button>
      </div>
    );
  }

  // Cálculos dinámicos de escala para los gráficos de ventas
  const maxSaleDay = Math.max(...data.sales.salesByDay.map(d => d.total), 100);

  return (
    <div className="space-y-6">
      {/* Barra Superior con Controles */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {activeSubmodule === 'bi_ventas' && 'Analítica Avanzada de Ventas y Demanda'}
            {activeSubmodule === 'bi_inventario' && 'Valorización y Control de Stock en Almacenes'}
            {activeSubmodule === 'bi_finanzas' && 'Rendimiento, Flujo de Caja y Márgenes Financieros'}
            {activeSubmodule === 'bi_rrhh' && 'Productividad, Asistencia y Masa Salarial de Personal'}
          </h2>
          <p className="text-xs text-slate-500">Métricas consolidadas en tiempo real para toma estratégica de decisiones</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-medium"
          >
            <option value="30d">Últimos 30 días</option>
            <option value="q2">Trimestre Actual (Q2)</option>
            <option value="year">Año Fiscal 2025</option>
          </select>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>

          <button 
            onClick={loadMetrics}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. BI VENTAS */}
      {/* ========================================================= */}
      {activeSubmodule === 'bi_ventas' && (
        <div className="space-y-6">
          {/* Tarjetas KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Facturación Real</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                S/ {data.sales.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {data.sales.paidOrdersCount} pedidos pagados
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Ticket Promedio</span>
              <p className="text-2xl font-bold text-blue-600 mt-1 font-mono">
                S/ {data.sales.averageTicket.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">Por comprobante emitido</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Pedidos Pendientes de Cobro</span>
              <p className="text-2xl font-bold text-amber-600 mt-1 font-mono">
                {data.sales.pendingOrdersCount}
              </p>
              <span className="text-xs text-amber-600 font-semibold mt-1 block">Órdenes a crédito o caja abierta</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total de Transacciones</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
                {data.sales.totalOrders}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">Historial global en POS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gráfico de Barras de Ventas Recientes */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Evolución Diaria de Ventas (Últimos 7 Días)
                </h3>
                <span className="text-xs text-slate-400 font-medium">Montos en Soles (S/)</span>
              </div>

              <div className="h-64 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100">
                {data.sales.salesByDay.map((day, idx) => {
                  const heightPercent = maxSaleDay > 0 ? (day.total / maxSaleDay) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        S/ {day.total.toFixed(0)}
                      </span>
                      <div className="w-full max-w-[48px] bg-blue-50 rounded-t-xl relative overflow-hidden h-full flex items-end">
                        <div 
                          className="w-full bg-blue-600 rounded-t-xl transition-all duration-700 hover:bg-blue-700" 
                          style={{ height: `${Math.max(heightPercent, 6)}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] text-slate-600 font-semibold">{day.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Participación por Categoría */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Ventas por Categoría
              </h3>

              <div className="space-y-3 pt-2">
                {data.sales.salesByCategory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No hay ventas desglosadas por categoría aún.</p>
                ) : (
                  data.sales.salesByCategory.map((cat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{cat.categoryName}</span>
                        <span className="text-slate-900 font-mono">S/ {cat.totalAmount.toFixed(2)} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Top 3 Productos */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Productos Más Vendidos
                </h4>
                <div className="space-y-2">
                  {data.sales.topSellingProducts.slice(0, 3).map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800">{prod.productName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{prod.sku}</span>
                      </div>
                      <span className="font-bold text-emerald-600 font-mono">{prod.unitsSold} uds</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BI INVENTARIO */}
      {/* ========================================================= */}
      {activeSubmodule === 'bi_inventario' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Unidades en Stock Global</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {data.inventory.totalStockUnits.toLocaleString()}
              </p>
              <span className="text-xs text-blue-600 font-semibold mt-1 block">Artículos en todos los depósitos</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Valorización Total Almacén</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                S/ {data.inventory.totalInventoryValuation.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">Costo total inmovilizado</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Productos en Stock Crítico</span>
              <p className="text-2xl font-bold text-amber-600 mt-1 font-mono">
                {data.inventory.lowStockItemsCount}
              </p>
              <span className="text-xs text-amber-600 font-semibold mt-1 block">Stock ≤ Mínimo requerido</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Agotados (Quiebre de Stock)</span>
              <p className="text-2xl font-bold text-rose-600 mt-1 font-mono">
                {data.inventory.outOfStockCount}
              </p>
              <span className="text-xs text-rose-600 font-semibold mt-1 block">Requieren compra inmediata</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Valorización por Familia de Producto */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Valorización de Inventario por Categoría
              </h3>
              <div className="space-y-4">
                {data.inventory.stockByCategory.map((cat, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{cat.categoryName}</h4>
                      <p className="text-[11px] text-slate-400">{cat.totalUnits} unidades en existencias</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      S/ {cat.valuation.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Productos con Mayor Déficit */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Alerta de Reposición Prioritaria
              </h3>
              <div className="space-y-2.5">
                {data.inventory.criticalProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Todos los productos cuentan con niveles óptimos de stock.</p>
                ) : (
                  data.inventory.criticalProducts.map(prod => (
                    <div key={prod.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{prod.name}</span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: {prod.sku} • Stock Actual: <strong className="text-rose-600">{prod.current_stock}</strong> / Mín: {prod.min_stock}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px]">
                        Déficit: -{prod.deficit}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BI FINANZAS */}
      {/* ========================================================= */}
      {activeSubmodule === 'bi_finanzas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Ingresos Totales (Ventas + Otros)</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                + S/ {data.finance.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Egresos y Gastos Operativos</span>
              <p className="text-2xl font-bold text-rose-600 mt-1 font-mono">
                - S/ {data.finance.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Flujo de Caja Neto</span>
              <p className={`text-2xl font-bold mt-1 font-mono ${data.finance.netCashFlow >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                {data.finance.netCashFlow >= 0 ? '+' : ''} S/ {data.finance.netCashFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Saldo en Bancos y Cajas</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                S/ {data.finance.totalBankBalances.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liquidez y Créditos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                Posición Crediticia Neta
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-800">Cuentas por Cobrar (Clientes)</span>
                    <p className="text-[11px] text-emerald-600">Liquidez a ingresar al negocio</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-700 font-mono">
                    + S/ {data.finance.receivablesTotal.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-rose-800">Cuentas por Pagar (Proveedores)</span>
                    <p className="text-[11px] text-rose-600">Compromisos de pago asumidos</p>
                  </div>
                  <span className="text-lg font-bold text-rose-700 font-mono">
                    - S/ {data.finance.payablesTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Estructura de Gastos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-rose-500" />
                Desglose de Gastos por Categoría
              </h3>
              <div className="space-y-3">
                {data.finance.expensesByCategory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No hay gastos clasificados aún.</p>
                ) : (
                  data.finance.expensesByCategory.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{exp.category}</span>
                        <span className="text-rose-600 font-mono font-bold">S/ {exp.total.toFixed(2)} ({exp.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                          style={{ width: `${exp.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BI RRHH */}
      {/* ========================================================= */}
      {activeSubmodule === 'bi_rrhh' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Colaboradores Activos</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {data.rrhh.totalEmployees}
              </p>
              <span className="text-xs text-blue-600 font-semibold mt-1 block">En planilla oficial</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Planilla Mensual Total</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                S/ {data.rrhh.totalPayroll.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">Compromiso salarial mensual</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Salario Promedio</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
                S/ {data.rrhh.averageSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">Por colaborador (FTE)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Índice de Puntualidad</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                {data.rrhh.punctualityRate}%
              </p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">Marcaciones a tiempo</span>
            </div>
          </div>

          {/* Distribución por Departamento */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Masa Salarial y Personal por Área Operativa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {data.rrhh.employeesByDepartment.map((dept, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{dept.departmentName}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-[10px]">
                      {dept.headcount} personas
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Gasto Salarial:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      S/ {dept.payrollTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Wallet,
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { MainModuleId } from '../../types';
import { biService, BiConsolidatedMetrics } from '../../services/biService';
import { salesService, SaleDb } from '../../services/salesService';
import { inventoryService, ProductDb } from '../../services/inventoryService';

interface DashboardViewProps {
  onNavigate: (module: MainModuleId, submodule?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');
  
  const [biData, setBiData] = useState<BiConsolidatedMetrics | null>(null);
  const [recentSales, setRecentSales] = useState<SaleDb[]>([]);
  const [products, setProducts] = useState<ProductDb[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metrics, sales, prods] = await Promise.all([
        biService.getConsolidatedBiMetrics(),
        salesService.getSales(),
        inventoryService.getProducts()
      ]);
      setBiData(metrics);
      setRecentSales(sales.slice(0, 5));
      setProducts(prods);
    } catch (err) {
      console.error('Error cargando Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const lowStockList = products.filter(p => Number(p.current_stock) <= Number(p.min_stock));

  // Ventas de los últimos días calculadas dinámicamente
  const salesChartDays = biData?.sales.salesByDay || [];
  const maxDayAmount = Math.max(...salesChartDays.map(d => d.total), 100);

  // Puntos coordenados para el SVG Path
  const svgWidth = 470;
  const svgHeight = 130;
  const chartPoints = salesChartDays.map((d, index) => {
    const x = 10 + (index * (svgWidth / Math.max(salesChartDays.length - 1, 1)));
    const y = svgHeight - (maxDayAmount > 0 ? (d.total / maxDayAmount) * 100 : 0);
    return { ...d, cx: x, cy: Math.max(15, Math.min(y, 120)) };
  });

  const pathD = chartPoints.length > 0 
    ? chartPoints.reduce((acc, pt, i) => i === 0 ? `M ${pt.cx} ${pt.cy}` : `${acc} L ${pt.cx} ${pt.cy}`, '')
    : 'M 10 110 L 470 110';

  const pathAreaD = chartPoints.length > 0
    ? `${pathD} L ${chartPoints[chartPoints.length - 1].cx} 160 L ${chartPoints[0].cx} 160 Z`
    : 'M 10 110 L 470 110 L 470 160 L 10 160 Z';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inicio / Dashboard Principal</h1>
            <p className="text-sm text-slate-500">Métricas consolidadas en tiempo real conectadas a Supabase</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button 
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date().toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Reales desde Supabase) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: Ventas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Ventas Pagadas</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            S/ {biData ? biData.sales.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <span className="flex items-center font-semibold">↑ {biData?.sales.paidOrdersCount || 0}</span>
            <span className="text-slate-400 font-normal">órdenes cobradas</span>
          </div>
        </div>

        {/* KPI 2: Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Unidades en stock</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {biData ? biData.inventory.totalStockUnits.toLocaleString() : '0'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <span className="flex items-center font-semibold">{products.length}</span>
            <span className="text-slate-400 font-normal">productos catálogo</span>
          </div>
        </div>

        {/* KPI 3: Colaboradores */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Equipo Humano</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {biData?.rrhh.totalEmployees || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-indigo-600">
            <span className="flex items-center font-semibold">{biData?.rrhh.punctualityRate || 100}%</span>
            <span className="text-slate-400 font-normal">puntualidad</span>
          </div>
        </div>

        {/* KPI 4: Stock Crítico Alertas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Stock Bajo Mínimo</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {lowStockList.length}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600">
            <span className="flex items-center font-semibold">Reponer</span>
            <span className="text-slate-400 font-normal">en compras</span>
          </div>
        </div>

        {/* KPI 5: Flujo Neto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-200 hover:shadow-md transition-all sm:col-span-2 md:col-span-1 xl:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-3 shadow-md shadow-teal-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Flujo Neto Tesorería</span>
          <div className={`text-2xl font-bold mt-1 font-mono ${(biData?.finance.netCashFlow || 0) >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
            S/ {biData ? biData.finance.netCashFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
            <span>Ingresos - Egresos</span>
          </div>
        </div>
      </div>

      {/* Row 2: Gráfico de Ventas SVG y Ventas por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart (Últimos 7 días interactivo) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Ventas Diarias (Últimos 7 días)</h2>
              {activePoint !== null && chartPoints[activePoint] && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {chartPoints[activePoint].dayLabel}: S/ {chartPoints[activePoint].total.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-medium">En vivo</span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-56 relative w-full pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-medium">
              <div className="border-b border-slate-100 pb-1">S/ {maxDayAmount.toFixed(0)}</div>
              <div className="border-b border-slate-100 pb-1">S/ {(maxDayAmount * 0.5).toFixed(0)}</div>
              <div className="border-b border-slate-100 pb-1">S/ 0</div>
            </div>

            <svg className="w-full h-44 overflow-visible" viewBox="0 0 490 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={pathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d={pathAreaD}
                fill="url(#salesGrad)"
              />
              {/* Puntos interactivos */}
              {chartPoints.map((item, i) => (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setActivePoint(i)} onMouseLeave={() => setActivePoint(null)}>
                  {activePoint === i && (
                    <circle cx={item.cx} cy={item.cy} r="8" fill="#93C5FD" opacity="0.5" />
                  )}
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    r={activePoint === i ? 6 : 4.5}
                    fill={activePoint === i ? '#1D4ED8' : '#2563eb'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                </g>
              ))}
            </svg>

            {/* X Labels */}
            <div className="flex justify-between text-[10px] text-slate-500 font-medium pt-2">
              {chartPoints.map((item, i) => (
                <span
                  key={i}
                  className={`cursor-pointer transition-colors ${activePoint === i ? 'text-blue-600 font-bold' : ''}`}
                  onMouseEnter={() => setActivePoint(i)}
                  onMouseLeave={() => setActivePoint(null)}
                >
                  {item.dayLabel}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ventas por Categoría */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-900 text-sm">Distribución de Facturación por Categoría</h2>
            <button onClick={() => onNavigate('bi', 'bi_ventas')} className="text-xs text-blue-600 hover:underline">
              Ver reporte completo →
            </button>
          </div>

          <div className="space-y-3.5 py-3">
            {biData?.sales.salesByCategory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No hay ventas desglosadas por categoría aún.</p>
            ) : (
              biData?.sales.salesByCategory.map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      {cat.categoryName}
                    </span>
                    <span className="text-slate-900 font-mono">
                      S/ {cat.totalAmount.toFixed(2)} ({cat.percentage}%)
                    </span>
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
        </div>
      </div>

      {/* Row 3: Acciones Rápidas, Últimas Ventas, Stock Bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Acciones Rápidas */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Accesos Directos</h2>

          <div className="grid grid-cols-2 gap-2.5">
            <button 
              onClick={() => onNavigate('ventas', 'pos')}
              className="p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Terminal POS</span>
              <span className="text-[9px] text-blue-600 font-medium">Vender</span>
            </button>

            <button 
              onClick={() => onNavigate('inventario', 'productos')}
              className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <Package className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Inventario</span>
              <span className="text-[9px] text-emerald-600 font-medium">Productos</span>
            </button>

            <button 
              onClick={() => onNavigate('compras', 'ordenes')}
              className="p-3 bg-purple-50/70 hover:bg-purple-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <FileText className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Compras</span>
              <span className="text-[9px] text-purple-600 font-medium">Órdenes OC</span>
            </button>

            <button 
              onClick={() => onNavigate('finanzas', 'ingresos')}
              className="p-3 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <Wallet className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Finanzas</span>
              <span className="text-[9px] text-amber-600 font-medium">Tesorería</span>
            </button>

            <button 
              onClick={() => onNavigate('rrhh', 'empleados')}
              className="p-3 bg-teal-50/70 hover:bg-teal-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <Users className="w-5 h-5 text-teal-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">RRHH</span>
              <span className="text-[9px] text-teal-600 font-medium">Nómina</span>
            </button>

            <button 
              onClick={() => onNavigate('bi', 'bi_ventas')}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-sm shadow-indigo-500/30"
            >
              <TrendingUp className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">Métricas BI</span>
              <span className="text-[9px] text-indigo-200 font-medium">Analítica</span>
            </button>
          </div>
        </div>

        {/* Últimas Ventas Reales */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-sm">Últimas Ventas Registradas</h2>
            <button 
              onClick={() => onNavigate('ventas', 'pedidos')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentSales.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay ventas registradas recientemente.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2.5"># Orden</th>
                    <th className="pb-2.5">Cliente</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5">Fecha</th>
                    <th className="pb-2.5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-medium text-blue-600 font-mono">#{sale.sale_number}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{sale.clients?.full_name || 'Cliente Mostrador'}</td>
                      <td className="py-2.5 font-bold text-slate-900 font-mono">S/ {Number(sale.total).toFixed(2)}</td>
                      <td className="py-2.5 text-slate-500">{sale.created_at.split('T')[0]}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.status === 'Pagado'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stock Bajo Real */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Alerta Stock Bajo</h2>
              {lowStockList.length > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {lowStockList.length} alertas
                </span>
              )}
            </div>
            <button 
              onClick={() => onNavigate('inventario', 'stock_minimo')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Ver todo →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {lowStockList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Todos los productos tienen niveles saludables de inventario.
              </div>
            ) : (
              lowStockList.slice(0, 5).map((prod) => (
                <div key={prod.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">
                      {prod.image_icon || '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Mín: {prod.min_stock} | Actual: <strong className="text-red-600">{prod.current_stock}</strong>
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onNavigate('compras', 'ordenes')}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    Reponer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

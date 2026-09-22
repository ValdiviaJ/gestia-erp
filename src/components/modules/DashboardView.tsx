import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { INITIAL_SALES, INITIAL_PRODUCTS, INITIAL_NOTIFICATIONS } from '../../data/mockData';
import { MainModuleId } from '../../types';

interface DashboardViewProps {
  onNavigate: (module: MainModuleId, submodule?: string) => void;
}

const SALES_DATA = [
  { day: 'Lun 2', amount: 3200, cx: 10, cy: 110 },
  { day: 'Mar 3', amount: 3800, cx: 80, cy: 98 },
  { day: 'Mié 4', amount: 4400, cx: 150, cy: 78 },
  { day: 'Jue 5', amount: 4800, cx: 230, cy: 70 },
  { day: 'Vie 6', amount: 4100, cx: 305, cy: 90 },
  { day: 'Sáb 7', amount: 4600, cx: 385, cy: 75 },
  { day: 'Dom 8', amount: 6200, cx: 470, cy: 30 }
];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inicio / Dashboard</h1>
            <p className="text-sm text-slate-500">Resumen general y métricas operativas de tu negocio</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Lun, 9 de Jun. 2025</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>¡Vamos por más!</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Responsive: 1 col mobile, 2 tablet, 3 small desktop, 5 full desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Ventas hoy</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">S/ 4,820</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <span className="flex items-center font-semibold">↑ 12%</span>
            <span className="text-slate-400 font-normal">vs. ayer (S/ 4,300)</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Productos en stock</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">248</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <span className="flex items-center font-semibold">↑ 5%</span>
            <span className="text-slate-400 font-normal">de 320 productos</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Clientes</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">156</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <span className="flex items-center font-semibold">↑ 8%</span>
            <span className="text-slate-400 font-normal">nuevos este mes</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-200 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Órdenes de compra</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">12</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600">
            <span className="flex items-center font-semibold">↑ 20%</span>
            <span className="text-slate-400 font-normal">pendientes de recepción</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-200 hover:shadow-md transition-all sm:col-span-2 md:col-span-1 xl:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-3 shadow-md shadow-teal-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Utilidad</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">S/ 1,260</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <span className="flex items-center font-semibold">↑ 15%</span>
            <span className="text-slate-400 font-normal">este mes</span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts and Notifications (from Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart (last 7 days with interactive Tooltip) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Ventas ({chartPeriod === '7d' ? 'últimos 7 días' : 'último mes'})</h2>
              {activePoint !== null && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md animate-fade-in">
                  {SALES_DATA[activePoint].day}: S/ {SALES_DATA[activePoint].amount.toLocaleString()}
                </span>
              )}
            </div>
            <div className="relative inline-block text-left">
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value as '7d' | '30d')}
                className="text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
              </select>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-56 relative w-full pt-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-medium">
              <div className="border-b border-slate-100 pb-1">S/ 8,000</div>
              <div className="border-b border-slate-100 pb-1">S/ 6,000</div>
              <div className="border-b border-slate-100 pb-1">S/ 4,000</div>
              <div className="border-b border-slate-100 pb-1">S/ 2,000</div>
              <div className="border-b border-slate-100 pb-1">S/ 0</div>
            </div>

            {/* SVG Path */}
            <svg className="w-full h-full overflow-visible pl-12 pb-6" viewBox="0 0 500 160">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 10 110 L 80 98 L 150 78 L 230 70 L 305 90 L 385 75 L 470 30"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 10 110 L 80 98 L 150 78 L 230 70 L 305 90 L 385 75 L 470 30 L 470 160 L 10 160 Z"
                fill="url(#salesGrad)"
              />
              {/* Interactive Hover Points */}
              {SALES_DATA.map((item, i) => (
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
            <div className="flex justify-between pl-12 text-[10px] text-slate-500 font-medium">
              {SALES_DATA.map((item, i) => (
                <span
                  key={i}
                  className={`cursor-pointer transition-colors ${activePoint === i ? 'text-blue-600 font-bold' : ''}`}
                  onMouseEnter={() => setActivePoint(i)}
                  onMouseLeave={() => setActivePoint(null)}
                >
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ventas por Categoría (Donut Chart con hover interactivo) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-900 text-sm">Ventas por categoría</h2>
            <span className="text-[11px] text-slate-400 font-medium">Junio 2025</span>
          </div>

          <div className="flex items-center justify-around py-3">
            {/* Donut representation */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="14" />
                <circle
                  cx="50" cy="50" r="38" fill="transparent"
                  stroke="#2563EB"
                  strokeWidth={activeCategory === 'Electrónicos' ? '18' : '14'}
                  strokeDasharray="238.7" strokeDashoffset="76" strokeLinecap="round"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setActiveCategory('Electrónicos')}
                  onMouseLeave={() => setActiveCategory(null)}
                />
                <circle
                  cx="50" cy="50" r="38" fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth={activeCategory === 'Ropa' ? '18' : '14'}
                  strokeDasharray="238.7" strokeDashoffset="180" strokeLinecap="round"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setActiveCategory('Ropa')}
                  onMouseLeave={() => setActiveCategory(null)}
                />
                <circle
                  cx="50" cy="50" r="38" fill="transparent"
                  stroke="#10B981"
                  strokeWidth={activeCategory === 'Hogar' ? '18' : '14'}
                  strokeDasharray="238.7" strokeDashoffset="210" strokeLinecap="round"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setActiveCategory('Hogar')}
                  onMouseLeave={() => setActiveCategory(null)}
                />
                <circle
                  cx="50" cy="50" r="38" fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth={activeCategory === 'Alimentos' ? '18' : '14'}
                  strokeDasharray="238.7" strokeDashoffset="225" strokeLinecap="round"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setActiveCategory('Alimentos')}
                  onMouseLeave={() => setActiveCategory(null)}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-800">
                  {activeCategory ? activeCategory : 'S/ 4,820'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeCategory ? 'Categoría' : 'Total ventas'}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              {[
                { name: 'Electrónicos', pct: '32%', color: 'bg-blue-600' },
                { name: 'Ropa', pct: '24%', color: 'bg-purple-500' },
                { name: 'Hogar', pct: '18%', color: 'bg-emerald-500' },
                { name: 'Alimentos', pct: '14%', color: 'bg-amber-500' },
                { name: 'Otros', pct: '12%', color: 'bg-slate-400' }
              ].map((cat) => (
                <div
                  key={cat.name}
                  onMouseEnter={() => setActiveCategory(cat.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                  className={`flex items-center justify-between gap-3 px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                    activeCategory === cat.name ? 'bg-slate-100 font-bold scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                    <span className="text-slate-600">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{cat.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notificaciones Panel */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Notificaciones</span>
            </h2>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Ver todas →</button>
          </div>

          <div className="space-y-3 mt-2">
            {INITIAL_NOTIFICATIONS.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay notificaciones pendientes
              </div>
            ) : (
              INITIAL_NOTIFICATIONS.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'sale' ? 'bg-emerald-50 text-emerald-600' :
                    item.type === 'stock' ? 'bg-amber-50 text-amber-600' :
                    item.type === 'purchase' ? 'bg-blue-50 text-blue-600' :
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    {item.type === 'sale' && <ShoppingCart className="w-4 h-4" />}
                    {item.type === 'stock' && <Package className="w-4 h-4" />}
                    {item.type === 'purchase' && <FileText className="w-4 h-4" />}
                    {item.type === 'employee' && <Users className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Acciones Rápidas, Últimas Ventas, Stock Bajo (Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Acciones Rápidas (6 tiles) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Acciones rápidas</h2>

          <div className="grid grid-cols-3 gap-2.5">
            <button 
              onClick={() => onNavigate('ventas', 'pos')}
              className="p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Nueva venta</span>
              <span className="text-[9px] text-blue-600 font-medium">(POS)</span>
            </button>

            <button 
              onClick={() => onNavigate('inventario', 'productos')}
              className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <Package className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Agregar</span>
              <span className="text-[9px] text-emerald-600 font-medium">(Inventario)</span>
            </button>

            <button 
              onClick={() => onNavigate('compras', 'ordenes')}
              className="p-3 bg-purple-50/70 hover:bg-purple-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <FileText className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Nueva orden</span>
              <span className="text-[9px] text-purple-600 font-medium">(Compras)</span>
            </button>

            <button 
              onClick={() => onNavigate('rrhh', 'empleados')}
              className="p-3 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <Users className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Personal</span>
              <span className="text-[9px] text-amber-600 font-medium">(RRHH)</span>
            </button>

            <button 
              onClick={() => onNavigate('bi', 'bi_ventas')}
              className="p-3 bg-teal-50/70 hover:bg-teal-100/70 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <TrendingUp className="w-5 h-5 text-teal-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-800">Reportes</span>
              <span className="text-[9px] text-teal-600 font-medium">(BI)</span>
            </button>

            <button 
              onClick={() => onNavigate('ia', 'asistente')}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-sm shadow-blue-500/30"
            >
              <Sparkles className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">Preguntar</span>
              <span className="text-[9px] text-blue-100 font-medium">(IA)</span>
            </button>
          </div>
        </div>

        {/* Últimas Ventas (Table) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-sm">Últimas ventas</h2>
            <button 
              onClick={() => onNavigate('ventas', 'pedidos')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </button>
          </div>

          <div className="overflow-x-auto">
            {INITIAL_SALES.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay ventas registradas recientemente.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2.5">#</th>
                    <th className="pb-2.5">Cliente</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5">Fecha</th>
                    <th className="pb-2.5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_SALES.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-medium text-slate-500">{sale.id}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{sale.client}</td>
                      <td className="py-2.5 font-medium text-slate-700">S/ {sale.total.toFixed(2)}</td>
                      <td className="py-2.5 text-slate-500">{sale.date}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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

        {/* Stock Bajo */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Stock bajo</h2>
              {INITIAL_PRODUCTS.filter(p => p.currentStock <= p.minStock).length > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {INITIAL_PRODUCTS.filter(p => p.currentStock <= p.minStock).length} alertas
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
            {INITIAL_PRODUCTS.slice(0, 5).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Todos los productos tienen stock saludable.
              </div>
            ) : (
              INITIAL_PRODUCTS.slice(0, 5).map((prod) => (
                <div key={prod.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">
                      {prod.image}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">Min: {prod.minStock} | Actual: <span className="text-red-500 font-bold">{prod.currentStock}</span></p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onNavigate('compras', 'ordenes')}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    aria-label={`Reponer producto ${prod.name}`}
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

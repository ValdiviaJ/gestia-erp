import React from 'react';
import { 
  BarChart, 
  TrendingUp, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  Calendar, 
  Download,
  Filter
} from 'lucide-react';

export const BiView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  return (
    <div className="space-y-6">
      {/* Top filter bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {activeSubmodule === 'bi_ventas' && 'Analítica Avanzada de Ventas'}
            {activeSubmodule === 'bi_inventario' && 'Rotación y Obsolescencia de Inventario'}
            {activeSubmodule === 'bi_finanzas' && 'Rendimiento y Márgenes Financieros'}
            {activeSubmodule === 'bi_rrhh' && 'Productividad y Eficiencia de Personal'}
          </h2>
          <p className="text-xs text-slate-500">Métricas analíticas para la toma estratégica de decisiones PYME</p>
        </div>

        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none">
            <option>Últimos 30 días</option>
            <option>Trimestre Actual (Q2)</option>
            <option>Año Fiscal 2025</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
            <Download className="w-4 h-4" /> Exportar BI
          </button>
        </div>
      </div>

      {/* BI Ventas */}
      {activeSubmodule === 'bi_ventas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Ingresos Totales</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">S/ 142,500</p>
              <span className="text-xs text-emerald-600 font-semibold">↑ 18.5% YoY</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Margen Bruto Promedio</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">42.8%</p>
              <span className="text-xs text-emerald-600 font-semibold">+2.1 pts</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Tasa de Conversión POS</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">68.4%</p>
              <span className="text-xs text-blue-600 font-semibold">Óptimo</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">CAC (Costo Adquisición)</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">S/ 14.20</p>
              <span className="text-xs text-emerald-600 font-semibold">-8.3%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Evolución de Ventas vs Meta Mensual</h3>
            <div className="h-64 flex items-end gap-3 pt-6 pb-2 border-b border-slate-200">
              {[
                { m: 'Ene', val: 65, meta: 60 },
                { m: 'Feb', val: 72, meta: 70 },
                { m: 'Mar', val: 88, meta: 80 },
                { m: 'Abr', val: 95, meta: 90 },
                { m: 'May', val: 110, meta: 100 },
                { m: 'Jun', val: 135, meta: 120 }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-blue-600">S/ {item.val}k</span>
                  <div className="w-full max-w-[40px] bg-blue-100 rounded-t-xl relative overflow-hidden h-full flex items-end">
                    <div 
                      className="w-full bg-blue-600 rounded-t-xl transition-all duration-500" 
                      style={{ height: `${(item.val / 140) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 font-semibold">{item.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BI Inventario */}
      {activeSubmodule === 'bi_inventario' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Índice de Rotación por Familia</h3>
            <div className="space-y-4">
              {[
                { cat: 'Electrónicos & Audio', days: '14 días promedio', rot: 'Alta', color: 'bg-emerald-500' },
                { cat: 'Ropa & Confección', days: '26 días promedio', rot: 'Media', color: 'bg-blue-500' },
                { cat: 'Hogar & Bazar', days: '45 días promedio', rot: 'Baja', color: 'bg-amber-500' },
                { cat: 'Alimentos', days: '8 días promedio', rot: 'Muy Alta', color: 'bg-emerald-600' }
              ].map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{r.cat}</span>
                    <span className="text-slate-500">{r.days}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color}`} style={{ width: i === 0 ? '85%' : i === 1 ? '60%' : i === 2 ? '35%' : '95%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BI Finanzas */}
      {activeSubmodule === 'bi_finanzas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 mb-2">EBITDA & Rentabilidad Neta</h3>
          <p className="text-xs text-slate-500">Margen EBITDA proyectado: 24.5% con cobertura de gastos fijos saludable.</p>
        </div>
      )}

      {/* BI RRHH */}
      {activeSubmodule === 'bi_rrhh' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 mb-2">Ingreso por Empleado (FTE)</h3>
          <p className="text-xs text-slate-500">Promedio mensual por colaborador: S/ 12,400 en ventas brutas.</p>
        </div>
      )}
    </div>
  );
};

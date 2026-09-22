import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Landmark, 
  PieChart, 
  FileText,
  Plus
} from 'lucide-react';

export const FinanzasView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  return (
    <div className="space-y-6">
      {/* Submodule: Ingresos */}
      {activeSubmodule === 'ingresos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registro de Ingresos y Facturación</h2>
              <p className="text-xs text-slate-500">Cobros comerciales, otros ingresos operativos y abonos bancarios</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700">
              <Plus className="w-4 h-4" /> Registrar Ingreso Extra
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Ingresos del Mes</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">S/ 48,920.00</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">↑ +14.2% vs mes anterior</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Cobranzas Pendientes</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">S/ 4,210.00</div>
              <span className="text-xs text-slate-400 mt-1 block">5 facturas por cobrar</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Ticket Promedio</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">S/ 185.30</div>
              <span className="text-xs text-slate-400 mt-1 block">264 transacciones</span>
            </div>
          </div>
        </div>
      )}

      {/* Submodule: Egresos */}
      {activeSubmodule === 'egresos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Egresos, Costos y Gastos Fijos</h2>
              <p className="text-xs text-slate-500">Planilla, alquiler de local, servicios públicos y pagos a proveedores</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700">
              <Plus className="w-4 h-4" /> Registrar Egreso
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Concepto</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Medio de Pago</th>
                  <th className="p-3.5 text-right">Monto</th>
                  <th className="p-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { concept: 'Pago a Proveedor TechSupply S.A.C.', cat: 'Mercadería', date: '08/06/2025', method: 'Transferencia BCP', amount: 6500.00, status: 'Pagado' },
                  { concept: 'Alquiler Local Comercial Tienda', cat: 'Gastos Fijos', date: '05/06/2025', method: 'Transferencia BBVA', amount: 3200.00, status: 'Pagado' },
                  { concept: 'Servicios de Energía Eléctrica (Luz del Sur)', cat: 'Servicios', date: '04/06/2025', method: 'Débito Automático', amount: 620.00, status: 'Pagado' },
                  { concept: 'Internet de Fibra Óptica Ópera', cat: 'Servicios', date: '02/06/2025', method: 'Tarjeta', amount: 240.00, status: 'Pagado' }
                ].map((eg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{eg.concept}</td>
                    <td className="p-3.5"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">{eg.cat}</span></td>
                    <td className="p-3.5 text-slate-500">{eg.date}</td>
                    <td className="p-3.5 text-slate-600">{eg.method}</td>
                    <td className="p-3.5 text-right font-bold text-red-600 font-mono">- S/ {eg.amount.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {eg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodule: Cuentas */}
      {activeSubmodule === 'cuentas' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cuentas Bancarias y Tesorería</h2>
              <p className="text-xs text-slate-500">Conciliación con bancos y saldos consolidados</p>
            </div>
            <button className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Vincular Cuenta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { bank: 'Banco de Crédito BCP', account: '193-9821829-0-45 (Soles)', balance: 28450.00, color: 'border-l-4 border-l-blue-600' },
              { bank: 'BBVA Perú', account: '0011-0245-0200849201 (Soles)', balance: 14200.50, color: 'border-l-4 border-l-indigo-600' },
              { bank: 'Interbank Negocios', account: '200-3001928472 (Dólares $)', balance: 3450.00, isUsd: true, color: 'border-l-4 border-l-emerald-600' }
            ].map((acc, i) => (
              <div key={i} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs ${acc.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{acc.bank}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{acc.account}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Saldo Disponible</span>
                  <div className="text-xl font-bold text-slate-900">
                    {acc.isUsd ? '$' : 'S/'} {acc.balance.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Flujo de Caja */}
      {activeSubmodule === 'flujo_caja' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Flujo de Caja Operativo</h2>
            <p className="text-xs text-slate-500">Saldo neto proyectado a 30 días: <span className="font-bold text-emerald-600">+S/ 18,450.00</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

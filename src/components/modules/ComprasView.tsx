import React, { useState } from 'react';
import { 
  Truck, 
  FileText, 
  CheckCircle, 
  Clock, 
  Search, 
  Plus, 
  Building2, 
  ClipboardCheck, 
  History as HistoryIcon 
} from 'lucide-react';

export const ComprasView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  const [suppliers] = useState([
    { id: 'PRV-01', name: 'TechSupply S.A.C.', ruc: '20608912441', contact: 'Mario Vargas', phone: '+51 984 551 290', category: 'Electrónicos', rating: '4.9 ★' },
    { id: 'PRV-02', name: 'Textiles Lima S.A.', ruc: '20104829102', contact: 'Lucía Benavides', phone: '+51 991 223 881', category: 'Ropa & Textiles', rating: '4.7 ★' },
    { id: 'PRV-03', name: 'Importaciones Andinas EIRL', ruc: '20491029481', contact: 'Carlos Soto', phone: '+51 965 332 119', category: 'Hogar & Bazar', rating: '4.8 ★' },
    { id: 'PRV-04', name: 'Distribuidora Central Gastronómica', ruc: '20501928374', contact: 'Rosa Paredes', phone: '+51 972 884 190', category: 'Alimentos', rating: '4.6 ★' },
  ]);

  const [orders] = useState([
    { id: 'OC-0012', supplier: 'TechSupply S.A.C.', date: '08/06/2025', items: 'Audífonos Bluetooth Pro ANC (50 und)', total: 6500.00, status: 'Pendiente de Recepción' },
    { id: 'OC-0011', supplier: 'Textiles Lima S.A.', date: '05/06/2025', items: 'Camisetas Algodón Pima (100 und)', total: 2800.00, status: 'Completado' },
    { id: 'OC-0010', supplier: 'Importaciones Andinas EIRL', date: '01/06/2025', items: 'Botellas Térmicas Inox (80 und)', total: 1920.00, status: 'Completado' },
    { id: 'OC-0009', supplier: 'Distribuidora Central', date: '28/05/2025', items: 'Pack Café Gourmet (60 und)', total: 1350.00, status: 'Completado' },
  ]);

  return (
    <div className="space-y-6">
      {/* Submodule: Proveedores */}
      {activeSubmodule === 'proveedores' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Directorio de Proveedores Homologados</h2>
              <p className="text-xs text-slate-500">Contactos comerciales, plazos de pago y evaluación de cumplimiento</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Registrar Proveedor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{s.name}</h3>
                      <p className="text-xs font-mono text-slate-500">RUC: {s.ruc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{s.rating}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contacto:</span>
                    <span className="font-medium text-slate-800">{s.contact}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Teléfono:</span>
                    <span className="font-medium text-slate-800">{s.phone}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-slate-400 block text-[10px]">Especialidad:</span>
                    <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">{s.category}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">Generar Orden</button>
                  <button className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold">Ver Catálogo</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Órdenes de Compra */}
      {activeSubmodule === 'ordenes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Órdenes de Compra (OC)</h2>
              <p className="text-xs text-slate-500">Emisión de órdenes de suministro y cronograma de entregas</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Nueva Orden de Compra
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Código OC</th>
                  <th className="p-3.5">Proveedor</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Detalle Items</th>
                  <th className="p-3.5 text-right">Importe Total</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{o.id}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{o.supplier}</td>
                    <td className="p-3.5 text-slate-500">{o.date}</td>
                    <td className="p-3.5 text-slate-700">{o.items}</td>
                    <td className="p-3.5 text-right font-bold text-slate-900">S/ {o.total.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold">Ver Detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodule: Recepciones */}
      {activeSubmodule === 'recepciones' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recepción y Control de Calidad en Almacén</h2>
              <p className="text-xs text-slate-500">Conteo físico vs factura de compra e ingreso automático al Kardex</p>
            </div>
            <button className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700">
              Auditar Guía de Remisión
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="border border-dashed border-blue-300 bg-blue-50/50 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-blue-900">OC-0012 en muelle de descarga</span>
                <p className="text-xs text-blue-700">Proveedor: TechSupply S.A.C. - 50 und Audífonos ANC</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                Confirmar Ingreso a Kardex
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodule: Historial */}
      {activeSubmodule === 'historial' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Histórico de Adquisiciones</h2>
            <p className="text-xs text-slate-500">Resumen acumulado del año fiscal 2025: S/ 142,850 en compras de mercadería</p>
          </div>
        </div>
      )}
    </div>
  );
};

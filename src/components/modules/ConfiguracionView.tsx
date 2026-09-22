import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  History, 
  Sliders, 
  Plus, 
  Check, 
  Lock,
  Eye
} from 'lucide-react';

export const ConfiguracionView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  const [users] = useState([
    { id: 'USR-01', name: 'Carlos López', email: 'clopez@empresa.com', role: 'Super Admin', status: 'Activo', lastLogin: 'Hace 5 min' },
    { id: 'USR-02', name: 'Ana Torres', email: 'atorres@empresa.com', role: 'Cajero / Ventas', status: 'Activo', lastLogin: 'Hace 10 min' },
    { id: 'USR-03', name: 'Luis Pérez', email: 'lperez@empresa.com', role: 'Almacenero', status: 'Activo', lastLogin: 'Hace 1 h' },
    { id: 'USR-04', name: 'María Gómez', email: 'mgomez@empresa.com', role: 'Contador / Finanzas', status: 'Activo', lastLogin: 'Ayer' },
  ]);

  return (
    <div className="space-y-6">
      {/* Submodule: Usuarios */}
      {activeSubmodule === 'usuarios' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestión de Usuarios del Sistema</h2>
              <p className="text-xs text-slate-500">Crea cuentas de acceso, asigna correos corporativos y controla accesos</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Nuevo Usuario
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Usuario</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Rol Asignado</th>
                  <th className="p-3.5">Último Ingreso</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5">
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{u.lastLogin}</td>
                    <td className="p-3.5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold">Configurar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodule: Roles */}
      {activeSubmodule === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Roles y Niveles de Jerarquía</h2>
              <p className="text-xs text-slate-500">Define plantillas de seguridad por puesto de trabajo</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Crear Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Super Administrador', desc: 'Acceso total a todos los módulos y ajustes financieros', users: 1 },
              { name: 'Cajero / POS', desc: 'Acceso restringido a ventas, apertura/cierre de caja y clientes', users: 2 },
              { name: 'Almacenero / Logística', desc: 'Gestión de inventario, Kardex, transferencias y recepción', users: 3 },
              { name: 'Contador / Auditor', desc: 'Acceso a finanzas, facturas electrónicas, reportes y BI', users: 1 }
            ].map((r, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">{r.name}</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">{r.users} usuarios</span>
                </div>
                <p className="text-xs text-slate-500">{r.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button className="text-xs text-blue-600 font-semibold hover:underline">Editar Permisos</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Permisos */}
      {activeSubmodule === 'permisos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Matriz de Permisos por Módulo</h2>
            <p className="text-xs text-slate-500">Configura la visibilidad y capacidad de edición para los 9 módulos funcionales</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Módulo</th>
                  <th className="p-3 text-center">Super Admin</th>
                  <th className="p-3 text-center">Cajero POS</th>
                  <th className="p-3 text-center">Almacenero</th>
                  <th className="p-3 text-center">Contador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {['Dashboard', 'Inventario', 'Ventas / POS', 'Compras', 'RRHH', 'Finanzas', 'BI / Reportes', 'IA Copilot', 'Configuración'].map((mod, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{mod}</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Total</td>
                    <td className="p-3 text-center text-slate-600">{mod === 'Ventas / POS' || mod === 'Dashboard' ? '✓ Permitido' : '— Sin acceso'}</td>
                    <td className="p-3 text-center text-slate-600">{mod === 'Inventario' || mod === 'Compras' ? '✓ Permitido' : '— Sin acceso'}</td>
                    <td className="p-3 text-center text-slate-600">{mod === 'Finanzas' || mod === 'BI / Reportes' ? '✓ Permitido' : '— Sin acceso'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodule: Auditoria */}
      {activeSubmodule === 'auditoria' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Bitácora de Auditoría (Audit Log)</h2>
            <p className="text-xs text-slate-500">Monitoreo inalterable de accesos y modificaciones en la plataforma</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
            {[
              { time: '09/06/2025 21:05', user: 'Carlos López', action: 'Modificó precio de venta de PRD-001 (Audífonos Bluetooth)' },
              { time: '09/06/2025 18:40', user: 'Ana Torres', action: 'Completó cobro de boleta B001-0452 por S/ 230.00' },
              { time: '09/06/2025 14:12', user: 'Luis Pérez', action: 'Recepcionó 50 unidades de Teclado Mecánico en Kardex' },
              { time: '09/06/2025 10:00', user: 'Carlos López', action: 'Inició sesión desde IP 190.234.12.80 (Lima, Perú)' }
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2.5 hover:bg-slate-50 rounded-lg">
                <div>
                  <span className="font-semibold text-slate-900">{log.user}: </span>
                  <span className="text-slate-600">{log.action}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Ajustes */}
      {activeSubmodule === 'ajustes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Datos de la Empresa y Facturación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Razón Social</label>
                <input type="text" defaultValue="COMERCIAL PYME PERÚ S.A.C." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">RUC</label>
                <input type="text" defaultValue="20608912384" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Moneda Principal</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <option>PEN - Soles Peruanos (S/)</option>
                  <option>USD - Dólares Americanos ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Tasa IGV General</label>
                <input type="text" defaultValue="18%" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

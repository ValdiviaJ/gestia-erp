import React, { useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Palmtree, 
  GraduationCap, 
  Plus, 
  Clock, 
  CheckCircle2, 
  UserPlus,
  BadgeCheck 
} from 'lucide-react';

export const RrhhView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  const [employees] = useState([
    { id: 'EMP-01', name: 'Carlos López', role: 'Administrador General', dept: 'Gerencia', email: 'clopez@empresa.com', status: 'Activo', salary: 4500 },
    { id: 'EMP-02', name: 'Luis Pérez', role: 'Jefe de Almacén', dept: 'Operaciones', email: 'lperez@empresa.com', status: 'Activo', salary: 2800 },
    { id: 'EMP-03', name: 'Ana Torres', role: 'Cajera Principal', dept: 'Ventas', email: 'atorres@empresa.com', status: 'Activo', salary: 1800 },
    { id: 'EMP-04', name: 'Carla Mendoza', role: 'Asesora Comercial', dept: 'Ventas', email: 'cmendoza@empresa.com', status: 'Activo', salary: 2100 },
    { id: 'EMP-05', name: 'Roberto Dávila', role: 'Supervisor Logístico', dept: 'Operaciones', email: 'rdavila@empresa.com', status: 'Activo', salary: 2600 }
  ]);

  return (
    <div className="space-y-6">
      {/* Submodule: Empleados */}
      {activeSubmodule === 'empleados' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Nómina de Colaboradores</h2>
              <p className="text-xs text-slate-500">Gestión de contratos, cargos, salarios y legajo digital</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              <UserPlus className="w-4 h-4" /> Registrar Colaborador
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => (
              <div key={emp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                      <p className="text-xs text-blue-600 font-medium">{emp.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {emp.status}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Área:</span>
                    <span className="font-medium text-slate-800">{emp.dept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700 truncate max-w-[160px]">{emp.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remuneración:</span>
                    <span className="font-bold text-slate-900">S/ {emp.salary.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-3">
                  <button className="text-xs text-blue-600 font-semibold hover:underline">Ver Ficha</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Asistencia */}
      {activeSubmodule === 'asistencia' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Control de Asistencia y Puntualidad</h2>
              <p className="text-xs text-slate-500">Marcaciones biométricas y registro de tardanzas / horas extra</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg font-semibold">
              96% Puntualidad Hoy
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Colaborador</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Hora Ingreso</th>
                  <th className="p-3.5">Hora Salida</th>
                  <th className="p-3.5 text-center">Horas Efectivas</th>
                  <th className="p-3.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Ana Torres', date: '09/06/2025', in: '08:55 AM', out: '06:02 PM', total: '8.1 h', status: 'Puntual' },
                  { name: 'Luis Pérez', date: '09/06/2025', in: '08:50 AM', out: '06:15 PM', total: '8.4 h', status: 'Puntual' },
                  { name: 'Roberto Dávila', date: '09/06/2025', in: '09:12 AM', out: '06:30 PM', total: '8.3 h', status: 'Tardanza (12 min)' },
                  { name: 'Carla Mendoza', date: '09/06/2025', in: '08:58 AM', out: '06:00 PM', total: '8.0 h', status: 'Puntual' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{row.name}</td>
                    <td className="p-3.5 text-slate-500">{row.date}</td>
                    <td className="p-3.5 font-mono text-emerald-700 font-medium">{row.in}</td>
                    <td className="p-3.5 font-mono text-slate-700">{row.out}</td>
                    <td className="p-3.5 text-center font-bold text-slate-800">{row.total}</td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status.includes('Tardanza') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodule: Vacaciones */}
      {activeSubmodule === 'vacaciones' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Programación de Vacaciones y Descansos</h2>
              <p className="text-xs text-slate-500">Días acumulados, descansos médicos y solicitudes pendientes</p>
            </div>
            <button className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Solicitar Permiso
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Solicitudes Pendientes de Aprobación</h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">Roberto Dávila</span>
                    <p className="text-slate-500">15 Jun 2025 - 22 Jun 2025 (7 días)</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-semibold text-[11px]">Aprobar</button>
                    <button className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px]">Rechazar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submodule: Capacitaciones */}
      {activeSubmodule === 'capacitaciones' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Plan de Capacitación y Desarrollo</h2>
              <p className="text-xs text-slate-500">Cursos de servicio al cliente, seguridad industrial y normativas</p>
            </div>
            <button className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Programar Taller
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Atención al Cliente y Cierre de Ventas', instructor: 'Consultora Nexo', date: '18 Jun 2025', enrolled: '12 participantes', status: 'En curso' },
              { title: 'Seguridad y Salud en el Trabajo (SST)', instructor: 'Ing. Carlos Medina', date: '25 Jun 2025', enrolled: '34 participantes', status: 'Próximo' }
            ].map((c, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{c.status}</span>
                  <span className="text-xs text-slate-400">{c.date}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-500">Instructor: {c.instructor} | {c.enrolled}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

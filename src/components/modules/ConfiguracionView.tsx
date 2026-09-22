import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  History, 
  Sliders, 
  Plus, 
  Check, 
  Lock,
  Eye,
  Save,
  Building,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  Search
} from 'lucide-react';
import { 
  configService, 
  CompanySettingsDb, 
  RoleDb, 
  ProfileDb, 
  AuditLogDb,
  PERMISSION_MATRIX_DATA 
} from '../../services/configService';

interface ConfiguracionViewProps {
  activeSubmodule: string;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({ activeSubmodule }) => {
  const [settings, setSettings] = useState<CompanySettingsDb | null>(null);
  const [roles, setRoles] = useState<RoleDb[]>([]);
  const [profiles, setProfiles] = useState<ProfileDb[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDb[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtro de auditoría
  const [auditSearch, setAuditSearch] = useState('');

  // Modales
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: 'Gestia2026*',
    roleId: ''
  });

  // Carga de configuración
  const loadConfigData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      // 1. Sincronizar perfiles primero para asegurar que el usuario activo esté en la BD
      const profs = await configService.getProfiles();
      const [sets, rols, logs] = await Promise.all([
        configService.getCompanySettings(),
        configService.getRoles(),
        configService.getAuditLogs()
      ]);
      setProfiles(profs);
      setSettings(sets);
      setRoles(rols);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Error cargando configuración:', err);
      setErrorMsg(err.message || 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigData();
  }, []);

  // Guardar datos de la empresa
  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSavingSettings(true);
      setSuccessMsg(null);
      const updated = await configService.updateCompanySettings(settings);
      setSettings(updated);
      setSuccessMsg('Datos de la empresa y facturación guardados correctamente en Supabase.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  // Crear nuevo rol
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      await configService.createRole(newRoleName, newRoleDesc);
      setIsRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      loadConfigData();
    } catch (err: any) {
      alert(`Error al crear rol: ${err.message}`);
    }
  };

  // Cambiar estado de usuario (Activo / Suspendido / Inactivo)
  const handleToggleUserStatus = async (p: ProfileDb) => {
    const nextStatus = p.status === 'Activo' ? 'Suspendido' : 'Activo';
    
    // Actualización optimista inmediata en la UI
    setProfiles(prev => prev.map(item => item.id === p.id ? { ...item, status: nextStatus } : item));
    
    try {
      await configService.updateProfileStatus(p.id, nextStatus);
      setSuccessMsg(`Usuario ${p.full_name || p.email} marcado como ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadConfigData();
    } catch (err: any) {
      alert(`Error actualizando usuario: ${err.message}`);
      loadConfigData(); // revertir si falló
    }
  };

  // Asignar rol a perfil
  const handleRoleChange = async (profileId: string, roleId: string) => {
    // Actualización optimista inmediata en la UI
    const targetRole = roles.find(r => r.id === roleId);
    setProfiles(prev => prev.map(item => item.id === profileId ? { 
      ...item, 
      role_id: roleId,
      roles: targetRole ? { id: targetRole.id, name: targetRole.name, description: targetRole.description } : undefined 
    } : item));

    try {
      await configService.updateProfileRole(profileId, roleId);
      setSuccessMsg(`Rol actualizado correctamente.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadConfigData();
    } catch (err: any) {
      alert(`Error asignando rol: ${err.message}`);
      loadConfigData(); // revertir si falló
    }
  };

  // Crear nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.fullName) {
      alert('Complete los campos obligatorios');
      return;
    }
    try {
      await configService.registerNewUser(newUser);
      setIsUserModalOpen(false);
      setNewUser({
        fullName: '',
        email: '',
        password: 'Gestia2026*',
        roleId: ''
      });
      setSuccessMsg('Usuario creado exitosamente con credenciales habilitadas.');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadConfigData();
    } catch (err: any) {
      alert(`Error creando usuario: ${err.message}`);
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.entity.toLowerCase().includes(auditSearch.toLowerCase()) ||
    (log.user_email && log.user_email.toLowerCase().includes(auditSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Alerta de Éxito */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Alerta de Error */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: USUARIOS */}
      {/* ========================================================= */}
      {activeSubmodule === 'usuarios' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestión de Usuarios del Sistema</h2>
              <p className="text-xs text-slate-500">Cuentas vinculadas a Supabase Auth, roles asignados y estados de acceso</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={loadConfigData}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Sincronizar
              </button>
              <button 
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Nuevo Usuario
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Usuario / Nombre</th>
                  <th className="p-3.5">Correo Corporativo</th>
                  <th className="p-3.5">Rol de Seguridad</th>
                  <th className="p-3.5">Último Acceso</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No hay perfiles de usuario adicionales registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  profiles.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{u.full_name || 'Usuario Gestia'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {u.id.slice(0, 8)}...</div>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{u.email}</td>
                      <td className="p-3.5">
                        <select 
                          value={u.role_id || ''}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-blue-700 font-semibold outline-none"
                        >
                          <option value="">Sin Rol Asignado</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {u.last_login ? new Date(u.last_login).toLocaleString('es-PE') : 'Recientemente'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Activo' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => handleToggleUserStatus(u)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                        >
                          {u.status === 'Activo' ? 'Suspender' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: ROLES & PERFILES */}
      {/* ========================================================= */}
      {activeSubmodule === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Roles y Niveles de Jerarquía</h2>
              <p className="text-xs text-slate-500">Plantillas de seguridad para control granular de accesos por cargo</p>
            </div>
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Crear Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map(r => {
              // Conteo reactivo exacto basado en los perfiles reales en memoria
              const assignedCount = profiles.filter(p => p.role_id === r.id).length;
              return (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-sm text-slate-900">{r.name}</h3>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                        {assignedCount} {assignedCount === 1 ? 'usuario' : 'usuarios'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{r.description || 'Perfil con privilegios asignados en el sistema'}</p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{r.is_system ? '🛡️ Rol del Sistema' : 'Personalizado'}</span>
                    <span className="text-blue-600 font-semibold">Activo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: MATRIZ DE PERMISOS */}
      {/* ========================================================= */}
      {activeSubmodule === 'permisos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Matriz de Permisos por Módulo</h2>
            <p className="text-xs text-slate-500">Configuración de visibilidad y privilegios operativos para los 9 módulos funcionales de Gestia</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Módulo Funcional</th>
                  <th className="p-3.5 text-center">Super Admin</th>
                  <th className="p-3.5 text-center">Cajero / POS</th>
                  <th className="p-3.5 text-center">Almacén</th>
                  <th className="p-3.5 text-center">Finanzas</th>
                  <th className="p-3.5 text-center">RRHH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_MATRIX_DATA.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      {item.name}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        ✓ Acceso Total
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {item.ventas ? (
                        <span className="text-emerald-600 font-bold text-[11px]">✓ Permitido</span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[11px]">— Restringido</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.almacen ? (
                        <span className="text-emerald-600 font-bold text-[11px]">✓ Permitido</span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[11px]">— Restringido</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.finanzas ? (
                        <span className="text-emerald-600 font-bold text-[11px]">✓ Permitido</span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[11px]">— Restringido</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.rrhh ? (
                        <span className="text-emerald-600 font-bold text-[11px]">✓ Permitido</span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[11px]">— Restringido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: AUDITORÍA (AUDIT LOGS) */}
      {/* ========================================================= */}
      {activeSubmodule === 'auditoria' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bitácora de Auditoría (Audit Log)</h2>
              <p className="text-xs text-slate-500">Trazabilidad inalterable de eventos, accesos y operaciones críticas</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Buscar por usuario o acción..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay registros de auditoría que coincidan con la búsqueda.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{log.user_email || 'Sistema'}: </span>
                      <span className="text-slate-700">{log.action}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Entidad: {log.entity}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.created_at).toLocaleString('es-PE')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: AJUSTES DE EMPRESA */}
      {/* ========================================================= */}
      {activeSubmodule === 'ajustes' && settings && (
        <form onSubmit={handleSaveCompanySettings} className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Datos de la Empresa y Facturación</h2>
              <p className="text-xs text-slate-500">Razón social, RUC, domicilios fiscales y parámetros de impuestos</p>
            </div>
            <button 
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Razón Social *</label>
                <input 
                  type="text" 
                  required
                  value={settings.company_name}
                  onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">RUC (Registro Único de Contribuyente) *</label>
                <input 
                  type="text" 
                  required
                  value={settings.ruc}
                  onChange={e => setSettings({ ...settings, ruc: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Representante Legal</label>
                <input 
                  type="text" 
                  value={settings.legal_representative || ''}
                  onChange={e => setSettings({ ...settings, legal_representative: e.target.value })}
                  placeholder="Ej. Ing. Carlos Medina"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Dirección Fiscal / Local Principal</label>
                <input 
                  type="text" 
                  value={settings.address || ''}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Av. Javier Prado Este 2450, Lima"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Correo de Facturación</label>
                <input 
                  type="email" 
                  value={settings.email || ''}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  placeholder="facturacion@empresa.pe"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Teléfono Comercial</label>
                <input 
                  type="tel" 
                  value={settings.phone || ''}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+51 984 123 456"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Moneda Principal</label>
                <select 
                  value={settings.currency_code}
                  onChange={e => setSettings({ 
                    ...settings, 
                    currency_code: e.target.value,
                    currency_symbol: e.target.value === 'USD' ? '$' : 'S/'
                  })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="PEN">PEN - Soles Peruanos (S/)</option>
                  <option value="USD">USD - Dólares Americanos ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Tasa de Impuesto IGV General (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  value={settings.tax_rate}
                  onChange={e => setSettings({ ...settings, tax_rate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono" 
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREAR ROL */}
      {/* ========================================================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Nuevo Rol de Seguridad
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre del Rol *</label>
                <input 
                  type="text" 
                  required
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="Ej. Auditor Externo, Supervisor de Tienda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descripción de Alcance</label>
                <textarea 
                  rows={3}
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  placeholder="Descripción de funciones y permisos permitidos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* MODAL: CREAR USUARIO */}
      {/* ========================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Crear Usuario del Sistema
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  required
                  value={newUser.fullName}
                  onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Ej. Ana Torres Quispe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correo Corporativo *</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="usuario@gestia.pe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contraseña Inicial</label>
                  <input 
                    type="text" 
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Gestia2026*"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rol de Seguridad</label>
                  <select 
                    value={newUser.roleId}
                    onChange={e => setNewUser({ ...newUser, roleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Palmtree, 
  GraduationCap, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  UserPlus,
  BadgeCheck,
  Search,
  Filter,
  Building,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  rrhhService, 
  EmployeeDb, 
  DepartmentDb, 
  EmployeeAttendanceDb, 
  EmployeeLeaveDb, 
  EmployeeTrainingDb,
  AttendanceStatus,
  LeaveType,
  LeaveStatus
} from '../../services/rrhhService';

interface RrhhViewProps {
  activeSubmodule: string;
}

export const RrhhView: React.FC<RrhhViewProps> = ({ activeSubmodule }) => {
  // ESTADOS DE DATOS
  const [employees, setEmployees] = useState<EmployeeDb[]>([]);
  const [departments, setDepartments] = useState<DepartmentDb[]>([]);
  const [attendances, setAttendances] = useState<EmployeeAttendanceDb[]>([]);
  const [leaves, setLeaves] = useState<EmployeeLeaveDb[]>([]);
  const [trainings, setTrainings] = useState<EmployeeTrainingDb[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // FILTROS Y BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // MODALES
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // FORMULARIOS TEMPORALES
  const [newEmployee, setNewEmployee] = useState({
    full_name: '',
    doc_number: '',
    role_job: '',
    department_id: '',
    email: '',
    phone: '',
    salary: 2000,
    hire_date: new Date().toISOString().split('T')[0],
    status: 'Activo' as const
  });

  const [newAttendance, setNewAttendance] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '08:50',
    check_out: '18:00',
    status: 'Puntual' as AttendanceStatus,
    notes: ''
  });

  const [newLeave, setNewLeave] = useState({
    employee_id: '',
    leave_type: 'Vacaciones' as LeaveType,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    days_count: 7,
    reason: ''
  });

  const [newTraining, setNewTraining] = useState({
    title: '',
    instructor: '',
    training_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    hours: 4,
    status: 'Programado' as const,
    attendee_ids: [] as string[]
  });

  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDesc, setNewDepartmentDesc] = useState('');

  // CARGA GENERAL
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [empData, deptData, attData, leaveData, trainData] = await Promise.all([
        rrhhService.getEmployees(),
        rrhhService.getDepartments(),
        rrhhService.getAttendance(),
        rrhhService.getLeaves(),
        rrhhService.getTrainings()
      ]);
      setEmployees(empData);
      setDepartments(deptData);
      setAttendances(attData);
      setLeaves(leaveData);
      setTrainings(trainData);
    } catch (err: any) {
      console.error('Error cargando RRHH:', err);
      setErrorMsg(err.message || 'Error al conectar con la base de datos de RRHH');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // HANDLERS DE CREACIÓN
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.full_name || !newEmployee.doc_number || !newEmployee.email) {
      alert('Por favor complete los campos obligatorios');
      return;
    }
    try {
      await rrhhService.createEmployee(newEmployee);
      setIsEmployeeModalOpen(false);
      setNewEmployee({
        full_name: '',
        doc_number: '',
        role_job: '',
        department_id: '',
        email: '',
        phone: '',
        salary: 2000,
        hire_date: new Date().toISOString().split('T')[0],
        status: 'Activo'
      });
      loadData();
    } catch (err: any) {
      alert(`Error al registrar colaborador: ${err.message}`);
    }
  };

  const handleRegisterAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendance.employee_id) {
      alert('Seleccione un colaborador');
      return;
    }
    try {
      await rrhhService.registerAttendance(newAttendance);
      setIsAttendanceModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Error al registrar asistencia: ${err.message}`);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.employee_id) {
      alert('Seleccione un colaborador');
      return;
    }
    try {
      await rrhhService.createLeave(newLeave);
      setIsLeaveModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Error al solicitar permiso: ${err.message}`);
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: LeaveStatus) => {
    try {
      await rrhhService.updateLeaveStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(`Error al actualizar solicitud: ${err.message}`);
    }
  };

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraining.title) {
      alert('Ingrese el título de la capacitación');
      return;
    }
    try {
      await rrhhService.createTraining(newTraining);
      setIsTrainingModalOpen(false);
      setNewTraining({
        title: '',
        instructor: '',
        training_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        hours: 4,
        status: 'Programado',
        attendee_ids: []
      });
      loadData();
    } catch (err: any) {
      alert(`Error al programar taller: ${err.message}`);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName) return;
    try {
      await rrhhService.createDepartment(newDepartmentName, newDepartmentDesc);
      setNewDepartmentName('');
      setNewDepartmentDesc('');
      setIsDeptModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Error creando área: ${err.message}`);
    }
  };

  // FILTRADO DE EMPLEADOS
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.doc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role_job.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = 
        selectedDeptFilter === 'all' || 
        emp.department_id === selectedDeptFilter;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDeptFilter]);

  // CÁLCULO DE ASISTENCIA HOY
  const todayAttendances = useMemo(() => {
    return attendances.filter(a => a.date === attendanceDateFilter);
  }, [attendances, attendanceDateFilter]);

  const punctualityRate = useMemo(() => {
    if (todayAttendances.length === 0) return 100;
    const puntualCount = todayAttendances.filter(a => a.status === 'Puntual').length;
    return Math.round((puntualCount / todayAttendances.length) * 100);
  }, [todayAttendances]);

  return (
    <div className="space-y-6">
      {/* Alerta de Error si ocurre */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: COLABORADORES */}
      {/* ========================================================= */}
      {activeSubmodule === 'empleados' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Nómina de Colaboradores</h2>
              <p className="text-xs text-slate-500">Gestión de contratos, cargos, remuneraciones y legajo digital</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDeptModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                <Building className="w-4 h-4" /> Gestionar Áreas
              </button>
              <button 
                onClick={() => setIsEmployeeModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Registrar Colaborador
              </button>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, DNI, código o puesto..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">Área:</span>
              <select 
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las áreas ({departments.length})</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de Colaboradores en Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Cargando colaboradores de Supabase...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No se encontraron colaboradores registrados con los filtros aplicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
                          {emp.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900">{emp.full_name}</h3>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{emp.employee_code}</span>
                          </div>
                          <p className="text-xs text-blue-600 font-medium">{emp.role_job}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        emp.status === 'Activo' 
                          ? 'text-emerald-700 bg-emerald-50' 
                          : emp.status === 'De Licencia'
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-slate-600 bg-slate-100'
                      }`}>
                        {emp.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Área / Depto:</span>
                        <span className="font-medium text-slate-800">{emp.departments?.name || 'Sin Asignar'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Doc. Identidad:</span>
                        <span className="font-medium text-slate-700">{emp.doc_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-slate-700 truncate max-w-[160px]">{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Teléfono:</span>
                          <span className="text-slate-700">{emp.phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Remuneración:</span>
                        <span className="font-bold text-slate-900">S/ {Number(emp.salary).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                    <span className="text-[10px] text-slate-400">Ingreso: {emp.hire_date}</span>
                    <button 
                      onClick={async () => {
                        const newStat = emp.status === 'Activo' ? 'De Licencia' : emp.status === 'De Licencia' ? 'Inactivo' : 'Activo';
                        await rrhhService.updateEmployeeStatus(emp.id, newStat);
                        loadData();
                      }}
                      className="text-[11px] text-blue-600 font-semibold hover:underline"
                    >
                      Cambiar Estado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: ASISTENCIA */}
      {/* ========================================================= */}
      {activeSubmodule === 'asistencia' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Control de Asistencia y Puntualidad</h2>
              <p className="text-xs text-slate-500">Marcaciones de ingreso/salida y registro de tardanzas</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {punctualityRate}% Puntualidad ({attendanceDateFilter})
                </div>
              </div>
              <button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Marcar Asistencia
              </button>
            </div>
          </div>

          {/* Filtro de fecha para asistencia */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filtrar por Fecha:</span>
              <input 
                type="date" 
                value={attendanceDateFilter}
                onChange={e => setAttendanceDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
              />
            </div>
            <span className="text-xs text-slate-400">
              {todayAttendances.length} marcaciones registradas
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Colaborador</th>
                  <th className="p-3.5">Cargo / Área</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Hora Ingreso</th>
                  <th className="p-3.5">Hora Salida</th>
                  <th className="p-3.5 text-center">Observación</th>
                  <th className="p-3.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No hay registros de marcación para la fecha {attendanceDateFilter}.
                    </td>
                  </tr>
                ) : (
                  todayAttendances.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{row.employees?.full_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{row.employees?.employee_code}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{row.employees?.role_job}</div>
                        <div className="text-[10px] text-slate-400">{row.employees?.departments?.name}</div>
                      </td>
                      <td className="p-3.5 text-slate-500">{row.date}</td>
                      <td className="p-3.5 font-mono text-emerald-700 font-medium">
                        {row.check_in || '--:--'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {row.check_out || '--:--'}
                      </td>
                      <td className="p-3.5 text-center text-slate-500 italic text-[11px]">
                        {row.notes || '-'}
                      </td>
                      <td className="p-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Puntual' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : row.status === 'Tardanza'
                            ? 'bg-amber-100 text-amber-800'
                            : row.status === 'Falta'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.status}
                        </span>
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
      {/* SUBMÓDULO: VACACIONES Y PERMISOS */}
      {/* ========================================================= */}
      {activeSubmodule === 'vacaciones' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Programación de Vacaciones y Descansos</h2>
              <p className="text-xs text-slate-500">Días acumulados, descansos médicos y solicitudes de colaboradores</p>
            </div>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Solicitar Permiso
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Solicitudes Pendientes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Solicitudes Pendientes de Aprobación
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {leaves.filter(l => l.status === 'Pendiente').length} pendientes
                </span>
              </div>

              <div className="space-y-3">
                {leaves.filter(l => l.status === 'Pendiente').length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No hay solicitudes pendientes por revisar.</p>
                ) : (
                  leaves.filter(l => l.status === 'Pendiente').map(leave => (
                    <div key={leave.id} className="p-3 bg-slate-50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{leave.employees?.full_name}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                            {leave.leave_type}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          {leave.start_date} al {leave.end_date} ({leave.days_count} días)
                        </p>
                        {leave.reason && (
                          <p className="text-slate-600 italic text-[11px] mt-1">Motivo: "{leave.reason}"</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleUpdateLeaveStatus(leave.id, 'Aprobado')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-[11px] hover:bg-emerald-700"
                        >
                          Aprobar
                        </button>
                        <button 
                          onClick={() => handleUpdateLeaveStatus(leave.id, 'Rechazado')}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] hover:bg-slate-300"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Historial de Permisos Aprobados / Rechazados */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Historial de Permisos y Licencias
              </h3>
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                {leaves.filter(l => l.status !== 'Pendiente').length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No hay registros en el historial.</p>
                ) : (
                  leaves.filter(l => l.status !== 'Pendiente').map(leave => (
                    <div key={leave.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{leave.employees?.full_name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {leave.leave_type} • {leave.start_date} al {leave.end_date}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        leave.status === 'Aprobado' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {leave.status}
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
      {/* SUBMÓDULO: CAPACITACIONES */}
      {/* ========================================================= */}
      {activeSubmodule === 'capacitaciones' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Plan de Capacitación y Desarrollo</h2>
              <p className="text-xs text-slate-500">Talleres de atención al cliente, seguridad industrial y normativas</p>
            </div>
            <button 
              onClick={() => setIsTrainingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Programar Taller
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainings.length === 0 ? (
              <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No hay capacitaciones programadas en este momento.
              </div>
            ) : (
              trainings.map(tr => (
                <div key={tr.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      tr.status === 'Completado' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : tr.status === 'En Curso'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tr.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {tr.training_date}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{tr.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Instructor: <span className="text-slate-800 font-medium">{tr.instructor || 'Por definir'}</span> • Duración: <span className="font-bold text-slate-700">{tr.hours}h</span>
                    </p>
                  </div>

                  {/* Asistentes asignados */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      Participantes Registrados ({tr.training_attendees?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tr.training_attendees && tr.training_attendees.length > 0 ? (
                        tr.training_attendees.map(att => (
                          <span key={att.employee_id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {att.employees?.full_name || 'Colaborador'}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Abierto a todo el personal</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    {tr.status !== 'Completado' && (
                      <button 
                        onClick={async () => {
                          await rrhhService.updateTrainingStatus(tr.id, 'Completado');
                          loadData();
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        Marcar como Completado
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REGISTRAR COLABORADOR */}
      {/* ========================================================= */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Registrar Nuevo Colaborador
              </h3>
              <button onClick={() => setIsEmployeeModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  required 
                  value={newEmployee.full_name}
                  onChange={e => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                  placeholder="Ej. Sofía Morales Quispe" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">DNI / Pasaporte *</label>
                  <input 
                    type="text" 
                    required 
                    value={newEmployee.doc_number}
                    onChange={e => setNewEmployee({ ...newEmployee, doc_number: e.target.value })}
                    placeholder="74839201" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Puesto / Cargo *</label>
                  <input 
                    type="text" 
                    required 
                    value={newEmployee.role_job}
                    onChange={e => setNewEmployee({ ...newEmployee, role_job: e.target.value })}
                    placeholder="Ej. Asistente Comercial" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Área / Departamento</label>
                  <select 
                    value={newEmployee.department_id}
                    onChange={e => setNewEmployee({ ...newEmployee, department_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Seleccionar área...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Salario Mensual (S/)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="50"
                    value={newEmployee.salary}
                    onChange={e => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    required 
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="colaborador@empresa.com" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    value={newEmployee.phone}
                    onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="+51 987 654 321" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MARCAR ASISTENCIA */}
      {/* ========================================================= */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" /> Registro Manual de Asistencia
              </h3>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRegisterAttendance} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Colaborador *</label>
                <select 
                  required
                  value={newAttendance.employee_id}
                  onChange={e => setNewAttendance({ ...newAttendance, employee_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Seleccione colaborador...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_code}) - {emp.role_job}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha</label>
                  <input 
                    type="date"
                    value={newAttendance.date}
                    onChange={e => setNewAttendance({ ...newAttendance, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estado</label>
                  <select 
                    value={newAttendance.status}
                    onChange={e => setNewAttendance({ ...newAttendance, status: e.target.value as AttendanceStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600"
                  >
                    <option value="Puntual">Puntual</option>
                    <option value="Tardanza">Tardanza</option>
                    <option value="Falta">Falta</option>
                    <option value="Justificada">Justificada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hora Ingreso</label>
                  <input 
                    type="time" 
                    value={newAttendance.check_in}
                    onChange={e => setNewAttendance({ ...newAttendance, check_in: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hora Salida</label>
                  <input 
                    type="time" 
                    value={newAttendance.check_out}
                    onChange={e => setNewAttendance({ ...newAttendance, check_out: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notas / Justificación</label>
                <input 
                  type="text" 
                  value={newAttendance.notes}
                  onChange={e => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                  placeholder="Ej. Ingreso 10 min tarde por tráfico..." 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Asistencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SOLICITAR PERMISO / VACACIONES */}
      {/* ========================================================= */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-blue-600" /> Solicitud de Permiso / Vacaciones
              </h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Colaborador *</label>
                <select 
                  required
                  value={newLeave.employee_id}
                  onChange={e => setNewLeave({ ...newLeave, employee_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Seleccione colaborador...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.role_job})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo de Solicitud</label>
                <select 
                  value={newLeave.leave_type}
                  onChange={e => setNewLeave({ ...newLeave, leave_type: e.target.value as LeaveType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Permiso Médico">Permiso Médico</option>
                  <option value="Permiso Personal">Permiso Personal</option>
                  <option value="Maternidad/Paternidad">Maternidad / Paternidad</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Desde</label>
                  <input 
                    type="date"
                    value={newLeave.start_date}
                    onChange={e => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hasta</label>
                  <input 
                    type="date"
                    value={newLeave.end_date}
                    onChange={e => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Días Solicitados</label>
                <input 
                  type="number"
                  min="1"
                  value={newLeave.days_count}
                  onChange={e => setNewLeave({ ...newLeave, days_count: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Motivo / Justificación</label>
                <textarea 
                  rows={2}
                  value={newLeave.reason}
                  onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Detalles de la solicitud..." 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PROGRAMAR CAPACITACIÓN */}
      {/* ========================================================= */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Programar Taller de Capacitación
              </h3>
              <button onClick={() => setIsTrainingModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTraining} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tema / Título del Taller *</label>
                <input 
                  type="text" 
                  required
                  value={newTraining.title}
                  onChange={e => setNewTraining({ ...newTraining, title: e.target.value })}
                  placeholder="Ej. Taller de Ventas y Fidelización de Clientes" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instructor / Ponente</label>
                <input 
                  type="text" 
                  value={newTraining.instructor}
                  onChange={e => setNewTraining({ ...newTraining, instructor: e.target.value })}
                  placeholder="Ej. Ing. Carlos Medina" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha Programada</label>
                  <input 
                    type="date"
                    value={newTraining.training_date}
                    onChange={e => setNewTraining({ ...newTraining, training_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duración (Horas)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newTraining.hours}
                    onChange={e => setNewTraining({ ...newTraining, hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Asignar Colaboradores</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                  {employees.map(emp => {
                    const isChecked = newTraining.attendee_ids.includes(emp.id);
                    return (
                      <label key={emp.id} className="flex items-center gap-2 text-[11px] p-1 rounded hover:bg-slate-100 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewTraining({ ...newTraining, attendee_ids: [...newTraining.attendee_ids, emp.id] });
                            } else {
                              setNewTraining({ ...newTraining, attendee_ids: newTraining.attendee_ids.filter(id => id !== emp.id) });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-slate-800">{emp.full_name}</span>
                        <span className="text-slate-400">({emp.role_job})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Taller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: GESTIONAR ÁREAS / DEPARTAMENTOS */}
      {/* ========================================================= */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" /> Departamentos & Áreas
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              <label className="block text-xs font-semibold text-slate-500">Áreas Existentes:</label>
              {departments.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <span className="font-bold text-slate-800">{d.name}</span>
                  <span className="text-[11px] text-slate-400">{d.description || 'Sin descripción'}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-800">Agregar Nueva Área:</h4>
              <input 
                type="text" 
                required 
                value={newDepartmentName}
                onChange={e => setNewDepartmentName(e.target.value)}
                placeholder="Nombre del Área (ej. Logística, Marketing)" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input 
                type="text" 
                value={newDepartmentDesc}
                onChange={e => setNewDepartmentDesc(e.target.value)}
                placeholder="Descripción breve (opcional)" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cerrar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  + Agregar Área
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

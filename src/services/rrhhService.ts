import { supabase } from '../lib/supabase';

export interface DepartmentDb {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeDb {
  id: string;
  employee_code: string;
  user_id?: string | null;
  full_name: string;
  doc_number: string;
  role_job: string;
  department_id?: string | null;
  email: string;
  phone?: string | null;
  salary: number;
  hire_date: string;
  status: 'Activo' | 'Inactivo' | 'De Licencia';
  created_at?: string;
  departments?: DepartmentDb | null;
}

export interface CreateEmployeePayload {
  employee_code?: string;
  full_name: string;
  doc_number: string;
  role_job: string;
  department_id?: string;
  email: string;
  phone?: string;
  salary: number;
  hire_date?: string;
  status?: 'Activo' | 'Inactivo' | 'De Licencia';
}

export type AttendanceStatus = 'Puntual' | 'Tardanza' | 'Falta' | 'Justificada';

export interface EmployeeAttendanceDb {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: AttendanceStatus;
  notes?: string | null;
  created_at?: string;
  employees?: {
    id: string;
    employee_code: string;
    full_name: string;
    role_job: string;
    departments?: { name: string } | null;
  } | null;
}

export interface RegisterAttendancePayload {
  employee_id: string;
  date?: string;
  check_in?: string;
  check_out?: string;
  status?: AttendanceStatus;
  notes?: string;
}

export type LeaveType = 'Vacaciones' | 'Permiso Médico' | 'Permiso Personal' | 'Maternidad/Paternidad';
export type LeaveStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface EmployeeLeaveDb {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason?: string | null;
  status: LeaveStatus;
  approved_by?: string | null;
  created_at?: string;
  employees?: {
    id: string;
    employee_code: string;
    full_name: string;
    role_job: string;
    departments?: { name: string } | null;
  } | null;
}

export interface CreateLeavePayload {
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason?: string;
}

export interface EmployeeTrainingDb {
  id: string;
  title: string;
  instructor?: string | null;
  training_date: string;
  hours: number;
  status: 'Programado' | 'En Curso' | 'Completado' | 'Cancelado';
  created_at?: string;
  training_attendees?: {
    employee_id: string;
    attended: boolean;
    score?: number | null;
    employees?: {
      id: string;
      full_name: string;
      role_job: string;
    } | null;
  }[];
}

export interface CreateTrainingPayload {
  title: string;
  instructor?: string;
  training_date: string;
  hours: number;
  status?: 'Programado' | 'En Curso' | 'Completado' | 'Cancelado';
  attendee_ids?: string[];
}

export const rrhhService = {
  // DEPARTAMENTOS
  async getDepartments(): Promise<DepartmentDb[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createDepartment(name: string, description?: string): Promise<DepartmentDb> {
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // COLABORADORES / EMPLEADOS
  async getEmployees(): Promise<EmployeeDb[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        departments (
          id,
          name,
          description
        )
      `)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createEmployee(payload: CreateEmployeePayload): Promise<EmployeeDb> {
    // Si no viene código, generar uno correlativo automático
    let code = payload.employee_code;
    if (!code) {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      const nextNum = (count || 0) + 1;
      code = `EMP-${String(nextNum).padStart(2, '0')}`;
    }

    const { data, error } = await supabase
      .from('employees')
      .insert({
        employee_code: code,
        full_name: payload.full_name,
        doc_number: payload.doc_number,
        role_job: payload.role_job,
        department_id: payload.department_id || null,
        email: payload.email,
        phone: payload.phone || null,
        salary: Number(payload.salary) || 0,
        hire_date: payload.hire_date || new Date().toISOString().split('T')[0],
        status: payload.status || 'Activo'
      })
      .select(`
        *,
        departments (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmployeeStatus(id: string, status: 'Activo' | 'Inactivo' | 'De Licencia'): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  // ASISTENCIA
  async getAttendance(date?: string): Promise<EmployeeAttendanceDb[]> {
    let query = supabase
      .from('employee_attendance')
      .select(`
        *,
        employees (
          id,
          employee_code,
          full_name,
          role_job,
          departments ( name )
        )
      `)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async registerAttendance(payload: RegisterAttendancePayload): Promise<EmployeeAttendanceDb> {
    const date = payload.date || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('employee_attendance')
      .upsert(
        {
          employee_id: payload.employee_id,
          date,
          check_in: payload.check_in || null,
          check_out: payload.check_out || null,
          status: payload.status || 'Puntual',
          notes: payload.notes || null
        },
        { onConflict: 'employee_id,date' }
      )
      .select(`
        *,
        employees (
          id,
          employee_code,
          full_name,
          role_job,
          departments ( name )
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // VACACIONES Y PERMISOS
  async getLeaves(): Promise<EmployeeLeaveDb[]> {
    const { data, error } = await supabase
      .from('employee_leaves')
      .select(`
        *,
        employees (
          id,
          employee_code,
          full_name,
          role_job,
          departments ( name )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createLeave(payload: CreateLeavePayload): Promise<EmployeeLeaveDb> {
    const { data, error } = await supabase
      .from('employee_leaves')
      .insert({
        employee_id: payload.employee_id,
        leave_type: payload.leave_type,
        start_date: payload.start_date,
        end_date: payload.end_date,
        days_count: payload.days_count,
        reason: payload.reason || null,
        status: 'Pendiente'
      })
      .select(`
        *,
        employees (
          id,
          employee_code,
          full_name,
          role_job,
          departments ( name )
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateLeaveStatus(id: string, status: LeaveStatus): Promise<void> {
    const { error } = await supabase
      .from('employee_leaves')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  // CAPACITACIONES
  async getTrainings(): Promise<EmployeeTrainingDb[]> {
    const { data, error } = await supabase
      .from('employee_trainings')
      .select(`
        *,
        training_attendees (
          employee_id,
          attended,
          score,
          employees (
            id,
            full_name,
            role_job
          )
        )
      `)
      .order('training_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTraining(payload: CreateTrainingPayload): Promise<EmployeeTrainingDb> {
    // 1. Insertar la capacitación
    const { data: training, error } = await supabase
      .from('employee_trainings')
      .insert({
        title: payload.title,
        instructor: payload.instructor || null,
        training_date: payload.training_date,
        hours: payload.hours,
        status: payload.status || 'Programado'
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Si se asignaron asistentes, insertarlos en training_attendees
    if (payload.attendee_ids && payload.attendee_ids.length > 0) {
      const attendeesData = payload.attendee_ids.map(empId => ({
        training_id: training.id,
        employee_id: empId,
        attended: false
      }));

      const { error: attError } = await supabase
        .from('training_attendees')
        .insert(attendeesData);

      if (attError) {
        console.error('Error asociando asistentes:', attError);
      }
    }

    return training;
  },

  async updateTrainingStatus(id: string, status: 'Programado' | 'En Curso' | 'Completado' | 'Cancelado'): Promise<void> {
    const { error } = await supabase
      .from('employee_trainings')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};

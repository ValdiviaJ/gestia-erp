import { supabase } from '../lib/supabase';

export interface CompanySettingsDb {
  id: string;
  company_name: string;
  ruc: string;
  legal_representative?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  currency_code: string;
  currency_symbol: string;
  tax_rate: number;
  logo_url?: string | null;
  updated_at?: string;
}

export interface RoleDb {
  id: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  created_at?: string;
  user_count?: number;
}

export interface ProfileDb {
  id: string;
  role_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  last_login?: string | null;
  created_at?: string;
  roles?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
}

export interface AuditLogDb {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  old_values?: any;
  new_values?: any;
  ip_address?: string | null;
  created_at: string;
}

export interface PermissionMatrixItem {
  module: string;
  name: string;
  superAdmin: boolean;
  ventas: boolean;
  almacen: boolean;
  finanzas: boolean;
  rrhh: boolean;
}

export const PERMISSION_MATRIX_DATA: PermissionMatrixItem[] = [
  { module: 'dashboard', name: 'Dashboard Principal', superAdmin: true, ventas: true, almacen: true, finanzas: true, rrhh: true },
  { module: 'inventario', name: 'Inventario & Kardex', superAdmin: true, ventas: false, almacen: true, finanzas: false, rrhh: false },
  { module: 'ventas', name: 'Terminal POS & Ventas', superAdmin: true, ventas: true, almacen: false, finanzas: false, rrhh: false },
  { module: 'compras', name: 'Compras & Proveedores', superAdmin: true, ventas: false, almacen: true, finanzas: true, rrhh: false },
  { module: 'rrhh', name: 'Personal & Asistencias', superAdmin: true, ventas: false, almacen: false, finanzas: false, rrhh: true },
  { module: 'finanzas', name: 'Cajas & Bancos', superAdmin: true, ventas: false, almacen: false, finanzas: true, rrhh: false },
  { module: 'bi', name: 'Reportes & BI', superAdmin: true, ventas: false, almacen: false, finanzas: true, rrhh: true },
  { module: 'ia', name: 'Copiloto de IA', superAdmin: true, ventas: true, almacen: true, finanzas: true, rrhh: true },
  { module: 'configuracion', name: 'Ajustes del Sistema', superAdmin: true, ventas: false, almacen: false, finanzas: false, rrhh: false }
];

export const configService = {
  // 1. AJUSTES DE EMPRESA
  async getCompanySettings(): Promise<CompanySettingsDb | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateCompanySettings(settings: Partial<CompanySettingsDb>): Promise<CompanySettingsDb> {
    // Si ya existe un registro, actualizarlo; si no, crearlo
    const existing = await this.getCompanySettings();

    if (existing?.id) {
      const { data, error } = await supabase
        .from('company_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('company_settings')
        .insert({
          company_name: settings.company_name || 'Mi Empresa S.A.C.',
          ruc: settings.ruc || '20000000001',
          legal_representative: settings.legal_representative || null,
          phone: settings.phone || null,
          email: settings.email || null,
          address: settings.address || null,
          currency_code: settings.currency_code || 'PEN',
          currency_symbol: settings.currency_symbol || 'S/',
          tax_rate: Number(settings.tax_rate) || 18.00
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // 2. ROLES
  async getRoles(): Promise<RoleDb[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    // Conteo de usuarios por rol desde profiles
    const { data: profiles } = await supabase.from('profiles').select('role_id');
    const roleCounts = (profiles || []).reduce((acc: any, p: any) => {
      if (p.role_id) acc[p.role_id] = (acc[p.role_id] || 0) + 1;
      return acc;
    }, {});

    return (data || []).map(r => ({
      ...r,
      user_count: roleCounts[r.id] || 0
    }));
  },

  async createRole(name: string, description?: string): Promise<RoleDb> {
    const { data, error } = await supabase
      .from('roles')
      .insert({ name, description, is_system: false })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 3. PERFILES DE USUARIO
  async getProfiles(): Promise<ProfileDb[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateProfileRole(profileId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role_id: roleId, updated_at: new Date().toISOString() })
      .eq('id', profileId);

    if (error) throw error;
  },

  async updateProfileStatus(profileId: string, status: 'Activo' | 'Inactivo' | 'Suspendido'): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', profileId);

    if (error) throw error;
  },

  // 4. AUDITORÍA (AUDIT LOGS)
  async getAuditLogs(): Promise<AuditLogDb[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async recordAuditLog(action: string, entity: string, details?: { userEmail?: string; entityId?: string; notes?: string }): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        action,
        entity,
        user_email: details?.userEmail || 'admin@gestia.pe',
        entity_id: details?.entityId || null,
        new_values: details?.notes ? { notes: details.notes } : null
      });
    } catch (e) {
      console.error('Error registrando auditoría:', e);
    }
  }
};

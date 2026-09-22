export type MainModuleId = 
  | 'dashboard' 
  | 'inventario' 
  | 'ventas' 
  | 'compras' 
  | 'rrhh' 
  | 'finanzas' 
  | 'bi' 
  | 'ia' 
  | 'configuracion';

export type ThemeMode = 'hybrid' | 'light' | 'dark';

export type SubModuleId = {
  dashboard: 'resumen';
  inventario: 'productos' | 'categorias' | 'almacenes' | 'movimientos' | 'stock_minimo';
  ventas: 'pos' | 'clientes' | 'pedidos' | 'pagos' | 'comprobantes';
  compras: 'proveedores' | 'ordenes' | 'recepciones' | 'historial';
  rrhh: 'empleados' | 'asistencia' | 'vacaciones' | 'capacitaciones';
  finanzas: 'ingresos' | 'egresos' | 'cuentas' | 'flujo_caja';
  bi: 'bi_ventas' | 'bi_inventario' | 'bi_finanzas' | 'bi_rrhh';
  ia: 'asistente' | 'prediccion' | 'recomendaciones' | 'analisis';
  configuracion: 'usuarios' | 'roles' | 'permisos' | 'auditoria' | 'ajustes';
};

export interface SubModuleItem {
  id: string;
  name: string;
  badge?: string | number;
  description?: string;
}

export interface ModuleConfig {
  id: MainModuleId;
  name: string;
  icon: string;
  description: string;
  defaultSubmodule: string;
  submodules: SubModuleItem[];
}

export interface SaleItem {
  id: string;
  client: string;
  total: number;
  date: string;
  status: 'Pagado' | 'Pendiente' | 'Anulado';
  itemsCount: number;
  paymentMethod: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  price: number;
  image?: string;
  sku: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'sale' | 'stock' | 'purchase' | 'employee' | 'finance' | 'ai';
  read: boolean;
}

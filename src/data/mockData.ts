import { ModuleConfig } from '../types';

export const MODULES_CONFIG: ModuleConfig[] = [
  {
    id: 'dashboard',
    name: 'Inicio / Dashboard',
    icon: 'Home',
    description: 'Resumen general y métricas en tiempo real de tu negocio',
    defaultSubmodule: 'resumen',
    submodules: [
      { id: 'resumen', name: 'Resumen Ejecutivo' }
    ]
  },
  {
    id: 'inventario',
    name: 'Inventario',
    icon: 'Package',
    description: 'Gestión integral de productos, stock, almacenes y movimientos',
    defaultSubmodule: 'productos',
    submodules: [
      { id: 'productos', name: 'Productos', badge: '1,420' },
      { id: 'categorias', name: 'Categorías', badge: '18' },
      { id: 'almacenes', name: 'Almacenes', badge: '3' },
      { id: 'movimientos', name: 'Movimientos (Kardex)' },
      { id: 'stock_minimo', name: 'Stock Mínimo & Alertas', badge: '5' }
    ]
  },
  {
    id: 'ventas',
    name: 'Ventas / POS',
    icon: 'ShoppingCart',
    description: 'Punto de venta, facturación rápida, catálogo y cartera de clientes',
    defaultSubmodule: 'pos',
    submodules: [
      { id: 'pos', name: 'Terminal POS' },
      { id: 'clientes', name: 'Clientes', badge: '156' },
      { id: 'pedidos', name: 'Pedidos en Línea', badge: '12' },
      { id: 'pagos', name: 'Caja y Cobranzas' },
      { id: 'comprobantes', name: 'Comprobantes (Boletas/Facturas)' }
    ]
  },
  {
    id: 'compras',
    name: 'Compras',
    icon: 'Truck',
    description: 'Relación con proveedores, control de órdenes y recepción de stock',
    defaultSubmodule: 'proveedores',
    submodules: [
      { id: 'proveedores', name: 'Proveedores', badge: '28' },
      { id: 'ordenes', name: 'Órdenes de Compra', badge: '12' },
      { id: 'recepciones', name: 'Recepciones & Auditoría' },
      { id: 'historial', name: 'Historial de Compras' }
    ]
  },
  {
    id: 'rrhh',
    name: 'RRHH / Personal',
    icon: 'Users',
    description: 'Gestión de colaboradores, nómina, asistencia, permisos y formación',
    defaultSubmodule: 'empleados',
    submodules: [
      { id: 'empleados', name: 'Colaboradores', badge: '34' },
      { id: 'asistencia', name: 'Control de Asistencia' },
      { id: 'vacaciones', name: 'Vacaciones y Permisos', badge: '3' },
      { id: 'capacitaciones', name: 'Capacitaciones' }
    ]
  },
  {
    id: 'finanzas',
    name: 'Finanzas',
    icon: 'Coins',
    description: 'Flujo de caja, control de ingresos, egresos, cuentas por cobrar/pagar',
    defaultSubmodule: 'ingresos',
    submodules: [
      { id: 'ingresos', name: 'Ingresos & Ventas' },
      { id: 'egresos', name: 'Gastos & Egresos' },
      { id: 'cuentas', name: 'Cuentas Bancarias & Cajas' },
      { id: 'creditos', name: 'Cuentas por Cobrar/Pagar' },
      { id: 'flujo_caja', name: 'Flujo de Caja' }
    ]
  },
  {
    id: 'bi',
    name: 'Reportes y BI',
    icon: 'BarChart3',
    description: 'Inteligencia de negocios, proyecciones analíticas y métricas clave',
    defaultSubmodule: 'bi_ventas',
    submodules: [
      { id: 'bi_ventas', name: 'Analítica de Ventas' },
      { id: 'bi_inventario', name: 'Rotación de Inventario' },
      { id: 'bi_finanzas', name: 'Rendimiento Financiero' },
      { id: 'bi_rrhh', name: 'Productividad RRHH' }
    ]
  },
  {
    id: 'ia',
    name: 'IA / Asistente',
    icon: 'Bot',
    description: 'Copiloto empresarial predictivo, optimización de stock y recomendaciones',
    defaultSubmodule: 'asistente',
    submodules: [
      { id: 'asistente', name: 'Asistente Ejecutivo' },
      { id: 'prediccion', name: 'Predicción de Demanda' },
      { id: 'recomendaciones', name: 'Recomendaciones' },
      { id: 'analisis', name: 'Diagnóstico Financiero IA' }
    ]
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    icon: 'Settings',
    description: 'Gestión de usuarios, permisos por módulo, auditoría y sistema',
    defaultSubmodule: 'usuarios',
    submodules: [
      { id: 'usuarios', name: 'Usuarios', badge: '6' },
      { id: 'roles', name: 'Roles & Perfiles' },
      { id: 'permisos', name: 'Matriz de Permisos' },
      { id: 'auditoria', name: 'Registro de Auditoría' },
      { id: 'ajustes', name: 'Configuración General' }
    ]
  }
];

export const INITIAL_PRODUCTS = [
  { id: 'PRD-001', name: 'Audífonos Bluetooth Pro ANC', sku: 'AUD-BT-01', category: 'Electrónicos', price: 189.90, currentStock: 5, minStock: 10, warehouse: 'Almacén Central', image: '🎧' },
  { id: 'PRD-002', name: 'Mouse Inalámbrico Ergonómico', sku: 'MOU-ERG-02', category: 'Electrónicos', price: 65.00, currentStock: 8, minStock: 10, warehouse: 'Almacén Central', image: '🖱️' },
  { id: 'PRD-003', name: 'Mochila Impermeable Urban 20L', sku: 'MOC-URB-03', category: 'Accesorios', price: 129.00, currentStock: 12, minStock: 20, warehouse: 'Tienda Principal', image: '🎒' },
  { id: 'PRD-004', name: 'Camiseta Algodón Pima Unisex', sku: 'CAM-PIM-04', category: 'Ropa', price: 45.00, currentStock: 15, minStock: 20, warehouse: 'Tienda Principal', image: '👕' },
  { id: 'PRD-005', name: 'Botella Térmica Inox 750ml', sku: 'BOT-INO-05', category: 'Hogar', price: 38.50, currentStock: 7, minStock: 15, warehouse: 'Almacén Secundario', image: '🍶' },
  { id: 'PRD-006', name: 'Teclado Mecánico RGB Switches Red', sku: 'TEC-MEC-06', category: 'Electrónicos', price: 219.00, currentStock: 24, minStock: 8, warehouse: 'Almacén Central', image: '⌨️' },
  { id: 'PRD-007', name: 'Lámpara LED Escritorio Regulable', sku: 'LAM-LED-07', category: 'Hogar', price: 79.90, currentStock: 18, minStock: 5, warehouse: 'Tienda Principal', image: '💡' },
  { id: 'PRD-008', name: 'Pack Café Gourmet Peruano 500g', sku: 'CAF-PER-08', category: 'Alimentos', price: 35.00, currentStock: 30, minStock: 10, warehouse: 'Almacén Central', image: '☕' }
];

export const INITIAL_SALES = [
  { id: '0012', client: 'Ana Torres', total: 230.00, date: '09/06/2025', status: 'Pagado' as const, itemsCount: 3, paymentMethod: 'Tarjeta Crédito' },
  { id: '0011', client: 'Luis Pérez', total: 145.50, date: '09/06/2025', status: 'Pagado' as const, itemsCount: 2, paymentMethod: 'Yape / Transferencia' },
  { id: '0010', client: 'María Gómez', total: 320.00, date: '08/06/2025', status: 'Pagado' as const, itemsCount: 4, paymentMethod: 'Efectivo' },
  { id: '0009', client: 'Carlos Ruiz', total: 87.90, date: '08/06/2025', status: 'Pendiente' as const, itemsCount: 1, paymentMethod: 'Crédito 15 días' },
  { id: '0008', client: 'Sofía Ramírez', total: 210.00, date: '08/06/2025', status: 'Pagado' as const, itemsCount: 2, paymentMethod: 'Tarjeta Débito' },
  { id: '0007', client: 'Javier Morales', total: 495.00, date: '07/06/2025', status: 'Pagado' as const, itemsCount: 5, paymentMethod: 'Transferencia' }
];

export const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'Nueva venta registrada', description: 'S/ 230.00 - Cliente: Ana Torres', time: 'Hace 5 min', type: 'sale' as const, read: false },
  { id: '2', title: 'Stock bajo', description: 'Producto: Audífonos Bluetooth (5 unidades)', time: 'Hace 12 min', type: 'stock' as const, read: false },
  { id: '3', title: 'Orden de compra', description: 'Proveedor: TechSupply S.A.C. #OC-0012', time: 'Hace 25 min', type: 'purchase' as const, read: false },
  { id: '4', title: 'Nuevo empleado', description: 'Luis Pérez - Almacén', time: 'Hace 1 h', type: 'employee' as const, read: true },
  { id: '5', title: 'Cierre de caja verificado', description: 'Caja 01 cuadrada sin descuadres', time: 'Hace 3 h', type: 'finance' as const, read: true }
];

# 📋 BITÁCORA DE DESARROLLO - GESTIA ERP

**Proyecto:** GESTIA ERP  
**Repositorio Remoto:** [https://github.com/ValdiviaJ/gestia-erp](https://github.com/ValdiviaJ/gestia-erp)  
**Fecha de Sesión:** 21 de Septiembre, 2026  
**Rama:** `main`  
**Stack Principal:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Supabase (PostgreSQL + Auth + RLS).

---

## 🚀 1. Hitos y Logros Desarrollados Hoy

### A. Repositorio Independiente y Seguridad
* **Desvinculación:** Se separó **Gestia** del proyecto previo (`chat-priva`) y se convirtió en un repositorio Git 100% independiente.
* **Protección de Variables:** Se actualizó [.gitignore](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/.gitignore) blindando las credenciales `.env` y `.env*.local`.
* **Push Inicial:** Vinculación al remoto `https://github.com/ValdiviaJ/gestia-erp.git` en la rama `main`.

---

### B. Módulo de Autenticación y Seguridad (Supabase Auth & RLS)
* **Login Modal Seguro ([`src/components/auth/LoginModal.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/auth/LoginModal.tsx)):**
  * Bloqueo de acceso no autenticado para respetar las políticas de **Row Level Security (RLS)** de PostgreSQL.
  * Credenciales rápidas de prueba con 1 solo clic (Admin, Ventas, Almacén) con clave prellenada `Gestia2026*`.
  * Botón de auto-registro si el usuario no existe aún en Supabase Auth.
* **Control de Sesión Global ([`src/App.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/App.tsx)):**
  * Listener en tiempo real `onAuthStateChange`.
  * Avatar dinámico con iniciales, correo y botón de desconexión (`LogOut`) en la cabecera [`Header.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/layout/Header.tsx).

---

### C. Módulo de Inventario
* **Limpieza Visual:** Se eliminó el banner persistente que advertía sobre falta de categorías en [`InventarioView.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/modules/InventarioView.tsx).
* **Solución de Permisos (Error 42501):** 
  * Identificación del error `permission denied for table categories`. En PostgreSQL, los roles de API (`anon` y `authenticated`) requerían permisos de esquema explícitos (`GRANT ALL`).
  * Se añadieron los comandos de privilegios en [`supabase_schema.sql`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/supabase_schema.sql#L527-L533).

---

### D. Optimización de Densidad y Zoom al 100%
* **Escala Base ERP ([`src/index.css`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/index.css)):**
  * Se configuró la escala nativa `html { font-size: 14.5px; }`.
  * Ahora el sistema en zoom normal **100%** se visualiza con la misma armonía, compactación y elegancia que antes requería zoom al 90%.
* **Modales Responsivos:** El LoginModal se rediseñó con `max-h-[92vh]` y scroll interno suave para que no se corte en pantallas compactas.

---

### E. Módulo de Ventas / Terminal POS (Conexión Total a Supabase)
* **Servicio ([`src/services/salesService.ts`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/services/salesService.ts)):**
  * `getClients()` / `createClient()` conectados a `public.clients`.
  * `getSales()` con relaciones directas a productos, clientes y comprobantes.
  * `createSale()`:
    1. Inserta la orden en `public.sales`.
    2. Inserta los ítems en `public.sale_items`.
    3. **Dispara el trigger de BD `handle_sale_stock_reduction`**: descuenta en automático el stock de `public.products` y genera el movimiento de salida en el Kardex (`public.inventory_movements`).
    4. Genera el comprobante electrónico oficial en `public.electronic_receipts`.
* **Impresión Térmica y Descarga en PDF ([`src/utils/receiptPdfGenerator.ts`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/utils/receiptPdfGenerator.ts)):**
  * Genera el ticket oficial (80mm o A4) para Boletas y Facturas.
  * Incluye razón social, RUC, cliente, desglose de ítems, Subtotal, IGV (18%), Total y código de barras.
  * Disparador automático de impresión tras cobrar o desde el historial de ventas.

---

### F. Contadores e Insignias de Submódulos en Tiempo Real
* **Servicio de Métricas ([`src/services/metricsService.ts`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/services/metricsService.ts)):**
  * Consulta en paralelo mediante `count: 'exact', head: true` el número real de registros en la BD.
  * Actualiza dinámicamente los badges de los botones superiores en [`App.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/App.tsx) (Productos, Categorías, Almacenes, Stock mínimo, Clientes, Pedidos, Comprobantes, Proveedores, etc.).

---

### G. Módulo de Compras (Conexión Total a Supabase)
* **Servicio ([`src/services/purchasesService.ts`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/services/purchasesService.ts)):**
  * `getSuppliers()` / `createSupplier()` conectados a `public.suppliers`.
  * `getPurchases()` con joins a proveedores, productos y recepciones.
  * `createPurchase()` con inserción de ítems en `public.purchase_items`.
  * `receiveGoods()`: 
    1. Registra la auditoría en `public.goods_receipts` (almacén, guía de remisión, observaciones).
    2. Cambia estado a `Recibido`.
    3. **Suma stock real al producto** y crea el movimiento de entrada en el Kardex (`public.inventory_movements`).
* **Vista Completa ([`src/components/modules/ComprasView.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/modules/ComprasView.tsx)):**
  * Directorio de proveedores con modal de registro.
  * Generación y listado de Órdenes de Compra (OC).
  * Recepción y control de calidad en almacén.
  * Resumen histórico de adquisiciones.

---

### H. Módulo de RRHH / Personal (Conexión Total a Supabase)
* **Servicio ([`src/services/rrhhService.ts`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/services/rrhhService.ts)):**
  * Gestión de Departamentos (`departments`): Consulta y creación dinámica de áreas.
  * Nómina de Colaboradores (`employees`): Consulta con relaciones departamentales, registro con código correlativo automático `EMP-XX`, salarios, puestos y cambio de estado en un clic (`Activo`, `Inactivo`, `De Licencia`).
  * Control de Asistencia (`employee_attendance`): Marcación de ingreso/salida, estados (`Puntual`, `Tardanza`, `Falta`, `Justificada`), notas de justificación, filtro por fecha y cálculo de puntualidad diaria en tiempo real.
  * Vacaciones y Permisos (`employee_leaves`): Solicitud por colaborador, tipo de permiso, rangos de fechas, días hábiles, aprobación y rechazo inmediato, e historial de licencias.
  * Capacitaciones y Talleres (`employee_trainings` / `training_attendees`): Programación de capacitaciones, horas de formación, asignación de asistentes y marcado de culminación.
* **Vista Completa ([`src/components/modules/RrhhView.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/modules/RrhhView.tsx)):**
  * Submódulos 100% integrados a la base de datos (Colaboradores, Asistencia, Vacaciones, Capacitaciones).
  * Filtros en tiempo real por término de búsqueda y departamento.
  * Modales de registro para Colaboradores, Asistencias, Permisos, Talleres y Departamentos.
* **Métricas en Vivo:**
  * Indicador de solicitudes pendientes de permisos/vacaciones reflejado en tiempo real en los badges superiores de navegación.

---

### I. Módulo de Finanzas, Tesorería y Flujo de Caja (Conexión Total a Supabase)
* **Servicio ([`src/services/financeService.ts`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/services/financeService.ts)):**
  * **Cuentas Bancarias y Cajas (`financial_accounts`):** Consulta de saldos, registro de nuevas cuentas bancarias, cajas chicas y billeteras digitales (BCP, BBVA, Yape, etc.).
  * **Transacciones Financieras (`financial_transactions`):** Registro y consulta de ingresos y egresos clasificados por categoría (Mercadería, Gastos Fijos, Servicios, Planilla), impacto directo en el balance de la cuenta seleccionada.
  * **Cartera de Crédito y Cobranzas (`credit_accounts`):** Control integral de cuentas por cobrar (clientes) y por pagar (proveedores), vencimientos, abonos progresivos y cálculo de saldos pendientes.
* **Vista Completa ([`src/components/modules/FinanzasView.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/modules/FinanzasView.tsx)):**
  * **Ingresos & Facturación:** KPIs consolidados unificando ventas del POS y entradas financieras, con desglose de tickets e historial de transacciones.
  * **Gastos & Egresos:** Listado clasificado con filtros por categoría y búsqueda en tiempo real.
  * **Cuentas Bancarias & Cajas:** Tarjeta de saldo total consolidado en tesorería y grid de cuentas operativas.
  * **Cartera de Créditos:** Pestañas separadas para Por Cobrar y Por Pagar con modal para abonar en línea.
  * **Flujo de Caja:** Balance de liquidez neto en tiempo real (Ingresos Totales - Egresos Totales).
* **Métricas en Vivo:**
  * Conteo de cuentas activas, total de transacciones y badge dinámico de cuentas de crédito pendientes de cobro/pago.

---

### J. Módulo de Reportes & BI + Dashboard Ejecutivo (Conexión Total a Supabase)
* **Servicio de Inteligencia de Negocios ([`src/services/biService.ts`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/services/biService.ts)):**
  * **Analítica de Ventas:** Facturación neta, ticket promedio, ventas diarias de los últimos 7 días, distribución porcentual por familias/categorías y ranking de productos estrella más vendidos.
  * **Analítica de Inventario:** Unidades en stock global, valorización total del almacén a costo, recuento de quiebres de stock y listado ordenado de productos con mayor déficit de reposición.
  * **Analítica Financiera:** Flujo de caja consolidado (entradas brutas vs egresos totales), desglose de gastos por categoría operativa y posición crediticia neta (por cobrar vs por pagar).
  * **Analítica de RRHH:** Headcount oficial, nómina mensual acumulada, salario medio por colaborador, índice de puntualidad y distribución salarial por departamento.
* **Vista Ejecutiva de BI ([`src/components/modules/BiView.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/modules/BiView.tsx)):**
  * Pestañas especializadas para Ventas, Inventario, Finanzas y RRHH.
  * Gráficos interactivos de evolución con escala dinámica en tiempo real.
  * Botón de **Exportar CSV** que genera y descarga al instante el archivo de auditoría según el submódulo seleccionado.
* **Dashboard Principal Sincronizado ([`src/components/modules/DashboardView.tsx`](file:///D:/IX%20ciclo%20sistemas/proyects/Gestia/src/components/modules/DashboardView.tsx)):**
  * Conexión completa de los 5 KPIs centrales con la base de datos de Supabase.
  * Gráfico vectorial SVG de ventas diarias interactivo con curva y tooltips en tiempo real.
  * Distribución de facturación por categoría.
  * Tablas en vivo de *Últimas Ventas* y alertas de *Stock Bajo*.

---

## 🗄️ 2. Mapeo de Tablas de Base de Datos Utilizadas
| Entidad | Tabla en Supabase | Operaciones Implementadas |
| :--- | :--- | :--- |
| **Productos** | `public.products` | Lectura, creación, actualización de stock por triggers y recepciones |
| **Categorías** | `public.categories` | Lectura y creación |
| **Almacenes** | `public.warehouses` | Lectura y asignación en compras y ventas |
| **Kardex** | `public.inventory_movements` | Registro automático de salidas (Ventas) y entradas (Compras) |
| **Clientes** | `public.clients` | Lectura, creación modal, actualización de total gastado |
| **Ventas** | `public.sales` | Creación de pedido POS, totales, formas de pago y estados |
| **Detalle Venta** | `public.sale_items` | Artículos, precios unitarios y subcuentas |
| **Comprobantes** | `public.electronic_receipts` | Emisión de Boleta / Factura correlativa y estado SUNAT |
| **Proveedores** | `public.suppliers` | Directorio homologado con RUC, contacto y teléfonos |
| **Compras** | `public.purchases` | Emisión de órdenes OC, fechas de entrega y costos |
| **Detalle Compra**| `public.purchase_items` | Cantidades y costos unitarios pactados |
| **Recepciones** | `public.goods_receipts` | Guías de remisión, almacén destino y auditoría de ingreso |
| **Departamentos** | `public.departments` | Consulta y creación de áreas operativas |
| **Colaboradores** | `public.employees` | Lectura completa, registro con código correlativo, salarios y estados |
| **Asistencia** | `public.employee_attendance` | Marcaciones de ingreso/salida, control de tardanzas y cálculo % |
| **Permisos/Vac.** | `public.employee_leaves` | Solicitudes, conteo de días, aprobaciones y rechazos en vivo |
| **Capacitaciones**| `public.employee_trainings` | Talleres, horas y asignación de participantes |
| **Cuentas Tesorería**| `public.financial_accounts` | Saldo consolidado, apertura de cuentas y actualización de saldo |
| **Transacciones**| `public.financial_transactions` | Ingresos y egresos clasificados con conciliación bancaria |
| **Créditos** | `public.credit_accounts` | Cuentas por cobrar y pagar con registro de abonos |

---

## 📌 3. Tareas Pendientes para la Próxima Sesión
1. **Módulo Configuración:** Administrar datos de la empresa (`company_settings`) y roles de usuario.

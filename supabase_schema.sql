-- ==============================================================================
-- GESTIA: SISTEMA DE GESTIÓN OPERATIVA INTEGRAL PARA PYMES
-- Esquema Exhaustivo y Completo (100% de Módulos) para Supabase / PostgreSQL
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CONFIGURACIÓN DEL SISTEMA, ROLES Y AUDITORÍA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL DEFAULT 'Mi Empresa S.A.C.',
  ruc TEXT NOT NULL DEFAULT '20000000001',
  legal_representative TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  currency_code TEXT DEFAULT 'PEN', -- PEN, USD
  currency_symbol TEXT DEFAULT 'S/',
  tax_rate NUMERIC(5, 2) DEFAULT 18.00, -- IGV 18%
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles y Permisos Granulares
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- 'Super Admin', 'Administrador', 'Cajero', 'Almacenero', 'Contador', 'RRHH'
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module TEXT NOT NULL, -- 'inventario', 'ventas', 'compras', 'rrhh', 'finanzas', 'bi', 'ia', 'configuracion'
  action TEXT NOT NULL, -- 'read', 'create', 'update', 'delete', 'export'
  description TEXT,
  UNIQUE(module, action)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Perfiles de usuario (Vinculados a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo', 'Suspendido')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoría del sistema (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- 'LOGIN', 'CREATE_SALE', 'UPDATE_STOCK', 'DELETE_PRODUCT', etc.
  entity TEXT NOT NULL, -- 'products', 'sales', 'employees', etc.
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. MÓDULO INVENTARIO Y ALMACENES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 5,
  image_icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE movement_type AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'VENTA', 'COMPRA', 'TRASLADO');

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES public.warehouses(id),
  type movement_type NOT NULL,
  quantity INT NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. MÓDULO VENTAS, POS, CLIENTES Y COMPROBANTES SUNAT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_type TEXT DEFAULT 'DNI' CHECK (doc_type IN ('DNI', 'RUC', 'CE', 'PASAPORTE')),
  doc_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  orders_count INT DEFAULT 0,
  credit_limit NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones de Caja / Arqueos (Terminal POS)
CREATE TABLE IF NOT EXISTS public.cash_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cashier_id UUID NOT NULL REFERENCES public.profiles(id),
  opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Apertura
  closing_balance NUMERIC(12, 2), -- Cierre real
  expected_balance NUMERIC(12, 2), -- Cierre calculado por sistema
  cash_difference NUMERIC(12, 2), -- Descuadre
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'Abierta' CHECK (status IN ('Abierta', 'Cerrada'))
);

CREATE TYPE payment_method AS ENUM ('Efectivo', 'Tarjeta Débito', 'Tarjeta Crédito', 'Transferencia', 'Yape/Plin', 'Crédito');
CREATE TYPE sale_status AS ENUM ('Pagado', 'Pendiente', 'Anulado');

-- Ventas / Pedidos POS
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number TEXT UNIQUE NOT NULL, -- ej. PED-0012
  cash_session_id UUID REFERENCES public.cash_sessions(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  cashier_id UUID REFERENCES public.profiles(id),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- IGV 18%
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method payment_method DEFAULT 'Efectivo',
  status sale_status DEFAULT 'Pagado',
  is_online_order BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL
);

-- Comprobantes de Pago Electrónicos (Boletas / Facturas / Notas de Crédito - SUNAT)
CREATE TYPE receipt_type AS ENUM ('BOLETA', 'FACTURA', 'NOTA_CREDITO');
CREATE TYPE sunat_status AS ENUM ('Aceptado SUNAT', 'Pendiente', 'Rechazado', 'Anulado');

CREATE TABLE IF NOT EXISTS public.electronic_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE RESTRICT,
  receipt_type receipt_type NOT NULL,
  series TEXT NOT NULL, -- 'B001', 'F001'
  correlative_number INT NOT NULL, -- 0000452
  full_number TEXT UNIQUE NOT NULL, -- 'B001-0000452'
  customer_doc_type TEXT NOT NULL,
  customer_doc_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  sunat_status sunat_status DEFAULT 'Aceptado SUNAT',
  hash_cdr TEXT,
  xml_url TEXT,
  pdf_url TEXT,
  emitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. MÓDULO COMPRAS Y PROVEEDORES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruc TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE purchase_status AS ENUM ('Pendiente', 'Recibido', 'Cancelado');

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_code TEXT UNIQUE NOT NULL, -- ej. OC-0012
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id),
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status purchase_status DEFAULT 'Pendiente',
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL
);

-- Recepciones de Mercadería & Auditoría
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_code TEXT UNIQUE NOT NULL, -- REC-0021
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE RESTRICT,
  received_by UUID REFERENCES public.profiles(id),
  warehouse_id UUID REFERENCES public.warehouses(id),
  carrier_guide TEXT, -- Guía de remisión
  status TEXT DEFAULT 'Conforme' CHECK (status IN ('Conforme', 'Observado', 'Parcial')),
  observations TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. MÓDULO RRHH / PERSONAL (COLABORADORES, ASISTENCIA, VACACIONES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- 'Gerencia', 'Ventas', 'Operaciones', 'Finanzas'
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code TEXT UNIQUE NOT NULL, -- 'EMP-01'
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  doc_number TEXT UNIQUE NOT NULL,
  role_job TEXT NOT NULL, -- 'Jefe de Almacén', 'Cajera Principal'
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo', 'De Licencia')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Control de Asistencia Biométrico / Manual
CREATE TYPE attendance_status AS ENUM ('Puntual', 'Tardanza', 'Falta', 'Justificada');

CREATE TABLE IF NOT EXISTS public.employee_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIME,
  check_out TIME,
  status attendance_status DEFAULT 'Puntual',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Vacaciones y Permisos
CREATE TYPE leave_type AS ENUM ('Vacaciones', 'Permiso Médico', 'Permiso Personal', 'Maternidad/Paternidad');
CREATE TYPE leave_status AS ENUM ('Pendiente', 'Aprobado', 'Rechazado');

CREATE TABLE IF NOT EXISTS public.employee_leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'Pendiente',
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capacitaciones y Formación
CREATE TABLE IF NOT EXISTS public.employee_trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  instructor TEXT,
  training_date DATE NOT NULL,
  hours INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'Programado' CHECK (status IN ('Programado', 'En Curso', 'Completado', 'Cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_attendees (
  training_id UUID REFERENCES public.employee_trainings(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  score NUMERIC(4, 2),
  PRIMARY KEY (training_id, employee_id)
);

-- ==============================================================================
-- 7. MÓDULO FINANZAS, CUENTAS BANCARIAS Y FLUJO DE CAJA
-- ==============================================================================
CREATE TYPE financial_account_type AS ENUM ('Banco', 'Caja Chica', 'Billetera Digital', 'Pasarela Online');

CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name TEXT NOT NULL, -- 'BCP Cuenta Corriente Soles', 'Caja Tienda Principal', 'Yape Empresarial'
  account_type financial_account_type NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  currency TEXT DEFAULT 'PEN',
  current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE transaction_flow AS ENUM ('INGRESO', 'EGRESO', 'TRANSFERENCIA');

CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE RESTRICT,
  flow_type transaction_flow NOT NULL,
  category TEXT NOT NULL, -- 'Mercadería', 'Gastos Fijos', 'Servicios', 'Planilla', 'Cobro Cliente', etc.
  concept TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT, -- 'Transferencia BCP', 'Débito Automático', etc.
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Pagado' CHECK (status IN ('Pagado', 'Pendiente', 'Anulado')),
  reference_type TEXT, -- 'SALE', 'PURCHASE', 'PAYROLL', 'EXPENSE'
  reference_id UUID,
  registered_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cuentas por Cobrar y por Pagar
CREATE TYPE credit_status AS ENUM ('Pendiente', 'Parcial', 'Pagado', 'Vencido');

CREATE TABLE IF NOT EXISTS public.credit_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('POR_COBRAR', 'POR_PAGAR')),
  client_id UUID REFERENCES public.clients(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  total_amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2) DEFAULT 0.00,
  due_date DATE NOT NULL,
  status credit_status DEFAULT 'Pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. MÓDULO INTELIGENCIA ARTIFICIAL (IA) Y PREDICCIONES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('prediccion_demanda', 'diagnostico_financiero', 'recomendacion_stock', 'asistente')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  data_payload JSONB, -- Datos predictivos, series de tiempo, etc.
  confidence_score NUMERIC(5, 2), -- 0 a 100%
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. NOTIFICACIONES DEL SISTEMA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'stock', 'purchase', 'employee', 'finance', 'ai')),
  is_read BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. TRIGGERS AUTOMÁTICOS CLAVE
-- ==============================================================================

-- Trigger 1: Reducción automática de stock y kardex en venta
CREATE OR REPLACE FUNCTION public.handle_sale_stock_reduction()
RETURNS TRIGGER AS $$
BEGIN
  -- Descontar stock del producto
  UPDATE public.products
  SET current_stock = current_stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;

  -- Registrar en kardex de inventario
  INSERT INTO public.inventory_movements (
    product_id,
    type,
    quantity,
    stock_before,
    stock_after,
    reason
  )
  SELECT 
    NEW.product_id,
    'VENTA'::movement_type,
    NEW.quantity,
    current_stock + NEW.quantity,
    current_stock,
    'Venta POS #' || NEW.sale_id
  FROM public.products
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_sale_item_created ON public.sale_items;
CREATE TRIGGER on_sale_item_created
AFTER INSERT ON public.sale_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_sale_stock_reduction();

-- Trigger 2: Actualizar total gastado y contador de órdenes del cliente al registrar venta
CREATE OR REPLACE FUNCTION public.handle_client_sale_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_id IS NOT NULL AND NEW.status = 'Pagado' THEN
    UPDATE public.clients
    SET total_spent = total_spent + NEW.total,
        orders_count = orders_count + 1
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_sale_metrics_update ON public.sales;
CREATE TRIGGER on_sale_metrics_update
AFTER INSERT ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_client_sale_metrics();

-- ==============================================================================
-- 11. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electronic_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura seguras para usuarios autenticados
DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "auth_full_access_%s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "auth_full_access_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ==============================================================================
-- 12. DATOS INICIALES (MOCK DATA COMPLETO DE TU PROYECTO GESTIA)
-- ==============================================================================
-- Roles
INSERT INTO public.roles (id, name, description, is_system) VALUES 
('11111111-0000-0000-0000-000000000001', 'Super Admin', 'Acceso total y configuración del sistema', TRUE),
('11111111-0000-0000-0000-000000000002', 'Cajero / Ventas', 'Operación de POS, ventas y cobros', TRUE),
('11111111-0000-0000-0000-000000000003', 'Almacenero', 'Gestión de stock, almacenes y recepciones', TRUE),
('11111111-0000-0000-0000-000000000004', 'Contador / Finanzas', 'Control contable, egresos y cuentas', TRUE),
('11111111-0000-0000-0000-000000000005', 'RRHH', 'Gestión de colaboradores, asistencia y nómina', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Configuración Inicial de Empresa
INSERT INTO public.company_settings (company_name, ruc, phone, email, address) VALUES
('Gestia Retail & Services S.A.C.', '20601928391', '+51 984 123 456', 'contacto@gestia.pe', 'Av. Javier Prado Este 2450, Lima, Perú');

-- Almacenes
INSERT INTO public.warehouses (id, name, location) VALUES 
('11111111-1111-1111-1111-111111111111', 'Almacén Central', 'Sede Principal'),
('22222222-2222-2222-2222-222222222222', 'Tienda Principal', 'Mostrador de Ventas'),
('33333333-3333-3333-3333-333333333333', 'Almacén Secundario', 'Depósito')
ON CONFLICT (id) DO NOTHING;

-- Categorías
INSERT INTO public.categories (id, name) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electrónicos'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Accesorios'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ropa'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hogar'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Alimentos')
ON CONFLICT (id) DO NOTHING;

-- Productos
INSERT INTO public.products (sku, name, category_id, warehouse_id, price, cost, current_stock, min_stock, image_icon) VALUES
('AUD-BT-01', 'Audífonos Bluetooth Pro ANC', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 189.90, 110.00, 5, 10, '🎧'),
('MOU-ERG-02', 'Mouse Inalámbrico Ergonómico', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 65.00, 35.00, 8, 10, '🖱️'),
('MOC-URB-03', 'Mochila Impermeable Urban 20L', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 129.00, 70.00, 12, 20, '🎒'),
('CAM-PIM-04', 'Camiseta Algodón Pima Unisex', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 45.00, 22.00, 15, 20, '👕'),
('BOT-INO-05', 'Botella Térmica Inox 750ml', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 38.50, 18.00, 7, 15, '🍶'),
('TEC-MEC-06', 'Teclado Mecánico RGB Switches Red', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 219.00, 130.00, 24, 8, '⌨️'),
('LAM-LED-07', 'Lámpara LED Escritorio Regulable', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 79.90, 42.00, 18, 5, '💡'),
('CAF-PER-08', 'Pack Café Gourmet Peruano 500g', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 35.00, 18.50, 30, 10, '☕')
ON CONFLICT (sku) DO NOTHING;

-- Clientes iniciales
INSERT INTO public.clients (doc_type, doc_number, full_name, email, phone, total_spent, orders_count) VALUES
('DNI', '72918291', 'Ana Torres', 'ana.torres@gmail.com', '+51 984 123 456', 2840.00, 12),
('DNI', '45192837', 'Luis Pérez', 'lperez@hotmail.com', '+51 977 441 229', 1450.50, 6),
('RUC', '20601928391', 'María Gómez S.A.C.', 'mgomez@empresa.pe', '+51 993 881 721', 6720.00, 18),
('DNI', '10294857', 'Carlos Ruiz', 'cruiz@gmail.com', '+51 955 102 938', 890.00, 4)
ON CONFLICT (doc_number) DO NOTHING;

-- Departamentos RRHH
INSERT INTO public.departments (id, name, description) VALUES
('dddddddd-1111-1111-1111-111111111111', 'Gerencia', 'Dirección estratégica de la empresa'),
('dddddddd-2222-2222-2222-222222222222', 'Operaciones', 'Almacén, compras e inventarios'),
('dddddddd-3333-3333-3333-333333333333', 'Ventas', 'Fuerza comercial y atención al cliente')
ON CONFLICT (name) DO NOTHING;

-- Colaboradores (RRHH)
INSERT INTO public.employees (employee_code, full_name, doc_number, role_job, department_id, email, phone, salary, status) VALUES
('EMP-01', 'Carlos López', '40192837', 'Administrador General', 'dddddddd-1111-1111-1111-111111111111', 'clopez@empresa.com', '+51 999 111 222', 4500.00, 'Activo'),
('EMP-02', 'Luis Pérez', '45192837', 'Jefe de Almacén', 'dddddddd-2222-2222-2222-222222222222', 'lperez@empresa.com', '+51 977 441 229', 2800.00, 'Activo'),
('EMP-03', 'Ana Torres', '72918291', 'Cajera Principal', 'dddddddd-3333-3333-3333-333333333333', 'atorres@empresa.com', '+51 984 123 456', 1800.00, 'Activo'),
('EMP-04', 'Carla Mendoza', '71029384', 'Asesora Comercial', 'dddddddd-3333-3333-3333-333333333333', 'cmendoza@empresa.com', '+51 966 333 444', 2100.00, 'Activo'),
('EMP-05', 'Roberto Dávila', '43928172', 'Supervisor Logístico', 'dddddddd-2222-2222-2222-222222222222', 'rdavila@empresa.com', '+51 944 555 666', 2600.00, 'Activo')
ON CONFLICT (employee_code) DO NOTHING;

-- Cuentas Financieras (Cajas & Bancos)
INSERT INTO public.financial_accounts (account_name, account_type, bank_name, account_number, current_balance) VALUES
('BCP Soles Operativa', 'Banco', 'Banco de Crédito BCP', '191-2839182-0-45', 42800.00),
('BBVA Soles Recaudación', 'Banco', 'BBVA Continental', '0011-0239-010029384', 18500.00),
('Caja Chica Tienda', 'Caja Chica', 'Efectivo en Tienda', 'CAJA-01', 1480.00),
('Yape Comercial', 'Billetera Digital', 'BCP Yape', '984123456', 890.00);

-- Egresos y Gastos Iniciales
INSERT INTO public.financial_transactions (flow_type, category, concept, amount, payment_method, date, status) VALUES
('EGRESO', 'Mercadería', 'Pago a Proveedor TechSupply S.A.C.', 6500.00, 'Transferencia BCP', '2025-06-08', 'Pagado'),
('EGRESO', 'Gastos Fijos', 'Alquiler Local Comercial Tienda', 3200.00, 'Transferencia BBVA', '2025-06-05', 'Pagado'),
('EGRESO', 'Servicios', 'Servicios de Energía Eléctrica (Luz del Sur)', 620.00, 'Débito Automático', '2025-06-04', 'Pagado'),
('EGRESO', 'Servicios', 'Internet de Fibra Óptica Ópera', 240.00, 'Tarjeta', '2025-06-02', 'Pagado');

-- Notificaciones iniciales
INSERT INTO public.notifications (title, description, type, is_read) VALUES
('Nueva venta registrada', 'S/ 230.00 - Cliente: Ana Torres', 'sale', false),
('Stock bajo', 'Producto: Audífonos Bluetooth (5 unidades)', 'stock', false),
('Orden de compra', 'Proveedor: TechSupply S.A.C. #OC-0012', 'purchase', false),
('Nuevo empleado', 'Luis Pérez - Almacén', 'employee', true),
('Cierre de caja verificado', 'Caja 01 cuadrada sin descuadres', 'finance', true);

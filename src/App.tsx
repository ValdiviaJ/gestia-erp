import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginModal } from './components/auth/LoginModal';
import { supabase } from './lib/supabase';
import { metricsService, SystemCounts } from './services/metricsService';
import { configService, PermissionMatrixItem } from './services/configService';
import { MODULES_CONFIG } from './data/mockData';
import { MainModuleId, ThemeMode } from './types';

// Modules
import { DashboardView } from './components/modules/DashboardView';
import { InventarioView } from './components/modules/InventarioView';
import { VentasView } from './components/modules/VentasView';
import { ComprasView } from './components/modules/ComprasView';
import { RrhhView } from './components/modules/RrhhView';
import { FinanzasView } from './components/modules/FinanzasView';
import { BiView } from './components/modules/BiView';
import { IaView } from './components/modules/IaView';
import { ConfiguracionView } from './components/modules/ConfiguracionView';

export function App() {
  const [currentModule, setCurrentModule] = useState<MainModuleId>('dashboard');
  const [activeSubmodule, setActiveSubmodule] = useState<string>('resumen');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('gestia_theme') as ThemeMode) || 'hybrid';
  });

  // Autenticación con Supabase y Roles de Seguridad
  const [userSession, setUserSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRoleInfo, setUserRoleInfo] = useState<{ roleName: string; roleKey: string; isSuperAdmin: boolean }>({
    roleName: 'Super Admin',
    roleKey: 'superAdmin',
    isSuperAdmin: true
  });
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  // Conteos en vivo de la BD para insignias (badges) de submódulos
  const [systemCounts, setSystemCounts] = useState<SystemCounts | null>(null);

  const refreshCounts = async () => {
    const counts = await metricsService.getSystemCounts();
    setSystemCounts(counts);
  };

  const loadUserPermissions = async () => {
    try {
      const [roleData, matrix] = await Promise.all([
        configService.getCurrentUserProfile(),
        configService.getPermissionsMatrix()
      ]);
      setUserRoleInfo(roleData);

      if (roleData.isSuperAdmin) {
        // Super Admin tiene acceso incondicional a todos los módulos
        setAllowedModules(MODULES_CONFIG.map(m => m.id));
      } else {
        const allowed = matrix
          .filter(item => (item as any)[roleData.roleKey] === true)
          .map(item => item.module);
        
        // El dashboard principal siempre está disponible para navegación base
        if (!allowed.includes('dashboard')) allowed.unshift('dashboard');
        setAllowedModules(allowed);

        // Si el usuario está en un módulo restringido, redirigirlo al dashboard
        setCurrentModule(prev => {
          if (!allowed.includes(prev)) {
            return 'dashboard';
          }
          return prev;
        });
      }
    } catch (e) {
      console.warn('Error evaluating user permissions:', e);
      setAllowedModules(MODULES_CONFIG.map(m => m.id));
    }
  };

  useEffect(() => {
    // 1. Obtener sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      setCheckingAuth(false);
      refreshCounts();
      if (session) loadUserPermissions();
    });

    // 2. Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      if (session) {
        refreshCounts();
        loadUserPermissions();
      }
    });

    // 3. Suscribirse a eventos de actualización de matriz de permisos
    const handlePermissionsChanged = () => {
      loadUserPermissions();
    };
    window.addEventListener('gestia_permissions_updated', handlePermissionsChanged);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('gestia_permissions_updated', handlePermissionsChanged);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
  };

  useEffect(() => {
    localStorage.setItem('gestia_theme', theme);
  }, [theme]);

  const currentModuleConfig = MODULES_CONFIG.find(m => m.id === currentModule) || MODULES_CONFIG[0];

  const handleSelectModule = (modId: MainModuleId) => {
    setCurrentModule(modId);
    setSidebarOpen(false);
    const targetConfig = MODULES_CONFIG.find(m => m.id === modId);
    if (targetConfig) {
      setActiveSubmodule(targetConfig.defaultSubmodule);
    }
  };

  const handleNavigate = (module: MainModuleId, submodule?: string) => {
    setCurrentModule(module);
    setSidebarOpen(false);
    if (submodule) {
      setActiveSubmodule(submodule);
    } else {
      const targetConfig = MODULES_CONFIG.find(m => m.id === module);
      if (targetConfig) {
        setActiveSubmodule(targetConfig.defaultSubmodule);
      }
    }
  };

  // Función para obtener el número real de la BD para el badge del submódulo
  const getSubmoduleBadge = (subId: string, fallbackBadge?: string | number): string | number | undefined => {
    if (!systemCounts) return fallbackBadge;

    switch (subId) {
      // Inventario
      case 'productos': return String(systemCounts.productsCount);
      case 'categorias': return String(systemCounts.categoriesCount);
      case 'almacenes': return String(systemCounts.warehousesCount);
      case 'stock_minimo': return systemCounts.lowStockCount > 0 ? String(systemCounts.lowStockCount) : undefined;

      // Ventas
      case 'clientes': return String(systemCounts.clientsCount);
      case 'pedidos': return String(systemCounts.salesCount);
      case 'comprobantes': return String(systemCounts.receiptsCount);

      // Compras
      case 'proveedores': return String(systemCounts.suppliersCount);
      case 'ordenes': return String(systemCounts.purchasesCount);

      // RRHH
      case 'empleados': return String(systemCounts.employeesCount);
      case 'departamentos': return String(systemCounts.departmentsCount);
      case 'vacaciones': return systemCounts.leavesPendingCount > 0 ? String(systemCounts.leavesPendingCount) : undefined;

      // Finanzas
      case 'cuentas': return String(systemCounts.accountsCount);
      case 'egresos': return String(systemCounts.transactionsCount);
      case 'creditos': return systemCounts.creditsPendingCount > 0 ? String(systemCounts.creditsPendingCount) : undefined;

      // Configuración
      case 'usuarios': return String(systemCounts.usersCount);
      case 'roles': return String(systemCounts.rolesCount);

      default: return fallbackBadge;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${
      theme === 'dark' 
        ? 'theme-dark bg-[#0B1120] text-slate-100' 
        : 'bg-[#F8FAFC] text-slate-800'
    }`}>
      {/* 1. Left Sidebar Navigation (Desktop + Mobile Drawer) */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={handleSelectModule}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        allowedModules={allowedModules.length > 0 ? allowedModules : undefined}
        userRoleName={userRoleInfo.roleName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* 2. Fixed Top Navigation Suite */}
        <div className={`shrink-0 border-b shadow-xs z-20 ${
          theme === 'dark' ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <Header 
            onToggleSidebar={() => setSidebarOpen(prev => !prev)} 
            theme={theme}
            onChangeTheme={setTheme}
            userEmail={userSession?.user?.email}
            userRole={userRoleInfo.roleName}
            onLogout={handleLogout}
          />

          {/* Submodule Tabs Navigation (when not in main dashboard) */}
          {currentModule !== 'dashboard' && currentModuleConfig.submodules.length > 0 && (
            <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 sm:px-6 py-2.5">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
                  {currentModuleConfig.name}:
                </span>
                {currentModuleConfig.submodules.map((sub) => {
                  const isActive = activeSubmodule === sub.id;
                  const liveBadge = getSubmoduleBadge(sub.id, sub.badge);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubmodule(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                      }`}
                    >
                      <span>{sub.name}</span>
                      {liveBadge !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-all ${
                          isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {liveBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Page Dynamic Scrollable Content */}
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* 4. Page Dynamic Content con Guardia de Permisos */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {allowedModules.length > 0 && !allowedModules.includes(currentModule) ? (
            <div className="bg-white p-12 rounded-3xl border border-rose-200 shadow-xs text-center space-y-4 max-w-lg mx-auto mt-12">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold">
                🔒
              </div>
              <h2 className="text-xl font-bold text-slate-900">Acceso Restringido</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tu rol actual (<span className="font-semibold text-rose-600">{userRoleInfo.roleName}</span>) no tiene permisos asignados para acceder al módulo <span className="font-semibold">{currentModuleConfig.name}</span>.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentModule('dashboard')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentModule === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
              {currentModule === 'inventario' && <InventarioView activeSubmodule={activeSubmodule} />}
              {currentModule === 'ventas' && <VentasView activeSubmodule={activeSubmodule} />}
              {currentModule === 'compras' && <ComprasView activeSubmodule={activeSubmodule} />}
              {currentModule === 'rrhh' && <RrhhView activeSubmodule={activeSubmodule} />}
              {currentModule === 'finanzas' && <FinanzasView activeSubmodule={activeSubmodule} />}
              {currentModule === 'bi' && <BiView activeSubmodule={activeSubmodule} />}
              {currentModule === 'ia' && <IaView activeSubmodule={activeSubmodule} />}
              {currentModule === 'configuracion' && <ConfiguracionView activeSubmodule={activeSubmodule} />}
            </>
          )}
        </main>

        {/* 5. Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <p className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Gestión Operativa para PYMES</span>
            <span>•</span>
            <span>Tu negocio, más ordenado, más grande.</span>
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Seguro
            </span>
            <span>•</span>
            <span>Rápido</span>
            <span>•</span>
            <span>Confiable</span>
          </div>
        </footer>
        </div>
      </div>

      {/* Modal de Autenticación Requerida si no hay sesión activa */}
      {!checkingAuth && !userSession && (
        <LoginModal onSuccess={() => {}} />
      )}
    </div>
  );
}

export default App;

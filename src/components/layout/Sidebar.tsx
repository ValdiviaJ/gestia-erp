import React from 'react';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  Coins, 
  BarChart3, 
  Bot, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { MainModuleId } from '../../types';
import { MODULES_CONFIG } from '../../data/mockData';

interface SidebarProps {
  currentModule: MainModuleId;
  onSelectModule: (module: MainModuleId) => void;
  collapsed?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  theme?: 'hybrid' | 'light' | 'dark';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen = false,
  onClose,
  theme = 'hybrid'
}) => {
  const isLightSidebar = theme === 'light';

  const getIcon = (iconName: string, active: boolean) => {
    const props = { 
      className: `w-5 h-5 ${
        active 
          ? 'text-white' 
          : isLightSidebar 
            ? 'text-slate-500 group-hover:text-blue-600' 
            : 'text-slate-400 group-hover:text-white'
      }` 
    };
    switch (iconName) {
      case 'Home': return <Home {...props} />;
      case 'Package': return <Package {...props} />;
      case 'ShoppingCart': return <ShoppingCart {...props} />;
      case 'Truck': return <Truck {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Coins': return <Coins {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'Bot': return <Bot {...props} />;
      case 'Settings': return <Settings {...props} />;
      default: return <Home {...props} />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`w-64 flex flex-col shrink-0 h-screen select-none border-r z-50 transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static top-0 left-0 ${
          isLightSidebar
            ? 'bg-white text-slate-700 border-slate-200 shadow-sm'
            : 'bg-[#0F172A] text-slate-300 border-slate-800'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isLightSidebar ? 'border-slate-100' : 'border-slate-800/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className={`font-bold text-base leading-tight tracking-tight ${
                isLightSidebar ? 'text-slate-900' : 'text-white'
              }`}>
                Gestión Operativa
              </h1>
              <p className="text-xs text-blue-500 font-medium">para PYMES</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`lg:hidden p-1.5 rounded-lg ${
                isLightSidebar ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Cerrar menú lateral"
            >
              ✕
            </button>
          )}
        </div>

      {/* Navigation Modules */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className={`px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider ${
          isLightSidebar ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Módulos Principales
        </div>
        {MODULES_CONFIG.map((module) => {
          const isActive = currentModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : isLightSidebar
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {getIcon(module.icon, isActive)}
                <span>{module.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className={`p-4 border-t ${
        isLightSidebar 
          ? 'bg-slate-50 border-slate-200 text-slate-600' 
          : 'bg-[#0B1120] border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={`text-xs font-medium ${isLightSidebar ? 'text-slate-700' : 'text-slate-300'}`}>
              Sistema en línea
            </span>
          </div>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
            isLightSidebar ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
          }`}>
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
    </>
  );
};

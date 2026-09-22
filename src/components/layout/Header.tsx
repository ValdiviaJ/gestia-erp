import React, { useState } from 'react';
import { Search, Bell, ChevronDown, CheckCheck, X, Menu, Sun, Moon, SunMoon } from 'lucide-react';
import { INITIAL_NOTIFICATIONS } from '../../data/mockData';
import { ThemeMode } from '../../types';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onOpenNotifications?: () => void;
  onToggleSidebar?: () => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, theme, onChangeTheme }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const isDark = theme === 'dark';

  return (
    <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors gap-3 ${
      isDark 
        ? 'bg-[#0F172A] border-slate-800 text-slate-200' 
        : 'bg-white border-slate-200/80 text-slate-800'
    }`}>
      {/* Mobile Menu Button + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en el sistema (productos, clientes, órdenes, asientos)..."
            className={`w-full pl-10 pr-20 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder:text-slate-400' 
                : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400'
            }`}
          />
          <kbd className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold border px-1.5 py-0.5 rounded shadow-xs ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400'
          }`}>
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Theme Selector (Claro / Oscuro / Híbrido) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowNotifications(false);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer relative ${
              isDark ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Cambiar tema de interfaz"
            aria-label="Cambiar tema"
          >
            {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
            {theme === 'hybrid' && <SunMoon className="w-5 h-5 text-indigo-500" />}
          </button>

          {/* Theme Dropdown Menu */}
          {showThemeMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800'
            }`}>
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Tema de Apariencia
              </div>

              <button
                onClick={() => {
                  onChangeTheme('hybrid');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  theme === 'hybrid' 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SunMoon className="w-4 h-4 text-indigo-400" />
                  <span>Híbrido</span>
                </div>
                {theme === 'hybrid' && <span className="text-[10px]">✓</span>}
              </button>

              <button
                onClick={() => {
                  onChangeTheme('light');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  theme === 'light' 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Claro</span>
                </div>
                {theme === 'light' && <span className="text-[10px]">✓</span>}
              </button>

              <button
                onClick={() => {
                  onChangeTheme('dark');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  theme === 'dark' 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Oscuro</span>
                </div>
                {theme === 'dark' && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowThemeMenu(false);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 md:w-96 rounded-2xl shadow-xl border overflow-hidden z-50 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800'
            }`}>
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50/50 border-slate-100'
              }`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Leídas
                  </button>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 cursor-pointer ${
                      !n.read ? (isDark ? 'bg-blue-950/30' : 'bg-blue-50/40') : ''
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className={`h-6 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"
              alt="Angel Valdivia"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 leading-tight">Angel Valdivia</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Administrador General</span>
          </div>
        </div>
      </div>
    </header>
  );
};

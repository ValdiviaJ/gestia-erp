import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Building2, Sparkles, UserCheck } from 'lucide-react';

interface LoginModalProps {
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@gestia.pe');
  const [password, setPassword] = useState('Gestia2026*');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Cuentas rápidas de prueba sugeridas
  const QUICK_ACCOUNTS = [
    { label: 'Admin Gestia', email: 'admin@gestia.pe', pass: 'Gestia2026*', role: 'Administrador' },
    { label: 'Ventas / Caja', email: 'ventas@gestia.pe', pass: 'Gestia2026*', role: 'Cajero' },
    { label: 'Almacén', email: 'almacen@gestia.pe', pass: 'Gestia2026*', role: 'Logística' }
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          // Si el usuario no existe en Supabase Auth, ofrecer crearlo automáticamente
          if (error.message.includes('Invalid login credentials') || error.message.includes('user not found')) {
            throw new Error('Credenciales no encontradas en tu proyecto Supabase. Puedes presionar "Crear cuenta con estos datos" para registrarlo en un clic.');
          }
          throw error;
        }

        if (data.session) {
          onSuccess();
        }
      } else {
        // Registro
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: email.split('@')[0],
              role: 'Super Admin'
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          onSuccess();
        } else {
          setSuccessInfo('¡Usuario creado en Supabase! Ya puedes iniciar sesión ahora.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al autenticar en Supabase');
    } finally {
      setLoading(false);
    }
  };

  const selectQuickAccount = (acc: typeof QUICK_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 py-4 px-6 text-white text-center relative overflow-hidden shrink-0">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-11 h-11 bg-white/15 backdrop-blur-md rounded-2xl mb-2 border border-white/20 shadow-inner">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">GESTIA ERP</h1>
          <p className="text-[11px] text-blue-100/90 mt-0.5 font-medium">
            Acceso Seguro Empresarial (Supabase Auth)
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto no-scrollbar">
          {/* Alertas */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {errorMessage.includes('Crear cuenta con estos datos') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                    }}
                    className="block mt-2 font-bold underline hover:text-red-800 dark:hover:text-red-300 cursor-pointer"
                  >
                    Crear este usuario en mi base de datos ahora
                  </button>
                )}
              </div>
            </div>
          )}

          {successInfo && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@gestia.pe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Iniciar Sesión Segura' : 'Crear Usuario y Entrar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Cuentas sugeridas (Rápidas) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                Credenciales de Acceso Rápido:
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">1-clic</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {QUICK_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectQuickAccount(acc)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    email === acc.email
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-bold text-[11px] leading-tight truncate">{acc.label}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle entre Iniciar Sesión y Registrarse */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage(null);
              }}
              className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              {mode === 'login'
                ? '¿No tienes este usuario en Supabase? Créalo aquí'
                : '¿Ya registraste la cuenta? Inicia sesión'}
            </button>
          </div>

          {/* Footer de Seguridad */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Políticas RLS activadas para usuarios autenticados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

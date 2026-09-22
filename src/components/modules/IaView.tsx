import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  TrendingUp, 
  BrainCircuit, 
  Lightbulb, 
  Zap,
  ArrowRight
} from 'lucide-react';

export const IaView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '¡Hola Carlos! Soy tu Asistente de Inteligencia Operativa Gestia. He analizado las ventas de hoy y detecté que los "Audífonos Bluetooth Pro" tienen solo 5 unidades en stock mientras que la demanda creció un 22% esta semana. ¿Deseas generar la orden de compra automática con TechSupply S.A.C.?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    const userText = inputPrompt;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputPrompt('');

    setTimeout(() => {
      let reply = 'He procesado tu consulta con el motor predictivo de Gestia: ';
      if (userText.toLowerCase().includes('venta') || userText.toLowerCase().includes('ingreso')) {
        reply += 'La tendencia proyecta cerrar el mes con S/ 54,000 en ventas (+12% sobre el objetivo). El producto estrella continúa siendo la categoría de electrónica.';
      } else if (userText.toLowerCase().includes('stock') || userText.toLowerCase().includes('compra')) {
        reply += 'Hay 5 productos bajo el umbral mínimo de seguridad. He preparado un borrador de OC por S/ 3,450 para entrega este viernes.';
      } else {
        reply += 'Tus operaciones mantienen un margen neto saludable del 18.2%. Te sugiero optimizar los plazos de cobranza de 3 facturas que vencen este viernes.';
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Submodule: Asistente */}
      {activeSubmodule === 'asistente' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Copiloto IA Gestia para Negocios</h2>
                <p className="text-[11px] text-blue-200">Entrenado en gestión de inventario, ventas y optimización PYME</p>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
              Modelo Predictivo Activo
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Suggestions */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto text-xs">
            {[
              '¿Cuáles productos se van a agotar en 7 días?',
              '¿Cuál es la proyección de flujo de caja para junio?',
              'Sugerencias para aumentar ticket promedio'
            ].map((sug, idx) => (
              <button
                key={idx}
                onClick={() => setInputPrompt(sug)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg whitespace-nowrap transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Hazle una consulta analítica a la IA..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Submodule: Prediccion */}
      {activeSubmodule === 'prediccion' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Predicción de Demanda a 30 Días</h2>
            <p className="text-xs text-slate-500">Algoritmo basado en series de tiempo y estacionalidad del negocio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { prod: 'Audífonos Bluetooth ANC', expected: '+45%', conf: '94% precisión', rec: 'Comprar 60 unidades antes del 15 Jun' },
              { prod: 'Camisetas Pima', expected: '+28%', conf: '88% precisión', rec: 'Aumentar stock en Tienda Principal' },
              { prod: 'Botellas Inox', expected: '-10%', conf: '91% precisión', rec: 'No emitir OC por 2 semanas' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{item.conf}</span>
                  <span className="text-xs font-bold text-emerald-600">{item.expected} demanda</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{item.prod}</h3>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                  <strong>Recomendación IA:</strong> {item.rec}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Recomendaciones */}
      {activeSubmodule === 'recomendaciones' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Recomendaciones de Pricing y Promociones</h2>
            <p className="text-xs text-slate-500">Estrategias automáticas para elevar margen y rotación de stock quieto</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-emerald-900">Bundle Sugerido: Mochila Impermeable + Botella Térmica</p>
              <p className="text-xs text-emerald-700">Descuento del 10% en combo elevaría la venta cruzada un 34%.</p>
            </div>
            <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Activar Promoción</button>
          </div>
        </div>
      )}

      {/* Submodule: Analisis */}
      {activeSubmodule === 'analisis' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Diagnóstico Integral del Negocio</h2>
            <p className="text-xs text-slate-500">Puntaje de salud financiera Gestia: <strong className="text-blue-600">88 / 100 (Excelente)</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

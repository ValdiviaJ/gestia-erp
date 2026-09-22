import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  User, 
  Printer, 
  CheckCircle,
  FileCheck,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_SALES } from '../../data/mockData';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export const VentasView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  // POS State
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'PRD-001', name: 'Audífonos Bluetooth Pro ANC', price: 189.90, qty: 1 },
    { id: 'PRD-002', name: 'Mouse Inalámbrico Ergonómico', price: 65.00, qty: 2 }
  ]);
  const [selectedClient, setSelectedClient] = useState('Ana Torres (DNI: 72918291)');
  const [salesList, setSalesList] = useState(INITIAL_SALES);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Clients state
  const [clients, setClients] = useState([
    { id: 'CLI-01', name: 'Ana Torres', doc: 'DNI 72918291', email: 'ana.torres@gmail.com', phone: '+51 984 123 456', totalSpent: 2840.00, orders: 12 },
    { id: 'CLI-02', name: 'Luis Pérez', doc: 'DNI 45192837', email: 'lperez@hotmail.com', phone: '+51 977 441 229', totalSpent: 1450.50, orders: 6 },
    { id: 'CLI-03', name: 'María Gómez', doc: 'RUC 20601928391', email: 'mgomez@empresa.pe', phone: '+51 993 881 721', totalSpent: 6720.00, orders: 18 },
    { id: 'CLI-04', name: 'Carlos Ruiz', doc: 'DNI 10294857', email: 'cruiz@gmail.com', phone: '+51 955 102 938', totalSpent: 890.00, orders: 4 }
  ]);

  const addToCart = (product: any) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, qty: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const subtotal = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
  const igv = subtotal * 0.18;
  const total = subtotal;

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    const newSale = {
      id: `00${salesList.length + 1}`,
      client: selectedClient.split(' (')[0],
      total: total,
      date: '10/06/2025',
      status: 'Pagado' as const,
      itemsCount: cart.reduce((a, b) => a + b.qty, 0),
      paymentMethod: 'Tarjeta de Débito'
    };
    setSalesList([newSale, ...salesList]);
    setPaymentSuccess(true);
    setTimeout(() => {
      setCart([]);
      setPaymentSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Submodule: POS (Punto de Venta) */}
      {activeSubmodule === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Products Catalog selection */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Terminal POS - Venta Rápida</h2>
                <p className="text-xs text-slate-500">Selecciona o escanea artículos para añadirlos a la orden</p>
              </div>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">Caja 01 abierta</span>
            </div>

            {/* Quick Catalog Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[540px] overflow-y-auto pr-1">
              {INITIAL_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{prod.image}</span>
                    <span className="text-[10px] font-mono text-slate-400">{prod.sku}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {prod.name}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-900">S/ {prod.price.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400">Stock: {prod.currentStock}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col h-[620px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Carrito Actual</h3>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.qty, 0)} artículos
              </span>
            </div>

            {/* Client selector */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none font-medium"
              >
                {clients.map(c => (
                  <option key={c.id} value={`${c.name} (${c.doc})`}>{c.name} - {c.doc}</option>
                ))}
              </select>
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <ShoppingCart className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-xs">El carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">S/ {item.price.toFixed(2)} c/u</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 hover:bg-slate-200 text-slate-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 hover:bg-slate-200 text-slate-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-900 w-16 text-right">
                        S/ {(item.price * item.qty).toFixed(2)}
                      </span>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Checkout */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Base Imponible)</span>
                <span>S/ {(total / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IGV (18%)</span>
                <span>S/ {(total - (total / 1.18)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total a Pagar</span>
                <span className="text-blue-600">S/ {total.toFixed(2)}</span>
              </div>

              {paymentSuccess ? (
                <div className="bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-bounce">
                  <CheckCircle className="w-5 h-5" /> ¡Venta cobrada con éxito!
                </div>
              ) : (
                <button
                  disabled={cart.length === 0}
                  onClick={handleCompleteSale}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" /> Cobrar S/ {total.toFixed(2)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submodule: Clientes */}
      {activeSubmodule === 'clientes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cartera de Clientes</h2>
              <p className="text-xs text-slate-500">Historial de compras, línea de crédito y fidelización</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
              + Nuevo Cliente
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Documento</th>
                  <th className="p-3.5">Contacto</th>
                  <th className="p-3.5 text-center">Compras</th>
                  <th className="p-3.5 text-right">Total Facturado</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <span className="text-[10px] text-slate-400">{c.id}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">{c.doc}</td>
                    <td className="p-3.5">
                      <div className="text-slate-800">{c.phone}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800">{c.orders}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600">S/ {c.totalSpent.toFixed(2)}</td>
                    <td className="p-3.5 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold">Ver Historial</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodule: Pedidos */}
      {activeSubmodule === 'pedidos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Listado de Pedidos y Ventas</h2>
              <p className="text-xs text-slate-500">Monitoreo de estado de entrega y cobro de pedidos</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Filtrar por Fecha</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">N° Pedido</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Método de Pago</th>
                  <th className="p-3.5 text-right">Importe</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesList.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold font-mono text-slate-800">PED-{s.id}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{s.client}</td>
                    <td className="p-3.5 text-slate-500">{s.date}</td>
                    <td className="p-3.5 text-slate-600">{s.paymentMethod}</td>
                    <td className="p-3.5 text-right font-bold text-slate-900">S/ {s.total.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="flex items-center gap-1 ml-auto text-blue-600 hover:text-blue-800 font-semibold">
                        <Receipt className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodule: Pagos / Cajas */}
      {activeSubmodule === 'pagos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Efectivo en Caja</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">S/ 1,480.00</p>
              <span className="text-[10px] text-emerald-600">Apertura: S/ 200.00</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">POS Tarjetas (Izipay / Niubiz)</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">S/ 2,450.00</p>
              <span className="text-[10px] text-slate-400">14 transacciones</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Billeteras Digitales (Yape/Plin)</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">S/ 890.00</p>
              <span className="text-[10px] text-slate-400">8 pagos QR</span>
            </div>
          </div>
        </div>
      )}

      {/* Submodule: Comprobantes */}
      {activeSubmodule === 'comprobantes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Emisión Electrónica (Facturación SUNAT)</h2>
              <p className="text-xs text-slate-500">Boletas, facturas, notas de crédito y sincronización con OSE/SUNAT</p>
            </div>
            <button className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700">
              Sincronizar Lote OSE
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            {[
              { num: 'B001-0000452', client: 'Ana Torres', doc: 'DNI 72918291', amount: 'S/ 230.00', status: 'Aceptado SUNAT', date: '09/06/2025' },
              { num: 'F001-0000189', client: 'Constructora del Sur S.A.C.', doc: 'RUC 20551928312', amount: 'S/ 1,450.00', status: 'Aceptado SUNAT', date: '09/06/2025' },
              { num: 'B001-0000451', client: 'Luis Pérez', doc: 'DNI 45192837', amount: 'S/ 145.50', status: 'Aceptado SUNAT', date: '09/06/2025' }
            ].map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 font-mono">{comp.num}</span>
                    <p className="text-slate-600">{comp.client} - {comp.doc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{comp.amount}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    {comp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

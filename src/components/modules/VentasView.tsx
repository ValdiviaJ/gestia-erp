import React, { useState, useEffect } from 'react';
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
  RefreshCw, 
  AlertCircle,
  Building2,
  DollarSign
} from 'lucide-react';
import { salesService, SaleDb, ClientDb } from '../../services/salesService';
import { inventoryService, ProductDb } from '../../services/inventoryService';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  imageIcon?: string;
}

export const VentasView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  // Datos conectados a Supabase
  const [products, setProducts] = useState<ProductDb[]>([]);
  const [clients, setClients] = useState<ClientDb[]>([]);
  const [salesList, setSalesList] = useState<SaleDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados del POS
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta Débito' | 'Tarjeta Crédito' | 'Transferencia' | 'Yape/Plin'>('Efectivo');
  const [receiptType, setReceiptType] = useState<'BOLETA' | 'FACTURA'>('BOLETA');
  const [productSearch, setProductSearch] = useState('');
  const [processingSale, setProcessingSale] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<SaleDb | null>(null);

  // Modal Nuevo Cliente
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDocType, setNewClientDocType] = useState<'DNI' | 'RUC'>('DNI');
  const [newClientDocNum, setNewClientDocNum] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);

  // 1. Cargar datos de la BD Supabase
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [prodsData, clientsData, salesData] = await Promise.all([
        inventoryService.getProducts(),
        salesService.getClients(),
        salesService.getSales()
      ]);

      setProducts(prodsData);
      setClients(clientsData);
      setSalesList(salesData);

      if (clientsData.length > 0 && !selectedClientId) {
        setSelectedClientId(clientsData[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar con la base de datos de ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregar al carrito
  const addToCart = (product: ProductDb) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([
        ...cart, 
        { 
          id: product.id, 
          name: product.name, 
          sku: product.sku,
          price: Number(product.price), 
          qty: 1,
          imageIcon: product.image_icon || '📦'
        }
      ]);
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

  const total = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
  const subtotal = Number((total / 1.18).toFixed(2));
  const igv = Number((total - subtotal).toFixed(2));

  // Completar Venta en Supabase
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setProcessingSale(true);
    setErrorMsg(null);

    try {
      const sale = await salesService.createSale({
        client_id: selectedClientId || undefined,
        subtotal: subtotal,
        tax: igv,
        total: total,
        payment_method: paymentMethod,
        status: 'Pagado',
        receipt_type: receiptType,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.qty,
          unit_price: item.price,
          total: Number((item.price * item.qty).toFixed(2))
        }))
      });

      setLastCompletedSale(sale);
      setSalesList([sale, ...salesList]);
      setCart([]);

      // Refrescar inventario en segundo plano para reflejar el stock descontado por el trigger
      inventoryService.getProducts().then(setProducts).catch(console.error);

      setTimeout(() => {
        setLastCompletedSale(null);
      }, 5000);
    } catch (err: any) {
      alert(`Error al registrar la venta: ${err.message || err}`);
    } finally {
      setProcessingSale(false);
    }
  };

  // Guardar Nuevo Cliente en Supabase
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientDocNum.trim()) return;
    setCreatingClient(true);
    try {
      const created = await salesService.createClient({
        doc_type: newClientDocType,
        doc_number: newClientDocNum.trim(),
        full_name: newClientName.trim(),
        phone: newClientPhone.trim() || undefined,
        email: newClientEmail.trim() || undefined
      });

      setClients([...clients, created]);
      setSelectedClientId(created.id);
      setShowNewClientModal(false);
      setNewClientName('');
      setNewClientDocNum('');
      setNewClientPhone('');
      setNewClientEmail('');
    } catch (err: any) {
      alert(`Error al registrar cliente: ${err.message || err}`);
    } finally {
      setCreatingClient(false);
    }
  };

  // Filtro de catálogo en POS
  const filteredCatalog = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Alerta de Error si ocurre */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={loadData} className="font-bold underline cursor-pointer">Reintentar</button>
        </div>
      )}

      {/* SUBMÓDULO 1: TERMINAL POS */}
      {activeSubmodule === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Catálogo de Productos para la Venta */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Terminal POS - Venta Rápida</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona o busca artículos conectados a tu base de datos</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={loadData}
                  disabled={loading}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  title="Actualizar catálogo"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                </button>
                <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                  Caja Conectada
                </span>
              </div>
            </div>

            {/* Buscador de artículos */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Buscar por nombre, código o SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Grilla de productos desde Supabase */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredCatalog.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-slate-400 text-xs">
                  No se encontraron productos disponibles en la base de datos.
                </div>
              ) : (
                filteredCatalog.map((prod) => {
                  const outOfStock = prod.current_stock <= 0;
                  return (
                    <button
                      key={prod.id}
                      disabled={outOfStock}
                      onClick={() => addToCart(prod)}
                      className={`p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-800 hover:border-blue-400 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer ${
                        outOfStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl">{prod.image_icon || '📦'}</span>
                        <span className="text-[10px] font-mono text-slate-400">{prod.sku}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {prod.name}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            S/ {Number(prod.price).toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-semibold ${
                            outOfStock ? 'text-red-500' : prod.current_stock <= prod.min_stock ? 'text-amber-500' : 'text-slate-400'
                          }`}>
                            {outOfStock ? 'Agotado' : `Stock: ${prod.current_stock}`}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Carrito y Cobro */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Orden Actual</h3>
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.qty, 0)} artículos
              </span>
            </div>

            {/* Selector de Cliente y Botón Nuevo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Cliente
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(true)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  + Agregar Cliente
                </button>
              </div>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="">-- Cliente General / Varios --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.doc_type}: {c.doc_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de productos en el carrito */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 space-y-1 max-h-56">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <ShoppingCart className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-xs">El carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">S/ {item.price.toFixed(2)} c/u</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button onClick={() => updateQty(item.id, -1)} className="px-1.5 py-0.5 hover:bg-slate-200 text-slate-600 dark:text-slate-300">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-100">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="px-1.5 py-0.5 hover:bg-slate-200 text-slate-600 dark:text-slate-300">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white w-16 text-right">
                        S/ {(item.price * item.qty).toFixed(2)}
                      </span>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-600 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Opciones de Cobro y Facturación */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Comprobante:</label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <button 
                      type="button"
                      onClick={() => setReceiptType('BOLETA')}
                      className={`flex-1 py-1 text-center font-bold text-xs ${receiptType === 'BOLETA' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
                    >
                      Boleta
                    </button>
                    <button 
                      type="button"
                      onClick={() => setReceiptType('FACTURA')}
                      className={`flex-1 py-1 text-center font-bold text-xs ${receiptType === 'FACTURA' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
                    >
                      Factura
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Método de Pago:</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta Débito">Tarjeta Débito</option>
                    <option value="Tarjeta Crédito">Tarjeta Crédito</option>
                    <option value="Transferencia">Transferencia BCP/BBVA</option>
                    <option value="Yape/Plin">Yape / Plin</option>
                  </select>
                </div>
              </div>

              {/* Totales */}
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal (Base Imponible)</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>IGV (18%)</span>
                <span>S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total a Cobrar</span>
                <span className="text-blue-600 dark:text-blue-400">S/ {total.toFixed(2)}</span>
              </div>

              {lastCompletedSale ? (
                <div className="bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-fade-in text-xs">
                  <CheckCircle className="w-4 h-4" /> 
                  <span>¡Venta {lastCompletedSale.sale_number} registrada en Supabase!</span>
                </div>
              ) : (
                <button
                  disabled={cart.length === 0 || processingSale}
                  onClick={handleCompleteSale}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {processingSale ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>{processingSale ? 'Procesando en Supabase...' : `Cobrar S/ ${total.toFixed(2)}`}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBMÓDULO 2: CLIENTES */}
      {activeSubmodule === 'clientes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cartera de Clientes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clientes registrados en tiempo real en Supabase</p>
            </div>
            <button 
              onClick={() => setShowNewClientModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              + Nuevo Cliente
            </button>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Documento</th>
                  <th className="p-3.5">Contacto</th>
                  <th className="p-3.5 text-center">Compras</th>
                  <th className="p-3.5 text-right">Total Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-200">{c.full_name}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-400 mr-1">{c.doc_type}:</span>{c.doc_number}
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 dark:text-slate-300">{c.phone || '-'}</div>
                      <div className="text-[10px] text-slate-400">{c.email || '-'}</div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">{c.orders_count || 0}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      S/ {Number(c.total_spent || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMÓDULO 3: PEDIDOS Y VENTAS HISTÓRICAS */}
      {activeSubmodule === 'pedidos' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historial de Ventas</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Registros sincronizados de la tabla `sales` en Supabase</p>
            </div>
            <button 
              onClick={loadData}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refrescar
            </button>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">N° Pedido</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Método de Pago</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">Aún no hay ventas registradas en Supabase.</td>
                  </tr>
                ) : (
                  salesList.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">{s.sale_number}</td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {s.clients?.full_name || 'Cliente General'}
                      </td>
                      <td className="p-3.5 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{s.payment_method}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">S/ {Number(s.total).toFixed(2)}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Pagado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          {s.electronic_receipts?.[0]?.full_number || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMÓDULO 4: COMPROBANTES SUNAT */}
      {activeSubmodule === 'comprobantes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comprobantes de Pago Electrónicos (SUNAT)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Boletas y facturas vinculadas a las ventas de Supabase</p>
            </div>
            <button 
              onClick={loadData}
              className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              Sincronizar con SUNAT
            </button>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            {salesList.filter(s => s.electronic_receipts && s.electronic_receipts.length > 0).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No hay comprobantes emitidos en el sistema.</p>
            ) : (
              salesList
                .filter(s => s.electronic_receipts && s.electronic_receipts.length > 0)
                .map((s) => {
                  const receipt = s.electronic_receipts![0];
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{receipt.full_number}</span>
                          <p className="text-slate-600 dark:text-slate-400">
                            {s.clients?.full_name || 'CLIENTES VARIOS'} ({receipt.receipt_type})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white block">S/ {Number(s.total).toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {receipt.sunat_status || 'Aceptado SUNAT'}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* SUBMÓDULO 5: CAJA / PAGOS */}
      {activeSubmodule === 'pagos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Efectivo Cobrado</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                S/ {salesList.filter(s => s.payment_method === 'Efectivo').reduce((a, b) => a + Number(b.total), 0).toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-600">Sincronizado con Supabase</span>
            </div>
            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Tarjetas (Débito / Crédito)</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                S/ {salesList.filter(s => s.payment_method.includes('Tarjeta')).reduce((a, b) => a + Number(b.total), 0).toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-400">Total recaudado</span>
            </div>
            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Billeteras Digitales (Yape/Plin)</span>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                S/ {salesList.filter(s => s.payment_method.includes('Yape')).reduce((a, b) => a + Number(b.total), 0).toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-400">Cobros QR</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO CLIENTE */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Registrar Nuevo Cliente</h3>
            
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Doc.</label>
                  <select 
                    value={newClientDocType}
                    onChange={(e: any) => setNewClientDocType(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">N° Documento</label>
                  <input 
                    type="text"
                    required
                    value={newClientDocNum}
                    onChange={(e) => setNewClientDocNum(e.target.value)}
                    placeholder="8 u 11 dígitos"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Nombre Completo / Razón Social</label>
                <input 
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="ej. Juan Pérez o Inversiones S.A.C."
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Teléfono</label>
                  <input 
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+51 999 999 999"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Email</label>
                  <input 
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="cliente@correo.com"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={creatingClient}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {creatingClient ? 'Guardando...' : 'Guardar en BD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

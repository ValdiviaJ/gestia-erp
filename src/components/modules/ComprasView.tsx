import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Building2, 
  ClipboardCheck, 
  History as HistoryIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  PackageCheck,
  ArrowDownLeft,
  X
} from 'lucide-react';
import { purchasesService, SupplierDb, PurchaseDb } from '../../services/purchasesService';
import { inventoryService, ProductDb, WarehouseDb } from '../../services/inventoryService';

export const ComprasView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  // Estados principales de BD
  const [suppliers, setSuppliers] = useState<SupplierDb[]>([]);
  const [purchases, setPurchases] = useState<PurchaseDb[]>([]);
  const [products, setProducts] = useState<ProductDb[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [supplierSearch, setSupplierSearch] = useState('');
  const [purchaseSearch, setPurchaseSearch] = useState('');

  // Modal Nuevo Proveedor
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newRuc, setNewRuc] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Modal Nueva Orden de Compra (OC)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);
  const [savingPurchase, setSavingPurchase] = useState(false);

  // Modal Recepción de Mercadería
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPurchaseToReceive, setSelectedPurchaseToReceive] = useState<PurchaseDb | null>(null);
  const [carrierGuide, setCarrierGuide] = useState('');
  const [receiveWarehouseId, setReceiveWarehouseId] = useState('');
  const [receiveObservations, setReceiveObservations] = useState('');
  const [receivingGoods, setReceivingGoods] = useState(false);

  // Cargar datos desde Supabase
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [supData, purData, prodData, whData] = await Promise.all([
        purchasesService.getSuppliers(),
        purchasesService.getPurchases(),
        inventoryService.getProducts(),
        inventoryService.getWarehouses()
      ]);

      setSuppliers(supData);
      setPurchases(purData);
      setProducts(prodData);
      setWarehouses(whData);

      if (supData.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(supData[0].id);
      }
      if (whData.length > 0 && !receiveWarehouseId) {
        setReceiveWarehouseId(whData[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar con la base de datos de compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Guardar Proveedor
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuc.trim() || !newCompanyName.trim()) return;
    setSavingSupplier(true);
    try {
      const created = await purchasesService.createSupplier({
        ruc: newRuc.trim(),
        company_name: newCompanyName.trim(),
        contact_name: newContactName.trim() || undefined,
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
        address: newAddress.trim() || undefined
      });

      setSuppliers([...suppliers, created]);
      setShowSupplierModal(false);
      setNewRuc('');
      setNewCompanyName('');
      setNewContactName('');
      setNewEmail('');
      setNewPhone('');
      setNewAddress('');
    } catch (err: any) {
      alert(`Error al registrar proveedor: ${err.message || err}`);
    } finally {
      setSavingSupplier(false);
    }
  };

  // 2. Agregar ítem al formulario de Orden de Compra
  const handleAddItemToOrder = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setOrderItems([
      ...orderItems,
      {
        productId: firstProd.id,
        quantity: 10,
        unitCost: Number(firstProd.cost) || Number(firstProd.price) * 0.6
      }
    ]);
  };

  const handleUpdateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value,
        unitCost: prod ? Number(prod.cost) || Number(prod.price) * 0.6 : updated[index].unitCost
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setOrderItems(updated);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const purchaseTotal = orderItems.reduce((acc, it) => acc + (it.quantity * it.unitCost), 0);

  // 3. Guardar Orden de Compra en Supabase
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert('Debes seleccionar un proveedor');
      return;
    }
    if (orderItems.length === 0) {
      alert('Debes agregar al menos un producto a la orden de compra');
      return;
    }

    setSavingPurchase(true);
    try {
      await purchasesService.createPurchase({
        supplier_id: selectedSupplierId,
        delivery_date: deliveryDate || undefined,
        notes: orderNotes || undefined,
        total: purchaseTotal,
        items: orderItems.map(it => ({
          product_id: it.productId,
          quantity: Number(it.quantity),
          unit_cost: Number(it.unitCost),
          total: Number((it.quantity * it.unitCost).toFixed(2))
        }))
      });

      setShowPurchaseModal(false);
      setOrderItems([]);
      setOrderNotes('');
      setDeliveryDate('');
      await loadData();
    } catch (err: any) {
      alert(`Error al generar la orden de compra: ${err.message || err}`);
    } finally {
      setSavingPurchase(false);
    }
  };

  // 4. Recepcionar Orden de Compra e Ingresar al Kardex
  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchaseToReceive) return;
    setReceivingGoods(true);
    try {
      await purchasesService.receiveGoods({
        purchase_id: selectedPurchaseToReceive.id,
        carrier_guide: carrierGuide.trim() || undefined,
        warehouse_id: receiveWarehouseId || undefined,
        observations: receiveObservations.trim() || undefined,
        status: 'Conforme'
      });

      setShowReceiveModal(false);
      setSelectedPurchaseToReceive(null);
      setCarrierGuide('');
      setReceiveObservations('');
      alert('¡Mercadería recepcionada! El stock ha sido sumado al catálogo e ingresado al Kardex.');
      await loadData();
    } catch (err: any) {
      alert(`Error al recepcionar mercadería: ${err.message || err}`);
    } finally {
      setReceivingGoods(false);
    }
  };

  // Filtros
  const filteredSuppliers = suppliers.filter(s =>
    s.company_name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    s.ruc.includes(supplierSearch)
  );

  const filteredPurchases = purchases.filter(p =>
    p.purchase_code.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    (p.suppliers?.company_name || '').toLowerCase().includes(purchaseSearch.toLowerCase())
  );

  const pendingPurchases = purchases.filter(p => p.status === 'Pendiente');

  return (
    <div className="space-y-6">
      {/* Alerta de Error */}
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={loadData} className="font-bold underline cursor-pointer">Reintentar</button>
        </div>
      )}

      {/* SUBMÓDULO 1: PROVEEDORES */}
      {activeSubmodule === 'proveedores' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Directorio de Proveedores</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Proveedores registrados en la tabla `suppliers` de Supabase</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={loadData}
                disabled={loading}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                title="Refrescar"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              <button 
                onClick={() => setShowSupplierModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar Proveedor
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por RUC o Razón Social..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Grilla de Proveedores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
                No hay proveedores registrados. ¡Registra el primero con el botón superior!
              </div>
            ) : (
              filteredSuppliers.map(s => (
                <div key={s.id} className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{s.company_name}</h3>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">RUC: {s.ruc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Activo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Contacto:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.contact_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Teléfono:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.phone || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Correo:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{s.email || '-'}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => {
                        setSelectedSupplierId(s.id);
                        setShowPurchaseModal(true);
                      }}
                      className="w-full py-2 text-xs bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-300 rounded-xl font-bold cursor-pointer transition-colors text-center"
                    >
                      + Generar Orden de Compra
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBMÓDULO 2: ÓRDENES DE COMPRA (OC) */}
      {activeSubmodule === 'ordenes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Órdenes de Compra (OC)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Emisión y control de órdenes enlazadas con tus proveedores</p>
            </div>
            <button 
              onClick={() => {
                if (orderItems.length === 0 && products.length > 0) handleAddItemToOrder();
                setShowPurchaseModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nueva Orden de Compra
            </button>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Código OC</th>
                  <th className="p-3.5">Proveedor</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5 text-right">Importe Total</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">No hay órdenes de compra registradas.</td>
                  </tr>
                ) : (
                  filteredPurchases.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-white">{o.purchase_code}</td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {o.suppliers?.company_name || 'Proveedor'}
                      </td>
                      <td className="p-3.5 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {o.purchase_items?.map(it => `${it.products?.name || 'Item'} (${it.quantity})`).join(', ') || 'Sin items'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                        S/ {Number(o.total).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'Recibido' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {o.status === 'Pendiente' ? (
                          <button 
                            onClick={() => {
                              setSelectedPurchaseToReceive(o);
                              setShowReceiveModal(true);
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                          >
                            Recepcionar
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Ingresado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMÓDULO 3: RECEPCIONES & AUDITORÍA EN ALMACÉN */}
      {activeSubmodule === 'recepciones' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recepción y Control de Calidad en Almacén</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verificación de Órdenes Pendientes e ingreso automático al Kardex de Inventario</p>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-xl font-bold">
              {pendingPurchases.length} por recibir
            </span>
          </div>

          <div className="space-y-3">
            {pendingPurchases.length === 0 ? (
              <div className="bg-white dark:bg-[#0F172A] p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                No hay órdenes pendientes de recepción en almacén.
              </div>
            ) : (
              pendingPurchases.map(o => (
                <div key={o.id} className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-blue-600 dark:text-blue-400">{o.purchase_code}</span>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">• {o.suppliers?.company_name}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ítems a ingresar: {o.purchase_items?.map(i => `${i.products?.name} (${i.quantity} und)`).join(', ') || 'Sin ítems'}
                    </p>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white block">
                      Importe: S/ {Number(o.total).toFixed(2)}
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedPurchaseToReceive(o);
                      setShowReceiveModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <PackageCheck className="w-4 h-4" />
                    Confirmar Ingreso al Kardex
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBMÓDULO 4: HISTORIAL DE COMPRAS */}
      {activeSubmodule === 'historial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Comprado (Histórico)</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                S/ {purchases.reduce((acc, p) => acc + Number(p.total), 0).toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-600">Sincronizado con Supabase</span>
            </div>
            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Órdenes Recibidas</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {purchases.filter(p => p.status === 'Recibido').length}
              </p>
              <span className="text-[10px] text-slate-400">En inventario</span>
            </div>
            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Proveedores Registrados</span>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {suppliers.length}
              </p>
              <span className="text-[10px] text-slate-400">Homologados</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NUEVO PROVEEDOR */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Registrar Proveedor</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">RUC *</label>
                <input 
                  type="text"
                  required
                  value={newRuc}
                  onChange={(e) => setNewRuc(e.target.value)}
                  placeholder="20XXXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Razón Social / Empresa *</label>
                <input 
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="ej. Distribuidora del Norte S.A.C."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Persona de Contacto</label>
                  <input 
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Mario Vargas"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Teléfono</label>
                  <input 
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+51 999 888 777"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                <input 
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ventas@proveedor.com"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={savingSupplier}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {savingSupplier ? 'Guardando...' : 'Guardar en BD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NUEVA ORDEN DE COMPRA (OC) */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Generar Orden de Compra</h3>
                <p className="text-[11px] text-slate-500">Los artículos comprados podrán ingresarse directamente al stock</p>
              </div>
              <button onClick={() => setShowPurchaseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Proveedor *</label>
                  <select 
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-medium"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.company_name} ({s.ruc})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Fecha Estimada de Entrega</label>
                  <input 
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Lista de Ítems de la Compra */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Detalle de Productos a Solicitar</span>
                  <button 
                    type="button" 
                    onClick={handleAddItemToOrder}
                    className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Ítem
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Producto</label>
                      <select 
                        value={item.productId}
                        onChange={(e) => handleUpdateOrderItem(idx, 'productId', e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Cant.</label>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateOrderItem(idx, 'quantity', Number(e.target.value))}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Costo Unit.</label>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => handleUpdateOrderItem(idx, 'unitCost', Number(e.target.value))}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono"
                      />
                    </div>

                    <div className="col-span-1 text-right pt-3">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveOrderItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {orderItems.length === 0 && (
                  <p className="text-center text-slate-400 py-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    Presiona "+ Agregar Ítem" para añadir productos a la orden.
                  </p>
                )}
              </div>

              {/* Total de la OC */}
              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900">
                <span className="font-bold text-blue-950 dark:text-blue-200">Total de la Orden de Compra:</span>
                <span className="text-base font-black text-blue-700 dark:text-blue-400">
                  S/ {purchaseTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={savingPurchase}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {savingPurchase ? 'Emitiendo...' : 'Emitir Orden de Compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECEPCIONAR MERCADERÍA E INGRESAR AL KARDEX */}
      {showReceiveModal && selectedPurchaseToReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recepcionar en Almacén</h3>
                <p className="text-[11px] text-slate-500">{selectedPurchaseToReceive.purchase_code} • {selectedPurchaseToReceive.suppliers?.company_name}</p>
              </div>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceive} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Almacén de Destino *</label>
                <select 
                  value={receiveWarehouseId}
                  onChange={(e) => setReceiveWarehouseId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">N° Guía de Remisión / Factura Proveedor</label>
                <input 
                  type="text"
                  value={carrierGuide}
                  onChange={(e) => setCarrierGuide(e.target.value)}
                  placeholder="ej. T001-000492"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Observaciones</label>
                <textarea 
                  rows={2}
                  value={receiveObservations}
                  onChange={(e) => setReceiveObservations(e.target.value)}
                  placeholder="Mercadería verificada en empaque original sin daños..."
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                Al confirmar, el sistema sumará automáticamente las unidades al stock de cada producto y creará el registro de entrada en el <strong>Kardex de Inventario</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={receivingGoods}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {receivingGoods ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>{receivingGoods ? 'Ingresando al Kardex...' : 'Confirmar Recepción'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

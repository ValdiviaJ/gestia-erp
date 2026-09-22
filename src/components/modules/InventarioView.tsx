import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Warehouse, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Sparkles,
  Check
} from 'lucide-react';
import { 
  inventoryService, 
  ProductDb, 
  CategoryDb, 
  WarehouseDb, 
  InventoryMovementDb 
} from '../../services/inventoryService';
import { INITIAL_PRODUCTS } from '../../data/mockData';

const DEFAULT_CATEGORIES = [
  { id: 'cat-elec', name: 'Electrónicos' },
  { id: 'cat-acc', name: 'Accesorios' },
  { id: 'cat-rop', name: 'Ropa' },
  { id: 'cat-hog', name: 'Hogar' },
  { id: 'cat-ali', name: 'Alimentos' }
];

const DEFAULT_WAREHOUSES: WarehouseDb[] = [
  { id: 'wh-cen', name: 'Almacén Central', location: 'Sede Principal', is_active: true },
  { id: 'wh-tie', name: 'Tienda Principal', location: 'Mostrador POS', is_active: true },
  { id: 'wh-sec', name: 'Almacén Secundario', location: 'Depósito Norte', is_active: true }
];

export const InventarioView: React.FC<{ activeSubmodule: string }> = ({ activeSubmodule }) => {
  const [products, setProducts] = useState<ProductDb[]>([]);
  const [categories, setCategories] = useState<CategoryDb[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDb[]>([]);
  const [movements, setMovements] = useState<InventoryMovementDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states - Nuevo Producto
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newWarehouseId, setNewWarehouseId] = useState('');
  const [newPrice, setNewPrice] = useState(100);
  const [newCost, setNewCost] = useState(60);
  const [newStock, setNewStock] = useState(20);
  const [newMinStock, setNewMinStock] = useState(10);
  const [newIcon, setNewIcon] = useState('📦');

  // Inline Quick Creation in modal
  const [showQuickCat, setShowQuickCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [showQuickWh, setShowQuickWh] = useState(false);
  const [quickWhName, setQuickWhName] = useState('');

  // Form states - Modales de Categoría y Almacén
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newWhName, setNewWhName] = useState('');
  const [newWhLocation, setNewWhLocation] = useState('');

  // Cargar datos desde Supabase
  const loadAllData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [prodsData, catsData, whsData, movsData] = await Promise.all([
        inventoryService.getProducts().catch(() => []),
        inventoryService.getCategories().catch(() => []),
        inventoryService.getWarehouses().catch(() => []),
        inventoryService.getMovements().catch(() => [])
      ]);

      if (prodsData.length > 0) {
        setProducts(prodsData);
      } else {
        const fallback = INITIAL_PRODUCTS.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          price: p.price,
          cost: p.price * 0.6,
          current_stock: p.currentStock,
          min_stock: p.minStock,
          image_icon: p.image,
          is_active: true,
          categories: { id: 'c1', name: p.category },
          warehouses: { id: 'w1', name: p.warehouse, location: 'Local' }
        }));
        setProducts(fallback);
      }

      // Si no hay categorías en BD, mostrar por defecto para no bloquear el select
      if (catsData.length > 0) {
        setCategories(catsData);
        setNewCatId(catsData[0].id);
      } else {
        setCategories(DEFAULT_CATEGORIES);
        setNewCatId(DEFAULT_CATEGORIES[0].id);
      }

      // Si no hay almacenes en BD, mostrar por defecto para no bloquear el select
      if (whsData.length > 0) {
        setWarehouses(whsData);
        setNewWarehouseId(whsData[0].id);
      } else {
        setWarehouses(DEFAULT_WAREHOUSES);
        setNewWarehouseId(DEFAULT_WAREHOUSES[0].id);
      }

      setMovements(movsData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudo sincronizar con Supabase. Usando catálogo en memoria.');
      setCategories(DEFAULT_CATEGORIES);
      setWarehouses(DEFAULT_WAREHOUSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Función para autollenar categorías y almacenes en la BD de Supabase si están vacíos
  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await inventoryService.seedInitialData();
      await loadAllData();
      alert('¡Categorías y almacenes creados exitosamente en tu base de datos de Supabase!');
    } catch (err: any) {
      alert(`Error al poblar datos: ${err.message || err}`);
    } finally {
      setSeeding(false);
    }
  };

  // Creación rápida de categoría desde el modal de producto
  const handleQuickAddCat = async () => {
    if (!quickCatName.trim()) return;
    try {
      const created = await inventoryService.createCategory(quickCatName.trim());
      setCategories([...categories, created]);
      setNewCatId(created.id);
      setQuickCatName('');
      setShowQuickCat(false);
    } catch {
      // Fallback local si no hay conexión
      const tempId = `temp-${Date.now()}`;
      const tempCat = { id: tempId, name: quickCatName.trim() };
      setCategories([...categories, tempCat]);
      setNewCatId(tempId);
      setQuickCatName('');
      setShowQuickCat(false);
    }
  };

  // Creación rápida de almacén desde el modal de producto
  const handleQuickAddWh = async () => {
    if (!quickWhName.trim()) return;
    try {
      const created = await inventoryService.createWarehouse(quickWhName.trim());
      setWarehouses([...warehouses, created]);
      setNewWarehouseId(created.id);
      setQuickWhName('');
      setShowQuickWh(false);
    } catch {
      // Fallback local si no hay conexión
      const tempId = `temp-wh-${Date.now()}`;
      const tempWh = { id: tempId, name: quickWhName.trim(), is_active: true };
      setWarehouses([...warehouses, tempWh]);
      setNewWarehouseId(tempId);
      setQuickWhName('');
      setShowQuickWh(false);
    }
  };

  // Manejar creación de producto
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setSubmitting(true);

    try {
      const generatedSku = newSku.trim() || `SKU-${Date.now().toString().slice(-5)}`;
      
      // Validar si el category_id y warehouse_id son UUIDs reales de BD o temporales
      const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const realCatId = isValidUuid(newCatId) ? newCatId : undefined;
      const realWhId = isValidUuid(newWarehouseId) ? newWarehouseId : undefined;

      const created = await inventoryService.createProduct({
        name: newName,
        sku: generatedSku,
        category_id: realCatId,
        warehouse_id: realWhId,
        price: Number(newPrice),
        cost: Number(newCost),
        current_stock: Number(newStock),
        min_stock: Number(newMinStock),
        image_icon: newIcon
      });

      setProducts([created, ...products]);
      setShowAddModal(false);
      resetProductForm();
    } catch (err: any) {
      alert(`Error al guardar producto: ${err.message || err}. Verifica que hayas ejecutado el script en Supabase.`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setNewName('');
    setNewSku('');
    setNewPrice(100);
    setNewCost(60);
    setNewStock(20);
    setNewMinStock(10);
    setNewIcon('📦');
  };

  // Manejar creación de categoría desde pestaña
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setSubmitting(true);
    try {
      const cat = await inventoryService.createCategory(newCatName, newCatDesc);
      setCategories([...categories, { ...cat, products_count: 0 }]);
      setShowCategoryModal(false);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err: any) {
      alert(`Error al crear categoría: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar creación de almacén desde pestaña
  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName) return;
    setSubmitting(true);
    try {
      const wh = await inventoryService.createWarehouse(newWhName, newWhLocation);
      setWarehouses([...warehouses, { ...wh, items_count: 0 }]);
      setShowWarehouseModal(false);
      setNewWhName('');
      setNewWhLocation('');
    } catch (err: any) {
      alert(`Error al crear almacén: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await inventoryService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message || err}`);
    }
  };

  // Filtros
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const catName = p.categories?.name || 'General';
    const matchesCat = selectedCategory === 'Todas' || catName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Banner si las categorías o almacenes no se han cargado en Supabase */}
      {categories.length > 0 && categories[0].id.startsWith('cat-') && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs">Tu base de datos en Supabase aún no tiene categorías ni almacenes guardados</p>
              <p className="text-[11px] text-blue-700">Puedes crearlos automáticamente con un solo clic para tenerlos disponibles en los desplegables.</p>
            </div>
          </div>
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm shadow-blue-500/20"
          >
            {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {seeding ? 'Guardando en BD...' : 'Cargar datos iniciales en BD'}
          </button>
        </div>
      )}

      {/* Submodule: Productos */}
      {activeSubmodule === 'productos' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Catálogo de Productos</h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {products.length} artículos
                </span>
              </div>
              <p className="text-xs text-slate-500">Administra tus artículos, SKU, precios de venta y control de stock en tiempo real</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button 
                onClick={loadAllData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Actualizar datos desde Supabase"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refrescar</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Nuevo Producto
              </button>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Buscar por código, nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Categoría:</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value="Todas">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Cargando inventario desde Supabase...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No se encontraron productos. ¡Registra uno nuevo!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Almacén</th>
                    <th className="py-3 px-4 text-right">Precio</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLow = p.current_stock <= p.min_stock;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{p.image_icon || '📦'}</span>
                            <div>
                              <p className="font-bold text-slate-800">{p.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] block">
                                {p.id.length > 10 ? `${p.id.slice(0, 8)}...` : p.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{p.sku}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                            {p.categories?.name || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {p.warehouses?.name || 'Almacén Central'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          S/ {Number(p.price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={isLow ? 'text-red-600' : 'text-slate-800'}>
                            {p.current_stock}
                          </span>
                          <span className="text-[10px] text-slate-400 block">mín: {p.min_stock}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isLow ? 'Stock Bajo' : 'Disponible'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Submodule: Categorías */}
      {activeSubmodule === 'categorias' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Categorías de Producto</h2>
              <p className="text-xs text-slate-500">Clasifica tu catálogo para reportes de rentabilidad y búsqueda ágil</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Nueva Categoría
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                    🏷️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                    <p className="text-xs text-slate-500">
                      {products.filter(p => p.categories?.name === cat.name).length} productos en catálogo
                    </p>
                    {cat.description && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">{cat.description}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Almacenes */}
      {activeSubmodule === 'almacenes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sedes y Almacenes</h2>
              <p className="text-xs text-slate-500">Control multi-sucursal y transferencias entre depósitos</p>
            </div>
            <button 
              onClick={() => setShowWarehouseModal(true)}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nuevo Almacén
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {warehouses.map((alm) => (
              <div key={alm.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {alm.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{alm.name}</h3>
                  <p className="text-xs text-slate-500">{alm.location || 'Sede operativa Gestia'}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-xs text-slate-600">
                  <span>Productos asignados:</span>
                  <strong className="text-slate-900">
                    {products.filter(p => p.warehouses?.name === alm.name).length}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submodule: Movimientos (Kardex) */}
      {activeSubmodule === 'movimientos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Kardex y Movimientos de Inventario</h2>
              <p className="text-xs text-slate-500">Registro inmutable de entradas, salidas, ventas y ajustes en tiempo real</p>
            </div>
            <button 
              onClick={loadAllData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refrescar Kardex
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {movements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aún no hay movimientos registrados en el Kardex. Los movimientos se generan automáticamente al realizar ventas o compras.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3.5">Fecha & Hora</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">Motivo / Ref</th>
                    <th className="p-3.5 text-center">Cant.</th>
                    <th className="p-3.5 text-center">Antes / Después</th>
                    <th className="p-3.5">Almacén</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((m) => {
                    const isPositive = m.type === 'ENTRADA' || m.type === 'COMPRA';
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3.5 text-slate-500 font-mono">
                          {m.created_at ? new Date(m.created_at).toLocaleString('es-PE') : '-'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">{m.products?.name || 'Producto'}</td>
                        <td className="p-3.5 text-slate-600">{m.reason || '-'}</td>
                        <td className={`p-3.5 text-center font-bold font-mono ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {isPositive ? `+${m.quantity}` : `-${m.quantity}`}
                        </td>
                        <td className="p-3.5 text-center text-slate-500 font-mono text-[11px]">
                          {m.stock_before} → <strong>{m.stock_after}</strong>
                        </td>
                        <td className="p-3.5 text-slate-600">{m.warehouses?.name || 'Almacén Central'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Submodule: Stock Mínimo */}
      {activeSubmodule === 'stock_minimo' && (
        <div className="space-y-4">
          {products.filter(p => p.current_stock <= p.min_stock).length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-sm">
                    {products.filter(p => p.current_stock <= p.min_stock).length} Productos alcanzaron o superaron el stock mínimo
                  </h3>
                  <p className="text-xs text-amber-700">Se recomienda emitir órdenes de compra para evitar quiebre de stock.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-semibold">
              ✅ Todos los productos tienen stock saludable por encima del mínimo.
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Almacén</th>
                  <th className="p-3.5 text-center">Stock Actual</th>
                  <th className="p-3.5 text-center">Stock Mínimo</th>
                  <th className="p-3.5 text-center">Déficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.filter(p => p.current_stock <= p.min_stock).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span>{p.image_icon || '📦'}</span>
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{p.sku}</td>
                    <td className="p-3.5 text-slate-600">{p.warehouses?.name || 'Almacén Central'}</td>
                    <td className="p-3.5 text-center font-bold text-red-600">{p.current_stock} und</td>
                    <td className="p-3.5 text-center font-semibold text-slate-600">{p.min_stock} und</td>
                    <td className="p-3.5 text-center text-red-600 font-bold">
                      -{p.min_stock - p.current_stock} und
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Agregar Producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Registrar Nuevo Producto</h3>
            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mochila Antirrobo USB"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Código</label>
                  <input
                    type="text"
                    placeholder="Auto-generado si se deja vacío"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emoji / Icono</label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-center text-base"
                  />
                </div>
              </div>

              {/* Categoría con creación rápida */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Categoría</label>
                  <button 
                    type="button"
                    onClick={() => setShowQuickCat(!showQuickCat)}
                    className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold cursor-pointer"
                  >
                    {showQuickCat ? 'Cerrar' : '+ Crear nueva'}
                  </button>
                </div>
                {showQuickCat ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre de nueva categoría"
                      value={quickCatName}
                      onChange={(e) => setQuickCatName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-blue-300 rounded-xl outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCat}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                ) : null}
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Almacén con creación rápida */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Almacén de Ubicación</label>
                  <button 
                    type="button"
                    onClick={() => setShowQuickWh(!showQuickWh)}
                    className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold cursor-pointer"
                  >
                    {showQuickWh ? 'Cerrar' : '+ Crear nuevo'}
                  </button>
                </div>
                {showQuickWh ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre de nuevo almacén"
                      value={quickWhName}
                      onChange={(e) => setQuickWhName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-blue-300 rounded-xl outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddWh}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                ) : null}
                <select
                  value={newWarehouseId}
                  onChange={(e) => setNewWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Venta (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Costo Unitario (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Nueva Categoría</h3>
            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calzado deportivo"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  placeholder="Breve descripción..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Almacén */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Nuevo Almacén / Sede</h3>
            <form onSubmit={handleAddWarehouse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Sede</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Almacén Sur Chorrillos"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación / Dirección</label>
                <input
                  type="text"
                  placeholder="Av. Huaylas 1234..."
                  value={newWhLocation}
                  onChange={(e) => setNewWhLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWarehouseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  Crear Almacén
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Landmark, 
  PieChart, 
  FileText,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Receipt,
  Users
} from 'lucide-react';
import { 
  financeService, 
  FinancialAccountDb, 
  FinancialTransactionDb, 
  CreditAccountDb,
  TransactionFlow,
  FinancialAccountType,
  CreditType
} from '../../services/financeService';
import { salesService, SaleDb, ClientDb } from '../../services/salesService';
import { purchasesService, SupplierDb } from '../../services/purchasesService';

interface FinanzasViewProps {
  activeSubmodule: string;
}

export const FinanzasView: React.FC<FinanzasViewProps> = ({ activeSubmodule }) => {
  // ESTADOS PRINCIPALES
  const [accounts, setAccounts] = useState<FinancialAccountDb[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransactionDb[]>([]);
  const [credits, setCredits] = useState<CreditAccountDb[]>([]);
  const [sales, setSales] = useState<SaleDb[]>([]);
  const [clients, setClients] = useState<ClientDb[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDb[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [creditTab, setCreditTab] = useState<'POR_COBRAR' | 'POR_PAGAR'>('POR_COBRAR');

  // MODALES
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState<CreditAccountDb | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);

  // FORMULARIOS TEMPORALES
  const [newTransaction, setNewTransaction] = useState({
    flow_type: 'EGRESO' as TransactionFlow,
    category: 'Mercadería',
    concept: '',
    amount: 0,
    payment_method: 'Transferencia BCP',
    account_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_type: 'Banco' as FinancialAccountType,
    bank_name: '',
    account_number: '',
    currency: 'PEN',
    current_balance: 0
  });

  const [newCredit, setNewCredit] = useState({
    type: 'POR_COBRAR' as CreditType,
    client_id: '',
    supplier_id: '',
    total_amount: 0,
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  });

  // CARGA DE DATOS
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [accData, trxData, credData, salesData, clientsData, suppData] = await Promise.all([
        financeService.getAccounts(),
        financeService.getTransactions(),
        financeService.getCreditAccounts(),
        salesService.getSales(),
        salesService.getClients(),
        purchasesService.getSuppliers()
      ]);
      setAccounts(accData);
      setTransactions(trxData);
      setCredits(credData);
      setSales(salesData);
      setClients(clientsData);
      setSuppliers(suppData);
    } catch (err: any) {
      console.error('Error cargando Finanzas:', err);
      setErrorMsg(err.message || 'Error al conectar con el módulo de finanzas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CÁLCULOS FINANCIEROS GLOBALES
  const totalBalanceSoles = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + Number(curr.current_balance), 0);
  }, [accounts]);

  const totalIngresos = useMemo(() => {
    // Suma de transacciones directas de ingreso + ventas registradas
    const trxIngresos = transactions
      .filter(t => t.flow_type === 'INGRESO' && t.status === 'Pagado')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const salesIngresos = sales
      .filter(s => s.status === 'Pagado')
      .reduce((acc, curr) => acc + Number(curr.total), 0);
    return trxIngresos + salesIngresos;
  }, [transactions, sales]);

  const totalEgresos = useMemo(() => {
    return transactions
      .filter(t => t.flow_type === 'EGRESO' && t.status === 'Pagado')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [transactions]);

  const totalPorCobrar = useMemo(() => {
    return credits
      .filter(c => c.type === 'POR_COBRAR' && c.status !== 'Pagado')
      .reduce((acc, curr) => acc + (Number(curr.total_amount) - Number(curr.paid_amount)), 0);
  }, [credits]);

  const totalPorPagar = useMemo(() => {
    return credits
      .filter(c => c.type === 'POR_PAGAR' && c.status !== 'Pagado')
      .reduce((acc, curr) => acc + (Number(curr.total_amount) - Number(curr.paid_amount)), 0);
  }, [credits]);

  // HANDLERS DE CREACIÓN
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.concept || newTransaction.amount <= 0) {
      alert('Ingrese un concepto válido y un monto mayor a 0');
      return;
    }
    try {
      await financeService.createTransaction({
        ...newTransaction,
        account_id: newTransaction.account_id || undefined
      });
      setIsTransactionModalOpen(false);
      setNewTransaction({
        flow_type: 'EGRESO',
        category: 'Mercadería',
        concept: '',
        amount: 0,
        payment_method: 'Transferencia BCP',
        account_id: accounts[0]?.id || '',
        date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err: any) {
      alert(`Error registrando movimiento: ${err.message}`);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.account_name) {
      alert('Ingrese el nombre de la cuenta');
      return;
    }
    try {
      await financeService.createAccount(newAccount);
      setIsAccountModalOpen(false);
      setNewAccount({
        account_name: '',
        account_type: 'Banco',
        bank_name: '',
        account_number: '',
        currency: 'PEN',
        current_balance: 0
      });
      loadData();
    } catch (err: any) {
      alert(`Error creando cuenta bancaria: ${err.message}`);
    }
  };

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCredit.total_amount <= 0) {
      alert('El monto del crédito debe ser mayor a 0');
      return;
    }
    if (newCredit.type === 'POR_COBRAR' && !newCredit.client_id) {
      alert('Seleccione un cliente para la cuenta por cobrar');
      return;
    }
    if (newCredit.type === 'POR_PAGAR' && !newCredit.supplier_id) {
      alert('Seleccione un proveedor para la cuenta por pagar');
      return;
    }
    try {
      await financeService.createCreditAccount(newCredit);
      setIsCreditModalOpen(false);
      setNewCredit({
        type: creditTab,
        client_id: '',
        supplier_id: '',
        total_amount: 0,
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
      });
      loadData();
    } catch (err: any) {
      alert(`Error registrando crédito: ${err.message}`);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreditForPayment || paymentAmountInput <= 0) {
      alert('Monto de abono inválido');
      return;
    }
    try {
      await financeService.recordCreditPayment(selectedCreditForPayment.id, paymentAmountInput);
      setIsPaymentModalOpen(false);
      setSelectedCreditForPayment(null);
      setPaymentAmountInput(0);
      loadData();
    } catch (err: any) {
      alert(`Error al registrar abono: ${err.message}`);
    }
  };

  // FILTRADO DE MOVIMIENTOS
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.payment_method && t.payment_method.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchTerm, categoryFilter]);

  const egresosList = useMemo(() => {
    return filteredTransactions.filter(t => t.flow_type === 'EGRESO');
  }, [filteredTransactions]);

  const ingresosList = useMemo(() => {
    return filteredTransactions.filter(t => t.flow_type === 'INGRESO');
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Alerta de Error si ocurre */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: INGRESOS Y FACTURACIÓN */}
      {/* ========================================================= */}
      {activeSubmodule === 'ingresos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registro de Ingresos y Facturación</h2>
              <p className="text-xs text-slate-500">Cobros comerciales de ventas, otros ingresos operativos y abonos bancarios</p>
            </div>
            <button 
              onClick={() => {
                setNewTransaction({ ...newTransaction, flow_type: 'INGRESO', category: 'Cobro Extra' });
                setIsTransactionModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Registrar Ingreso Extra
            </button>
          </div>

          {/* Tarjetas KPI de Ingresos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Ingresos Totales Acumulados</span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                S/ {totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Ventas POS + Entradas financieras
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Cobranzas Pendientes por Cobrar</span>
              <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
                S/ {totalPorCobrar.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {credits.filter(c => c.type === 'POR_COBRAR' && c.status !== 'Pagado').length} cuentas activas
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Ticket Promedio en Ventas</span>
              <div className="text-2xl font-bold text-blue-600 mt-1 font-mono">
                S/ {sales.length > 0 ? (sales.reduce((a, c) => a + Number(c.total), 0) / sales.length).toFixed(2) : '0.00'}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">{sales.length} órdenes facturadas</span>
            </div>
          </div>

          {/* Tabla de Ventas & Ingresos Recientes */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Historial de Ingresos Registrados</h3>
              <span className="text-xs text-slate-500">{sales.length + ingresosList.length} transacciones</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Origen / Concepto</th>
                  <th className="p-3.5">Cliente / Pagador</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Medio de Pago</th>
                  <th className="p-3.5 text-right">Monto</th>
                  <th className="p-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 && ingresosList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No hay ingresos ni ventas registradas aún.
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* Ventas del POS */}
                    {sales.map(s => (
                      <tr key={`sale-${s.id}`} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-800">
                          <span className="text-blue-600 font-mono">#{s.sale_number}</span> Venta Comercial
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">
                          {s.clients?.full_name || 'Cliente Mostrador'}
                        </td>
                        <td className="p-3.5 text-slate-500">{s.created_at.split('T')[0]}</td>
                        <td className="p-3.5 text-slate-600">{s.payment_method}</td>
                        <td className="p-3.5 text-right font-bold text-emerald-600 font-mono">
                          + S/ {Number(s.total).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Otros Ingresos directos */}
                    {ingresosList.map(ing => (
                      <tr key={`ing-${ing.id}`} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-800">
                          {ing.concept} <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold ml-1">{ing.category}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {ing.financial_accounts?.account_name || 'Caja / Banco'}
                        </td>
                        <td className="p-3.5 text-slate-500">{ing.date}</td>
                        <td className="p-3.5 text-slate-600">{ing.payment_method || '-'}</td>
                        <td className="p-3.5 text-right font-bold text-emerald-600 font-mono">
                          + S/ {Number(ing.amount).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {ing.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: GASTOS & EGRESOS */}
      {/* ========================================================= */}
      {activeSubmodule === 'egresos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Egresos, Costos y Gastos Fijos</h2>
              <p className="text-xs text-slate-500">Planilla, alquiler de local, servicios públicos y pagos a proveedores</p>
            </div>
            <button 
              onClick={() => {
                setNewTransaction({ ...newTransaction, flow_type: 'EGRESO', category: 'Gastos Fijos' });
                setIsTransactionModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Registrar Egreso
            </button>
          </div>

          {/* Barra de Filtros para Egresos */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar egreso por concepto o medio de pago..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Categoría:</span>
              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="all">Todas las categorías</option>
                <option value="Mercadería">Mercadería</option>
                <option value="Gastos Fijos">Gastos Fijos</option>
                <option value="Servicios">Servicios</option>
                <option value="Planilla">Planilla</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Tabla de Egresos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Concepto</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Cuenta Origen</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Medio de Pago</th>
                  <th className="p-3.5 text-right">Monto</th>
                  <th className="p-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {egresosList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No hay egresos registrados con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  egresosList.map(eg => (
                    <tr key={eg.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-800">{eg.concept}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {eg.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {eg.financial_accounts?.account_name || 'Caja General'}
                      </td>
                      <td className="p-3.5 text-slate-500">{eg.date}</td>
                      <td className="p-3.5 text-slate-600">{eg.payment_method || '-'}</td>
                      <td className="p-3.5 text-right font-bold text-rose-600 font-mono">
                        - S/ {Number(eg.amount).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {eg.status}
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

      {/* ========================================================= */}
      {/* SUBMÓDULO: CUENTAS BANCARIAS Y CAJAS */}
      {/* ========================================================= */}
      {activeSubmodule === 'cuentas' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cuentas Bancarias y Tesorería</h2>
              <p className="text-xs text-slate-500">Conciliación con entidades financieras, billeteras digitales y saldo consolidado</p>
            </div>
            <button 
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nueva Cuenta / Caja
            </button>
          </div>

          {/* Tarjeta de Saldo Consolidado */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-medium text-slate-300">Saldo Total Consolidado en Tesorería</span>
              <div className="text-3xl font-extrabold font-mono mt-1 text-white tracking-tight">
                S/ {totalBalanceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-1">Disponible inmediatamente a través de todas las cuentas y cajas activas</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-semibold text-emerald-400 border border-white/10">
                {accounts.length} Cuentas Operativas
              </span>
            </div>
          </div>

          {/* Grid de Cuentas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map(acc => (
              <div 
                key={acc.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      {acc.account_type === 'Banco' ? <Landmark className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {acc.account_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{acc.account_name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{acc.account_number || acc.bank_name || 'Efectivo en Tienda'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Saldo Actual</span>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                    {acc.currency === 'USD' ? '$' : 'S/'} {Number(acc.current_balance).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: CUENTAS POR COBRAR / PAGAR (CRÉDITOS) */}
      {/* ========================================================= */}
      {activeSubmodule === 'creditos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cartera de Créditos (Cobranzas y Proveedores)</h2>
              <p className="text-xs text-slate-500">Gestión de vencimientos, abonos progresivos y control de liquidez crediticia</p>
            </div>
            <button 
              onClick={() => {
                setNewCredit({ ...newCredit, type: creditTab });
                setIsCreditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo Crédito {creditTab === 'POR_COBRAR' ? 'por Cobrar' : 'por Pagar'}
            </button>
          </div>

          {/* Tabs Por Cobrar vs Por Pagar */}
          <div className="flex gap-3 border-b border-slate-200 pb-2">
            <button
              onClick={() => setCreditTab('POR_COBRAR')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                creditTab === 'POR_COBRAR' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cuentas por Cobrar (Clientes) • S/ {totalPorCobrar.toFixed(2)}
            </button>
            <button
              onClick={() => setCreditTab('POR_PAGAR')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                creditTab === 'POR_PAGAR' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cuentas por Pagar (Proveedores) • S/ {totalPorPagar.toFixed(2)}
            </button>
          </div>

          {/* Tabla de Créditos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">{creditTab === 'POR_COBRAR' ? 'Cliente' : 'Proveedor'}</th>
                  <th className="p-3.5">Documento / RUC</th>
                  <th className="p-3.5">Fecha Vencimiento</th>
                  <th className="p-3.5 text-right">Monto Total</th>
                  <th className="p-3.5 text-right">Abonado</th>
                  <th className="p-3.5 text-right">Saldo Pendiente</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {credits.filter(c => c.type === creditTab).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No hay registros de cuentas {creditTab === 'POR_COBRAR' ? 'por cobrar' : 'por pagar'} en el sistema.
                    </td>
                  </tr>
                ) : (
                  credits.filter(c => c.type === creditTab).map(cred => {
                    const balancePending = Number(cred.total_amount) - Number(cred.paid_amount);
                    return (
                      <tr key={cred.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">
                          {creditTab === 'POR_COBRAR' ? cred.clients?.full_name : cred.suppliers?.company_name}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono">
                          {creditTab === 'POR_COBRAR' ? cred.clients?.doc_number : cred.suppliers?.ruc}
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">{cred.due_date}</td>
                        <td className="p-3.5 text-right font-bold text-slate-800 font-mono">
                          S/ {Number(cred.total_amount).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-right font-medium text-emerald-600 font-mono">
                          S/ {Number(cred.paid_amount).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-right font-bold text-rose-600 font-mono">
                          S/ {balancePending.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cred.status === 'Pagado' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : cred.status === 'Parcial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {cred.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {cred.status !== 'Pagado' && (
                            <button
                              onClick={() => {
                                setSelectedCreditForPayment(cred);
                                setPaymentAmountInput(balancePending);
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 text-[11px]"
                            >
                              + Abonar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMÓDULO: FLUJO DE CAJA */}
      {/* ========================================================= */}
      {activeSubmodule === 'flujo_caja' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Flujo de Caja y Análisis de Liquidez</h2>
            <p className="text-xs text-slate-500">Balance neto en tiempo real calculando ingresos consolidados menos egresos totales</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Ingresos Totales</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600">
                + S/ {totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Egresos Totales</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-600">
                - S/ {totalEgresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <PieChart className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Flujo Neto de Caja</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${totalIngresos - totalEgresos >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {totalIngresos - totalEgresos >= 0 ? '+' : ''} S/ {(totalIngresos - totalEgresos).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REGISTRAR MOVIMIENTO (INGRESO / EGRESO) */}
      {/* ========================================================= */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" /> Registrar {newTransaction.flow_type === 'INGRESO' ? 'Ingreso' : 'Egreso'}
              </h3>
              <button onClick={() => setIsTransactionModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo de Flujo</label>
                  <select 
                    value={newTransaction.flow_type}
                    onChange={e => setNewTransaction({ ...newTransaction, flow_type: e.target.value as TransactionFlow })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="EGRESO">EGRESO (Gasto)</option>
                    <option value="INGRESO">INGRESO (Entrada)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoría</label>
                  <select 
                    value={newTransaction.category}
                    onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Mercadería">Mercadería</option>
                    <option value="Gastos Fijos">Gastos Fijos</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Planilla">Planilla</option>
                    <option value="Cobro Extra">Cobro Extra</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Concepto / Glosa *</label>
                <input 
                  type="text" 
                  required
                  value={newTransaction.concept}
                  onChange={e => setNewTransaction({ ...newTransaction, concept: e.target.value })}
                  placeholder="Ej. Pago de alquiler de tienda junio" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monto (S/) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.1"
                    required
                    value={newTransaction.amount}
                    onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-base"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha</label>
                  <input 
                    type="date"
                    value={newTransaction.date}
                    onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Medio de Pago</label>
                  <select 
                    value={newTransaction.payment_method}
                    onChange={e => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Transferencia BCP">Transferencia BCP</option>
                    <option value="Transferencia BBVA">Transferencia BBVA</option>
                    <option value="Efectivo en Tienda">Efectivo</option>
                    <option value="Yape / Plin">Yape / Plin</option>
                    <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cuenta a Afectar</label>
                  <select 
                    value={newTransaction.account_id}
                    onChange={e => setNewTransaction({ ...newTransaction, account_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Sin afectación inmediata</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} (S/ {Number(acc.current_balance).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NUEVA CUENTA / CAJA */}
      {/* ========================================================= */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" /> Vincular Cuenta o Caja
              </h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre Descriptivo *</label>
                <input 
                  type="text" 
                  required
                  value={newAccount.account_name}
                  onChange={e => setNewAccount({ ...newAccount, account_name: e.target.value })}
                  placeholder="Ej. BCP Soles Operativa, Caja Tienda 2" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo de Cuenta</label>
                  <select 
                    value={newAccount.account_type}
                    onChange={e => setNewAccount({ ...newAccount, account_type: e.target.value as FinancialAccountType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Banco">Banco</option>
                    <option value="Caja Chica">Caja Chica</option>
                    <option value="Billetera Digital">Billetera Digital</option>
                    <option value="Pasarela Online">Pasarela Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Moneda</label>
                  <select 
                    value={newAccount.currency}
                    onChange={e => setNewAccount({ ...newAccount, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="PEN">Soles (PEN S/)</option>
                    <option value="USD">Dólares (USD $)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Entidad Bancaria</label>
                  <input 
                    type="text" 
                    value={newAccount.bank_name}
                    onChange={e => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                    placeholder="Ej. BCP, BBVA, Interbank" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Número de Cuenta</label>
                  <input 
                    type="text" 
                    value={newAccount.account_number}
                    onChange={e => setNewAccount({ ...newAccount, account_number: e.target.value })}
                    placeholder="191-xxxxxxx-0-xx" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Saldo Inicial de Apertura</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newAccount.current_balance}
                  onChange={e => setNewAccount({ ...newAccount, current_balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NUEVO CRÉDITO (POR COBRAR / PAGAR) */}
      {/* ========================================================= */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> Nuevo Crédito {newCredit.type === 'POR_COBRAR' ? 'por Cobrar' : 'por Pagar'}
              </h3>
              <button onClick={() => setIsCreditModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCredit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo de Crédito</label>
                <select 
                  value={newCredit.type}
                  onChange={e => setNewCredit({ ...newCredit, type: e.target.value as CreditType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="POR_COBRAR">Cuenta por Cobrar (a Cliente)</option>
                  <option value="POR_PAGAR">Cuenta por Pagar (a Proveedor)</option>
                </select>
              </div>

              {newCredit.type === 'POR_COBRAR' ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cliente *</label>
                  <select 
                    required
                    value={newCredit.client_id}
                    onChange={e => setNewCredit({ ...newCredit, client_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Seleccione cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.doc_number})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Proveedor *</label>
                  <select 
                    required
                    value={newCredit.supplier_id}
                    onChange={e => setNewCredit({ ...newCredit, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Seleccione proveedor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.company_name} (RUC: {s.ruc})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monto Total (S/) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={newCredit.total_amount}
                    onChange={e => setNewCredit({ ...newCredit, total_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-base"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha de Vencimiento *</label>
                  <input 
                    type="date"
                    required
                    value={newCredit.due_date}
                    onChange={e => setNewCredit({ ...newCredit, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Registrar Crédito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ABONAR A CRÉDITO */}
      {/* ========================================================= */}
      {isPaymentModalOpen && selectedCreditForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Registrar Abono / Pago</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500">Beneficiario / Deudor:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedCreditForPayment.type === 'POR_COBRAR' 
                    ? selectedCreditForPayment.clients?.full_name 
                    : selectedCreditForPayment.suppliers?.company_name}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between">
                <span className="text-slate-500">Saldo Pendiente:</span>
                <span className="font-bold text-rose-600 font-mono">
                  S/ {(Number(selectedCreditForPayment.total_amount) - Number(selectedCreditForPayment.paid_amount)).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Monto del Abono (S/) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  max={Number(selectedCreditForPayment.total_amount) - Number(selectedCreditForPayment.paid_amount)}
                  required
                  value={paymentAmountInput}
                  onChange={e => setPaymentAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-base"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Registrar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

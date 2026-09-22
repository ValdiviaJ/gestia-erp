import { supabase } from '../lib/supabase';

export type FinancialAccountType = 'Banco' | 'Caja Chica' | 'Billetera Digital' | 'Pasarela Online';
export type TransactionFlow = 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA';
export type TransactionStatus = 'Pagado' | 'Pendiente' | 'Anulado';
export type CreditType = 'POR_COBRAR' | 'POR_PAGAR';
export type CreditStatus = 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido';

export interface FinancialAccountDb {
  id: string;
  account_name: string;
  account_type: FinancialAccountType;
  bank_name?: string | null;
  account_number?: string | null;
  currency: string;
  current_balance: number;
  is_active: boolean;
  created_at?: string;
}

export interface CreateFinancialAccountPayload {
  account_name: string;
  account_type: FinancialAccountType;
  bank_name?: string;
  account_number?: string;
  currency?: string;
  current_balance?: number;
}

export interface FinancialTransactionDb {
  id: string;
  account_id?: string | null;
  flow_type: TransactionFlow;
  category: string;
  concept: string;
  amount: number;
  payment_method?: string | null;
  date: string;
  status: TransactionStatus;
  reference_type?: string | null;
  reference_id?: string | null;
  created_at?: string;
  financial_accounts?: {
    id: string;
    account_name: string;
    bank_name?: string | null;
    currency: string;
  } | null;
}

export interface CreateFinancialTransactionPayload {
  account_id?: string;
  flow_type: TransactionFlow;
  category: string;
  concept: string;
  amount: number;
  payment_method?: string;
  date?: string;
  status?: TransactionStatus;
  reference_type?: string;
  reference_id?: string;
}

export interface CreditAccountDb {
  id: string;
  type: CreditType;
  client_id?: string | null;
  supplier_id?: string | null;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: CreditStatus;
  created_at?: string;
  clients?: {
    id: string;
    full_name: string;
    doc_number: string;
    phone?: string | null;
  } | null;
  suppliers?: {
    id: string;
    company_name: string;
    ruc: string;
    phone?: string | null;
  } | null;
}

export interface CreateCreditAccountPayload {
  type: CreditType;
  client_id?: string;
  supplier_id?: string;
  total_amount: number;
  paid_amount?: number;
  due_date: string;
  status?: CreditStatus;
}

export const financeService = {
  // 1. CUENTAS BANCARIAS Y CAJAS
  async getAccounts(): Promise<FinancialAccountDb[]> {
    const { data, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .order('account_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createAccount(payload: CreateFinancialAccountPayload): Promise<FinancialAccountDb> {
    const { data, error } = await supabase
      .from('financial_accounts')
      .insert({
        account_name: payload.account_name,
        account_type: payload.account_type,
        bank_name: payload.bank_name || null,
        account_number: payload.account_number || null,
        currency: payload.currency || 'PEN',
        current_balance: Number(payload.current_balance) || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 2. MOVIMIENTOS FINANCIEROS (INGRESOS / EGRESOS)
  async getTransactions(flowType?: TransactionFlow): Promise<FinancialTransactionDb[]> {
    let query = supabase
      .from('financial_transactions')
      .select(`
        *,
        financial_accounts (
          id,
          account_name,
          bank_name,
          currency
        )
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (flowType) {
      query = query.eq('flow_type', flowType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createTransaction(payload: CreateFinancialTransactionPayload): Promise<FinancialTransactionDb> {
    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('El monto de la transacción debe ser mayor a 0');
    }

    // Insertar la transacción
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert({
        account_id: payload.account_id || null,
        flow_type: payload.flow_type,
        category: payload.category,
        concept: payload.concept,
        amount,
        payment_method: payload.payment_method || null,
        date: payload.date || new Date().toISOString().split('T')[0],
        status: payload.status || 'Pagado',
        reference_type: payload.reference_type || 'MANUAL',
        reference_id: payload.reference_id || null
      })
      .select(`
        *,
        financial_accounts (
          id,
          account_name,
          bank_name,
          currency
        )
      `)
      .single();

    if (error) throw error;

    // Si está pagado y tiene una cuenta asignada, actualizar saldo de la cuenta
    if (payload.account_id && (payload.status === 'Pagado' || !payload.status)) {
      const balanceDelta = payload.flow_type === 'INGRESO' ? amount : -amount;
      
      // Obtener saldo actual
      const { data: acc } = await supabase
        .from('financial_accounts')
        .select('current_balance')
        .eq('id', payload.account_id)
        .single();

      if (acc) {
        const newBalance = Number(acc.current_balance) + balanceDelta;
        await supabase
          .from('financial_accounts')
          .update({ current_balance: newBalance })
          .eq('id', payload.account_id);
      }
    }

    return data;
  },

  async updateTransactionStatus(id: string, status: TransactionStatus): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  // 3. CUENTAS POR COBRAR Y POR PAGAR (CRÉDITO)
  async getCreditAccounts(type?: CreditType): Promise<CreditAccountDb[]> {
    let query = supabase
      .from('credit_accounts')
      .select(`
        *,
        clients (
          id,
          full_name,
          doc_number,
          phone
        ),
        suppliers (
          id,
          company_name,
          ruc,
          phone
        )
      `)
      .order('due_date', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createCreditAccount(payload: CreateCreditAccountPayload): Promise<CreditAccountDb> {
    const { data, error } = await supabase
      .from('credit_accounts')
      .insert({
        type: payload.type,
        client_id: payload.client_id || null,
        supplier_id: payload.supplier_id || null,
        total_amount: Number(payload.total_amount),
        paid_amount: Number(payload.paid_amount) || 0,
        due_date: payload.due_date,
        status: payload.status || 'Pendiente'
      })
      .select(`
        *,
        clients (
          id,
          full_name,
          doc_number,
          phone
        ),
        suppliers (
          id,
          company_name,
          ruc,
          phone
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async recordCreditPayment(creditId: string, paymentAmount: number): Promise<void> {
    const { data: credit, error } = await supabase
      .from('credit_accounts')
      .select('*')
      .eq('id', creditId)
      .single();

    if (error) throw error;
    if (!credit) throw new Error('Cuenta de crédito no encontrada');

    const newPaid = Number(credit.paid_amount) + Number(paymentAmount);
    const total = Number(credit.total_amount);
    const newStatus: CreditStatus = newPaid >= total ? 'Pagado' : newPaid > 0 ? 'Parcial' : 'Pendiente';

    const { error: updateError } = await supabase
      .from('credit_accounts')
      .update({
        paid_amount: newPaid,
        status: newStatus
      })
      .eq('id', creditId);

    if (updateError) throw updateError;
  }
};

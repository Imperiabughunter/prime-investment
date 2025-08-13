
import { supabase } from '../lib/supabase';
import type { Account, Transaction, Loan, Investment } from '../types';

export const databaseService = {
  // Account operations
  async getAccounts(userId: string): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get accounts error:', error);
      return [];
    }
  },

  async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert(account)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create account error:', error);
      return null;
    }
  },

  async updateAccountBalance(accountId: string, balance: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ balance })
        .eq('id', accountId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update account balance error:', error);
      return false;
    }
  },

  // Transaction operations
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          from_account:accounts!transactions_from_account_id_fkey(name),
          to_account:accounts!transactions_to_account_id_fkey(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get transactions error:', error);
      return [];
    }
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create transaction error:', error);
      return null;
    }
  },

  // Loan operations
  async getLoans(userId: string): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get loans error:', error);
      return [];
    }
  },

  async createLoan(loan: Omit<Loan, 'id' | 'created_at' | 'updated_at'>): Promise<Loan | null> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert(loan)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create loan error:', error);
      return null;
    }
  },

  async approveLoan(loanId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'approved' })
        .eq('id', loanId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Approve loan error:', error);
      return false;
    }
  },

  // Investment operations
  async getInvestments(userId: string): Promise<Investment[]> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get investments error:', error);
      return [];
    }
  },

  async createInvestment(investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<Investment | null> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert(investment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create investment error:', error);
      return null;
    }
  }
};

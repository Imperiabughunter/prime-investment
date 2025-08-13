
import { supabase, handleSupabaseError, DbInvestment, DbTransaction, DbLoan } from '../lib/supabase';
import { Investment, Transaction, Loan, InvestmentPlan } from '../types';

export class DataService {
  static async loadUserData(userId: string) {
    try {
      const [investmentsResponse, transactionsResponse, loansResponse, plansResponse] = await Promise.all([
        supabase.from('investments').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('loans').select('*').eq('user_id', userId),
        supabase.from('investment_plans').select('*'),
      ]);

      if (investmentsResponse.error) {
        handleSupabaseError(investmentsResponse.error, 'load investments');
      }
      if (transactionsResponse.error) {
        handleSupabaseError(transactionsResponse.error, 'load transactions');
      }
      if (loansResponse.error) {
        handleSupabaseError(loansResponse.error, 'load loans');
      }
      if (plansResponse.error) {
        handleSupabaseError(plansResponse.error, 'load plans');
      }

      return {
        investments: this.mapDbInvestments(investmentsResponse.data || []),
        transactions: this.mapDbTransactions(transactionsResponse.data || []),
        loans: this.mapDbLoans(loansResponse.data || []),
        plans: this.mapDbPlans(plansResponse.data || []),
      };
    } catch (error: any) {
      throw new Error(`Failed to load user data: ${error.message}`);
    }
  }

  static async createInvestment(userId: string, investment: Omit<Investment, 'id'>) {
    try {
      const dbInvestment = {
        user_id: userId,
        plan_id: investment.planId,
        amount: investment.amount,
        start_date: investment.startDate,
        end_date: investment.endDate,
        status: investment.status,
        expected_return: investment.expectedReturn,
      };

      const { data, error } = await supabase
        .from('investments')
        .insert(dbInvestment)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create investment');
      }

      return this.mapDbInvestment(data);
    } catch (error: any) {
      throw new Error(`Failed to create investment: ${error.message}`);
    }
  }

  static async createTransaction(userId: string, transaction: Omit<Transaction, 'id'>) {
    try {
      const dbTransaction = {
        user_id: userId,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description,
        meta: transaction.meta,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(dbTransaction)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create transaction');
      }

      return this.mapDbTransaction(data);
    } catch (error: any) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  static async createLoan(userId: string, loan: Omit<Loan, 'id'>) {
    try {
      const dbLoan = {
        user_id: userId,
        amount: loan.amount,
        term_months: loan.termMonths,
        interest_rate: loan.interestRate,
        status: loan.status,
      };

      const { data, error } = await supabase
        .from('loans')
        .insert(dbLoan)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create loan');
      }

      return this.mapDbLoan(data);
    } catch (error: any) {
      throw new Error(`Failed to create loan: ${error.message}`);
    }
  }

  private static mapDbInvestments(dbInvestments: DbInvestment[]): Investment[] {
    return dbInvestments.map(this.mapDbInvestment);
  }

  private static mapDbInvestment(dbInvestment: DbInvestment): Investment {
    return {
      id: dbInvestment.id,
      planId: dbInvestment.plan_id,
      amount: dbInvestment.amount,
      startDate: dbInvestment.start_date,
      endDate: dbInvestment.end_date,
      status: dbInvestment.status as Investment['status'],
      expectedReturn: dbInvestment.expected_return,
    };
  }

  private static mapDbTransactions(dbTransactions: DbTransaction[]): Transaction[] {
    return dbTransactions.map(this.mapDbTransaction);
  }

  private static mapDbTransaction(dbTransaction: DbTransaction): Transaction {
    return {
      id: dbTransaction.id,
      type: dbTransaction.type as Transaction['type'],
      amount: dbTransaction.amount,
      date: dbTransaction.created_at,
      status: dbTransaction.status as Transaction['status'],
      description: dbTransaction.description,
      meta: dbTransaction.meta,
    };
  }

  private static mapDbLoans(dbLoans: DbLoan[]): Loan[] {
    return dbLoans.map(this.mapDbLoan);
  }

  private static mapDbLoan(dbLoan: DbLoan): Loan {
    return {
      id: dbLoan.id,
      amount: dbLoan.amount,
      termMonths: dbLoan.term_months,
      interestRate: dbLoan.interest_rate,
      status: dbLoan.status as Loan['status'],
      disbursedToAccountId: '',
      createdAt: dbLoan.created_at,
      approvedAt: dbLoan.approved_at,
    };
  }

  private static mapDbPlans(dbPlans: any[]): InvestmentPlan[] {
    return dbPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      minAmount: plan.min_amount,
      maxAmount: plan.max_amount,
      roi: plan.roi,
      compoundingRate: plan.compounding_rate,
      durationDays: plan.duration_days,
      description: plan.description,
    }));
  }
}

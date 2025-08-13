
import { supabase, handleSupabaseError } from '../lib/supabase';
import { 
  User, 
  Investment, 
  InvestmentPlan, 
  InvestmentType,
  Transaction, 
  Loan, 
  LoanRepayment,
  VirtualAccount, 
  Wallet, 
  Notification,
  Order,
  KYC,
  Admin,
  AdminSettings
} from '../types';

export class DatabaseService {
  // User operations
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        handleSupabaseError(error, 'get user profile');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'update user profile');
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return false;
    }
  }

  // Investment operations
  static async getInvestments(userId: string): Promise<Investment[]> {
    try {
      const { data, error } = await supabase
        .from('Investment')
        .select('*')
        .eq('user_ID', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get investments');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get investments error:', error);
      return [];
    }
  }

  static async createInvestment(investment: Omit<Investment, 'id' | 'created_at'>): Promise<Investment | null> {
    try {
      const { data, error } = await supabase
        .from('Investment')
        .insert([investment])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create investment');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Create investment error:', error);
      return null;
    }
  }

  // Investment Plans operations
  static async getInvestmentPlans(): Promise<InvestmentPlan[]> {
    try {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active')
        .order('roi_percentage', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get investment plans');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get investment plans error:', error);
      return [];
    }
  }

  // Investment Types operations
  static async getInvestmentTypes(): Promise<InvestmentType[]> {
    try {
      const { data, error } = await supabase
        .from('investment_types')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get investment types');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get investment types error:', error);
      return [];
    }
  }

  // Transaction operations
  static async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('Transactions')
        .select('*')
        .eq('user_Id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get transactions');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get transactions error:', error);
      return [];
    }
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('Transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create transaction');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Create transaction error:', error);
      return null;
    }
  }

  // Loan operations
  static async getLoans(userId: string): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('Loan')
        .select('*')
        .eq('user_Id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get loans');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get loans error:', error);
      return [];
    }
  }

  static async applyForLoan(loan: Omit<Loan, 'id' | 'created_at' | 'loanID'>): Promise<Loan | null> {
    try {
      const { data, error } = await supabase
        .from('Loan')
        .insert([loan])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'apply for loan');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Apply for loan error:', error);
      return null;
    }
  }

  // Virtual Account operations
  static async getVirtualAccounts(userId: string): Promise<VirtualAccount[]> {
    try {
      const { data, error } = await supabase
        .from('Virtual Account')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get virtual accounts');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get virtual accounts error:', error);
      return [];
    }
  }

  static async createVirtualAccount(account: Omit<VirtualAccount, 'id' | 'created_at' | 'AccountId'>): Promise<VirtualAccount | null> {
    try {
      const { data, error } = await supabase
        .from('Virtual Account')
        .insert([account])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create virtual account');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Create virtual account error:', error);
      return null;
    }
  }

  // Wallet operations
  static async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from('Wallet')
        .select('*')
        .eq('user_Id', userId)
        .single();

      if (error) {
        handleSupabaseError(error, 'get wallet');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Get wallet error:', error);
      return null;
    }
  }

  static async updateWalletBalance(userId: string, newBalance: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Wallet')
        .update({ balance: newBalance, updatedAt: new Date().toISOString() })
        .eq('user_Id', userId);

      if (error) {
        handleSupabaseError(error, 'update wallet balance');
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Update wallet balance error:', error);
      return false;
    }
  }

  // Notification operations
  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('Notifications')
        .select('*')
        .eq('user_Id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get notifications');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Notifications')
        .update({ Is_Read: true })
        .eq('id', notificationId);

      if (error) {
        handleSupabaseError(error, 'mark notification as read');
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      return false;
    }
  }

  // KYC operations
  static async getKYC(email: string): Promise<KYC | null> {
    try {
      const { data, error } = await supabase
        .from('KYC')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        handleSupabaseError(error, 'get KYC');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Get KYC error:', error);
      return null;
    }
  }

  static async submitKYC(kyc: Omit<KYC, 'id' | 'created_at'>): Promise<KYC | null> {
    try {
      const { data, error } = await supabase
        .from('KYC')
        .insert([kyc])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'submit KYC');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Submit KYC error:', error);
      return null;
    }
  }

  // Order operations
  static async getOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('Orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'get orders');
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get orders error:', error);
      return [];
    }
  }

  static async createOrder(order: Omit<Order, 'id' | 'created_at' | 'orderID'>): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('Orders')
        .insert([order])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create order');
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Create order error:', error);
      return null;
    }
  }
}

export const databaseService = new DatabaseService();

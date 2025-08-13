export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  lastSignInAt?: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  from_account_id?: string;
  to_account_id?: string;
  amount: number;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paid';
  monthly_payment: number;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etf';
  amount_invested: number;
  current_value: number;
  shares: number;
  purchase_price: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface User {
  user_id: string;
  email: string;
  display_name: string;
  photo_url: string;
  walletBalance: number;
  role: string;
  Investment: string[];
  fcm_token?: string;
  InvestmentBalance: number;
  status: string;
  created_at: string;
}

export interface Investment {
  id: number;
  user_ID: string;
  amount: number;
  minAmount: number;
  maxAmount: number;
  'Return On Investment': number;
  durationValue: number;
  durationUnit: string;
  startDate: string;
  maturityDate: string;
  status: string;
  payoutAmount: number;
  InvestmentBalance: number;
  InvestmentID: string;
  InvestmentType: string;
  'Expected Profit': number;
  payment_method: string;
  payment_gateway_reference?: string;
  payment_status: string;
  created_at: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  roi_percentage: number;
  duration_months: number;
  risk_level: 'Low' | 'Medium' | 'High';
  status: string;
  created_at: string;
}

export interface InvestmentType {
  id: number;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minDurationValue: number;
  maxDurationValue: number;
  minDurationUnit: string;
  maxDurationUnit: string;
  defaultROI: number;
  compoundfrequency: string;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_Id: string;
  type: string;
  method: string;
  amount: number;
  status: string;
  referenceCode: string;
  timestamp: string;
  currency: string;
  'Sender Account': string;
  receipientAccount: string;
  transactionID: string;
  payment_gateway?: string;
  crypto_currency?: string;
  gateway_transaction_id?: string;
  payment_confirmation_code?: string;
  created_at: string;
}

export interface Loan {
  id: number;
  user_Id: string;
  loanAmount: number;
  interestRate: number;
  durationValue: number;
  durationUnit: string;
  status: string;
  applicationDate: string;
  approvalDate?: string;
  dueDate: string;
  totalPayable: number;
  amountRepaid: number;
  loanID: string;
  created_at: string;
}

export interface LoanRepayment {
  id: number;
  amount: number;
  date: string;
  method: string;
  loan_balance: number;
  created_at: string;
}

export interface VirtualAccount {
  id: number;
  user_id: string;
  accountNumber: number;
  bankName: string;
  accountName: string;
  balance: number;
  currency: string;
  accountType: string;
  status: string;
  updatedAt: string;
  createdByAdmin: boolean;
  lastTransaction?: string;
  linkedToWallet: boolean;
  AccountId: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_Id: string;
  balance: number;
  updatedAt: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_Id: string;
  title: string;
  message: string;
  Is_Read: boolean;
  created_At: string;
  type: string;
  action_url?: string;
  created_at: string;
}

export interface Order {
  id: number;
  orderID: string;
  type: string;
  createdDate: string;
  status: string;
  amount: number;
  user_id: string;
  transactionID: string;
  description: string;
  created_at: string;
}

export interface KYC {
  id: number;
  full_name: string;
  email: string;
  phone_number: number;
  country: string;
  city: string;
  Address: string;
  created_at: string;
}

export interface Admin {
  id: number;
  user_id: string;
  permissions: string[];
  IsActive: boolean;
  lastLogin?: string;
  updatedAt?: string;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  key: string;
  value: string;
  created_at: string;
}

// Legacy interfaces for backward compatibility
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

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

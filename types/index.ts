
export type Account = {
  id: string;
  name: string;
  number: string;
  balance: number;
};

export type InvestmentPlan = {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roi: number; // total ROI for the duration (e.g., 0.2 => 20%)
  compoundingRate: number; // number of times compounded per duration period
  durationDays: number;
  description: string;
};

export type Investment = {
  id: string;
  planId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
  expectedReturn: number;
};

export type Loan = {
  id: string;
  amount: number;
  termMonths: number;
  interestRate: number;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  disbursedToAccountId: string;
  createdAt: string;
  approvedAt?: string;
};

export type Transaction = {
  id: string;
  type: 'loan' | 'investment' | 'transfer' | 'deposit';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  meta?: Record<string, any>;
};

export type AppState = {
  accounts: Account[];
  plans: InvestmentPlan[];
  investments: Investment[];
  loans: Loan[];
  transactions: Transaction[];
};

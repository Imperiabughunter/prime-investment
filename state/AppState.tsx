
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { seedPlans } from '../data/plans';
import { Account, AppState, Investment, InvestmentPlan, Loan, Transaction } from '../types';
import { randomId } from '../utils/randomId';

type Action =
  | { type: 'TRANSFER'; fromId: string; toId: string; amount: number }
  | { type: 'DEPOSIT'; accountId: string; amount: number; description?: string }
  | { type: 'LOAN_APPLY'; loan: Loan }
  | { type: 'LOAN_APPROVE'; loanId: string }
  | { type: 'INVEST'; investment: Investment; accountId: string }
  ;

const initialAccounts: Account[] = [
  { id: 'acc1', name: 'Wall Street Bank', number: '**** 1234', balance: 3500 },
  { id: 'acc2', name: 'Prime Savings', number: '**** 9876', balance: 1200 },
];

const initialState: AppState = {
  accounts: initialAccounts,
  plans: seedPlans,
  investments: [],
  loans: [],
  transactions: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TRANSFER': {
      const { fromId, toId, amount } = action;
      const from = state.accounts.find((a) => a.id === fromId);
      const to = state.accounts.find((a) => a.id === toId);
      if (!from || !to) {
        console.log('Transfer: account not found');
        throw new Error('Account not found.');
      }
      if (amount <= 0) throw new Error('Amount must be greater than 0.');
      if (from.balance < amount) throw new Error('Insufficient balance for transfer.');
      const accounts = state.accounts.map((a) =>
        a.id === fromId ? { ...a, balance: a.balance - amount } : a.id === toId ? { ...a, balance: a.balance + amount } : a
      );
      const tx: Transaction = {
        id: randomId('tx'),
        type: 'transfer',
        amount,
        date: new Date().toISOString(),
        status: 'completed',
        description: `Transfer from ${from.name} to ${to.name}`,
      };
      return { ...state, accounts, transactions: [tx, ...state.transactions] };
    }
    case 'DEPOSIT': {
      const { accountId, amount, description } = action;
      const accounts = state.accounts.map((a) => (a.id === accountId ? { ...a, balance: a.balance + amount } : a));
      const tx: Transaction = {
        id: randomId('tx'),
        type: 'deposit',
        amount,
        date: new Date().toISOString(),
        status: 'completed',
        description: description || 'Deposit',
      };
      return { ...state, accounts, transactions: [tx, ...state.transactions] };
    }
    case 'LOAN_APPLY': {
      return { ...state, loans: [action.loan, ...state.loans] };
    }
    case 'LOAN_APPROVE': {
      const loan = state.loans.find((l) => l.id === action.loanId);
      if (!loan) throw new Error('Loan not found.');
      if (loan.status !== 'pending') throw new Error('Loan not pending.');

      const updatedLoans = state.loans.map((l) => (l.id === loan.id ? { ...l, status: 'approved', approvedAt: new Date().toISOString() } : l));
      const accounts = state.accounts.map((a) =>
        a.id === loan.disbursedToAccountId ? { ...a, balance: a.balance + loan.amount } : a
      );

      const tx: Transaction = {
        id: randomId('tx'),
        type: 'loan',
        amount: loan.amount,
        date: new Date().toISOString(),
        status: 'completed',
        description: `Loan approved (${loan.termMonths} mo @ ${(loan.interestRate * 100).toFixed(1)}%)`,
      };

      return { ...state, loans: updatedLoans, accounts, transactions: [tx, ...state.transactions] };
    }
    case 'INVEST': {
      const inv = action.investment;
      // lock funds by deducting from account immediately
      const accounts = state.accounts.map((a) =>
        a.id === action.accountId ? { ...a, balance: a.balance - inv.amount } : a
      );
      const tx: Transaction = {
        id: randomId('tx'),
        type: 'investment',
        amount: inv.amount,
        date: new Date().toISOString(),
        status: 'completed',
        description: `Invested in ${state.plans.find((p) => p.id === inv.planId)?.name || 'plan'}`,
      };
      return { ...state, accounts, investments: [inv, ...state.investments], transactions: [tx, ...state.transactions] };
    }
    default:
      console.log('Unknown action dispatched');
      return state;
  }
}

const AppStateCtx = createContext<
  AppState & {
    totalBalance: number;
    transferBetweenAccounts: (fromId: string, toId: string, amount: number) => void;
    applyForLoan: (amount: number, termMonths: number, interestRate: number, disburseToAccountId: string) => Loan;
    approveLoan: (loanId: string) => void;
    investInPlan: (planId: string, amount: number, fromAccountId: string) => Investment;
    estimatePlanReturn: (plan: InvestmentPlan, amount: number) => { expectedReturn: number; maturityAmount: number };
  }
>({} as any);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const totalBalance = useMemo(() => state.accounts.reduce((sum, a) => sum + a.balance, 0), [state.accounts]);

  const transferBetweenAccounts = (fromId: string, toId: string, amount: number) => {
    dispatch({ type: 'TRANSFER', fromId, toId, amount });
  };

  const applyForLoan = (amount: number, termMonths: number, interestRate: number, disburseToAccountId: string) => {
    const loan: Loan = {
      id: randomId('loan'),
      amount,
      termMonths,
      interestRate,
      status: 'pending',
      disbursedToAccountId,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'LOAN_APPLY', loan });
    return loan;
  };

  const approveLoan = (loanId: string) => {
    dispatch({ type: 'LOAN_APPROVE', loanId });
  };

  const estimatePlanReturn = (plan: InvestmentPlan, amount: number) => {
    if (amount <= 0) return { expectedReturn: 0, maturityAmount: 0 };
    // Treat plan.roi as total ROI for the duration; compound compoundingRate times.
    // A = P * (1 + roi/compoundingRate)^(compoundingRate)
    const A = amount * Math.pow(1 + plan.roi / plan.compoundingRate, plan.compoundingRate);
    const expectedReturn = A - amount;
    return { expectedReturn, maturityAmount: A };
  };

  const investInPlan = (planId: string, amount: number, fromAccountId: string) => {
    const plan = state.plans.find((p) => p.id === planId);
    const from = state.accounts.find((a) => a.id === fromAccountId);
    if (!plan) throw new Error('Plan not found.');
    if (!from) throw new Error('Funding account not found.');
    if (amount < plan.minAmount) throw new Error(`Amount is below the minimum of $${plan.minAmount}.`);
    if (amount > plan.maxAmount) throw new Error(`Amount exceeds the maximum of $${plan.maxAmount}.`);
    if (from.balance < amount) throw new Error('Insufficient balance for investment.');
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + plan.durationDays);
    const { expectedReturn } = estimatePlanReturn(plan, amount);
    const inv: Investment = {
      id: randomId('inv'),
      planId,
      amount,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status: 'active',
      expectedReturn,
    };
    dispatch({ type: 'INVEST', investment: inv, accountId: fromAccountId });
    return inv;
  };

  const value = {
    ...state,
    totalBalance,
    transferBetweenAccounts,
    applyForLoan,
    approveLoan,
    investInPlan,
    estimatePlanReturn,
  };

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState() {
  return useContext(AppStateCtx);
}

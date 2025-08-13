
import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import { seedPlans } from '../data/plans';
import { Account, AppState, Investment, InvestmentPlan, Loan, Transaction } from '../types';
import { randomId } from '../utils/randomId';
import { AuthService, AuthUser } from '../services/auth';
import { supabase } from '../lib/supabase';

const estimatePlanReturn = (plan: InvestmentPlan, amount: number) => {
  if (amount <= 0) return { expectedReturn: 0, maturityAmount: 0 };
  // Treat plan.roi as total ROI for the duration; compound compoundingRate times.
  // A = P * (1 + roi/compoundingRate)^(compoundingRate)
  const A = amount * Math.pow(1 + plan.roi / plan.compoundingRate, plan.compoundingRate);
  const expectedReturn = A - amount;
  return { expectedReturn, maturityAmount: A };
};

interface AppContextType {
  state: AppState;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createInvestment: (planId: string, amount: number) => Promise<void>;
  applyForLoan: (amount: number, termMonths: number) => Promise<void>;
  depositFunds: (amount: number) => Promise<void>;
  withdrawFunds: (amount: number) => Promise<void>;
  loadUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_INVESTMENT'; payload: Investment }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_ACCOUNT_BALANCE'; payload: { accountId: string; balance: number } }
  | { type: 'SET_PLANS'; payload: InvestmentPlan[] };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return { ...state, ...action.payload };
    case 'ADD_INVESTMENT':
      return {
        ...state,
        investments: [...state.investments, action.payload],
      };
    case 'ADD_LOAN':
      return {
        ...state,
        loans: [...state.loans, action.payload],
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    case 'UPDATE_ACCOUNT_BALANCE':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.accountId
            ? { ...account, balance: action.payload.balance }
            : account
        ),
      };
    case 'SET_PLANS':
      return {
        ...state,
        plans: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AppState = {
  accounts: [],
  plans: seedPlans,
  investments: [],
  loans: [],
  transactions: [],
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          await loadUserData();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        await loadUserData();
      } else {
        // Reset state on logout
        dispatch({ type: 'SET_USER_DATA', payload: initialState });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user's accounts with error handling
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) {
        console.error('Accounts query error:', accountsError);
      }

      // Load user's investments with error handling
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);

      if (investmentsError) {
        console.error('Investments query error:', investmentsError);
      }

      // Load user's loans with error handling
      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id);

      if (loansError) {
        console.error('Loans query error:', loansError);
      }

      // Load user's transactions with error handling
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Transactions query error:', transactionsError);
      }

      // Load investment plans with error handling
      const { data: plans, error: plansError } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active');

      if (plansError) {
        console.error('Plans query error:', plansError);
      }

      dispatch({
        type: 'SET_USER_DATA',
        payload: {
          accounts: accounts || [],
          investments: investments || [],
          loans: loans || [],
          transactions: transactions || [],
          plans: plans || seedPlans,
        },
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default data on error
      dispatch({
        type: 'SET_USER_DATA',
        payload: {
          accounts: [],
          investments: [],
          loans: [],
          transactions: [],
          plans: seedPlans,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await AuthService.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    const result = await AuthService.signUp(email, password, displayName);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    await AuthService.signOut();
    setUser(null);
    dispatch({ type: 'SET_USER_DATA', payload: initialState });
    setLoading(false);
  };

  const createInvestment = async (planId: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const plan = state.plans.find(p => p.id === planId);
    if (!plan) throw new Error('Investment plan not found');

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      throw new Error(`Amount must be between $${plan.minAmount} and $${plan.maxAmount}`);
    }

    const { expectedReturn, maturityAmount } = estimatePlanReturn(plan, amount);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const investment: Investment = {
      id: randomId(),
      planId,
      amount,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      expectedReturn,
    };

    // Create investment in database
    const { error } = await supabase
      .from('investments')
      .insert({
        ...investment,
        user_id: user.id,
        plan_id: planId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        expected_return: expectedReturn,
      });

    if (error) throw error;

    // Create transaction record
    const transaction: Transaction = {
      id: randomId(),
      type: 'investment',
      amount,
      date: new Date().toISOString(),
      status: 'completed',
      description: `Investment in ${plan.name}`,
      meta: { planId, investmentId: investment.id },
    };

    await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
        created_at: transaction.date,
      });

    dispatch({ type: 'ADD_INVESTMENT', payload: investment });
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const applyForLoan = async (amount: number, termMonths: number) => {
    if (!user) throw new Error('User not authenticated');

    const loan: Loan = {
      id: randomId(),
      amount,
      termMonths,
      interestRate: 0.15, // 15% annual rate
      status: 'pending',
      disbursedToAccountId: '', // Will be set when approved
      createdAt: new Date().toISOString(),
    };

    // Create loan in database
    const { error } = await supabase
      .from('loans')
      .insert({
        ...loan,
        user_id: user.id,
        term_months: termMonths,
        interest_rate: loan.interestRate,
        created_at: loan.createdAt,
      });

    if (error) throw error;

    dispatch({ type: 'ADD_LOAN', payload: loan });
  };

  const depositFunds = async (amount: number) => {
    if (!user) throw new Error('User not authenticated');

    // This would integrate with payment gateway
    // For now, simulate successful deposit
    const transaction: Transaction = {
      id: randomId(),
      type: 'deposit',
      amount,
      date: new Date().toISOString(),
      status: 'pending',
      description: `Deposit of $${amount}`,
    };

    await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
        created_at: transaction.date,
      });

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const withdrawFunds = async (amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const transaction: Transaction = {
      id: randomId(),
      type: 'transfer',
      amount: -amount,
      date: new Date().toISOString(),
      status: 'pending',
      description: `Withdrawal of $${amount}`,
    };

    await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
        created_at: transaction.date,
      });

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const contextValue = useMemo<AppContextType>(
    () => ({
      state,
      user,
      loading,
      signIn,
      signUp,
      signOut,
      createInvestment,
      applyForLoan,
      depositFunds,
      withdrawFunds,
      loadUserData,
    }),
    [state, user, loading]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppState = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import { seedPlans } from '../data/plans';
import { Account, AppState, Investment, InvestmentPlan, Loan, Transaction } from '../types';
import { randomId } from '../utils/randomId';
import { AuthService, AuthUser } from '../services/auth';
import { supabase } from '../lib/supabase';
import { databaseService } from '../services/database';

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
  dataLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createInvestment: (planId: string, amount: number) => Promise<void>;
  applyForLoan: (amount: number, termMonths: number) => Promise<void>;
  depositFunds: (amount: number) => Promise<void>;
  withdrawFunds: (amount: number) => Promise<void>;
  loadUserData: (userId: string) => Promise<void>;
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
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAccounts = (accounts: Account[]) => dispatch({ type: 'SET_USER_DATA', payload: { accounts } });
  const setTransactions = (transactions: Transaction[]) => dispatch({ type: 'SET_USER_DATA', payload: { transactions } });
  const setLoans = (loans: Loan[]) => dispatch({ type: 'SET_USER_DATA', payload: { loans } });
  const setInvestments = (investments: Investment[]) => dispatch({ type: 'SET_USER_DATA', payload: { investments } });

  const checkUser = async () => {
    setLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Failed to check user status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        loadUserData(user.id);
      } else {
        resetData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    setDataLoading(true);
    setError(null);

    try {
      const [accountsData, transactionsData, loansData, investmentsData, plansData] = await Promise.all([
        databaseService.getAccounts(userId),
        databaseService.getTransactions(userId),
        databaseService.getLoans(userId),
        databaseService.getInvestments(userId),
        databaseService.getActiveInvestmentPlans()
      ]);

      setAccounts(accountsData);
      setTransactions(transactionsData);
      setLoans(loansData);
      setInvestments(investmentsData);
      dispatch({ type: 'SET_PLANS', payload: plansData });
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setDataLoading(false);
    }
  };

  const resetData = () => {
    setAccounts([]);
    setTransactions([]);
    setLoans([]);
    setInvestments([]);
    dispatch({ type: 'SET_PLANS', payload: seedPlans }); // Reset to default plans
    setError(null);
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError, user: authUser } = await AuthService.signIn(email, password);
      if (authError) {
        setError(authError.message);
        return { error: authError };
      }
      if (authUser) {
        setUser(authUser);
        await loadUserData(authUser.id);
      }
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'An unexpected error occurred during sign-in.');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError, user: authUser } = await AuthService.signUp(email, password, displayName);
      if (authError) {
        setError(authError.message);
        return { error: authError };
      }
      if (authUser) {
        setUser(authUser);
        // Initialize user data after sign up
        await databaseService.initializeUserData(authUser.id, displayName);
        await loadUserData(authUser.id);
      }
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'An unexpected error occurred during sign-up.');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.signOut();
      setUser(null);
      resetData();
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'An unexpected error occurred during sign-out.');
    } finally {
      setLoading(false);
    }
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

    const newInvestment: Omit<Investment, 'id'> = {
      planId,
      amount,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      expectedReturn,
    };

    // Create investment and transaction in database
    try {
      const { investment: createdInvestment, transaction: createdTransaction } = await databaseService.createInvestment(user.id, plan, newInvestment, amount);

      dispatch({ type: 'ADD_INVESTMENT', payload: createdInvestment });
      dispatch({ type: 'ADD_TRANSACTION', payload: createdTransaction });
    } catch (error: any) {
      console.error('Error creating investment:', error);
      throw error;
    }
  };

  const applyForLoan = async (amount: number, termMonths: number) => {
    if (!user) throw new Error('User not authenticated');

    const loan: Omit<Loan, 'id'> = {
      amount,
      termMonths,
      interestRate: 0.15, // 15% annual rate
      status: 'pending',
      disbursedToAccountId: '', // Will be set when approved
      createdAt: new Date().toISOString(),
    };

    try {
      const createdLoan = await databaseService.applyForLoan(user.id, loan);
      dispatch({ type: 'ADD_LOAN', payload: createdLoan });
    } catch (error: any) {
      console.error('Error applying for loan:', error);
      throw error;
    }
  };

  const depositFunds = async (amount: number) => {
    if (!user) throw new Error('User not authenticated');

    // This would integrate with payment gateway
    // For now, simulate successful deposit
    const transaction: Omit<Transaction, 'id'> = {
      type: 'deposit',
      amount,
      date: new Date().toISOString(),
      status: 'pending',
      description: `Deposit of $${amount}`,
    };

    try {
      const createdTransaction = await databaseService.createTransaction(user.id, transaction);
      dispatch({ type: 'ADD_TRANSACTION', payload: createdTransaction });
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  };

  const withdrawFunds = async (amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const transaction: Omit<Transaction, 'id'> = {
      type: 'transfer',
      amount: -amount,
      date: new Date().toISOString(),
      status: 'pending',
      description: `Withdrawal of $${amount}`,
    };

    try {
      const createdTransaction = await databaseService.createTransaction(user.id, transaction);
      dispatch({ type: 'ADD_TRANSACTION', payload: createdTransaction });
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  };

  const contextValue = useMemo<AppContextType>(
    () => ({
      state,
      user,
      loading,
      dataLoading,
      error,
      signIn,
      signUp,
      signOut,
      createInvestment,
      applyForLoan,
      depositFunds,
      withdrawFunds,
      loadUserData,
    }),
    [state, user, loading, dataLoading, error]
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
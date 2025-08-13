import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { AppState, Investment, Loan, Transaction, KYC } from '../types';

interface AppStateContextType {
  state: AppState;
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUserData: () => Promise<void>;
  createInvestment: (investment: Omit<Investment, 'id' | 'created_at' | 'user_ID'>) => Promise<void>;
  applyForLoan: (loan: Omit<Loan, 'id' | 'created_at' | 'user_Id'>) => Promise<void>;
  approveLoan: (loanId: string) => Promise<void>;
  accounts: any[];
  loans: Loan[];
}

const initialState: AppState = {
  investments: [],
  loans: [],
  transactions: [],
  kyc: null,
  balance: 0,
};

type Action =
  | { type: 'SET_INVESTMENTS'; payload: Investment[] }
  | { type: 'SET_LOANS'; payload: Loan[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_KYC'; payload: KYC | null }
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'RESET_STATE' };

function appStateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_INVESTMENTS':
      return { ...state, investments: action.payload };
    case 'SET_LOANS':
      return { ...state, loans: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_KYC':
      return { ...state, kyc: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      } else {
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        dispatch({ type: 'RESET_STATE' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      Alert.alert('Success', 'Check your email for the confirmation link!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      Alert.alert('Sign Out Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load investments
      const { data: investments, error: investError } = await supabase
        .from('Investment')
        .select('*')
        .eq('user_ID', user.id);

      if (investError) throw investError;
      dispatch({ type: 'SET_INVESTMENTS', payload: investments || [] });

      // Load loans
      const { data: loans, error: loanError } = await supabase
        .from('Loan')
        .select('*')
        .eq('user_Id', user.id);

      if (loanError) throw loanError;
      dispatch({ type: 'SET_LOANS', payload: loans || [] });

      // Load KYC
      const { data: kyc, error: kycError } = await supabase
        .from('KYC')
        .select('*')
        .eq('email', user.email)
        .single();

      if (kycError && kycError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw kycError;
      }
      dispatch({ type: 'SET_KYC', payload: kyc || null });

    } catch (error: any) {
      console.error('Error loading user data:', error);
      throw error;
    }
  };

  const createInvestment = async (investmentData: Omit<Investment, 'id' | 'created_at' | 'user_ID'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('Investment')
      .insert({
        ...investmentData,
        user_ID: user.id,
      });

    if (error) throw error;
    await loadUserData();
  };

  const applyForLoan = async (loanData: Omit<Loan, 'id' | 'created_at' | 'user_Id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('Loan')
      .insert({
        ...loanData,
        user_Id: user.id,
        status: 'pending',
      });

    if (error) throw error;
    await loadUserData();
  };

  const approveLoan = async (loanId: string) => {
    const { error } = await supabase
      .from('Loan')
      .update({ status: 'approved' })
      .eq('id', loanId);

    if (error) throw error;
    await loadUserData();
  };

  const value = {
    state,
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    loadUserData,
    createInvestment,
    applyForLoan,
    approveLoan,
    accounts: [], // Mock accounts for now
    loans: state.loans,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
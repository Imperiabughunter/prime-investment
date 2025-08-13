
import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import { 
  User, 
  Investment, 
  InvestmentPlan, 
  Transaction, 
  Loan, 
  VirtualAccount,
  Wallet,
  Notification 
} from '../types';
import { AuthService, AuthUser } from '../services/auth';
import { DatabaseService } from '../services/database';

export interface AppState {
  user: User | null;
  investments: Investment[];
  investmentPlans: InvestmentPlan[];
  transactions: Transaction[];
  loans: Loan[];
  virtualAccounts: VirtualAccount[];
  wallet: Wallet | null;
  notifications: Notification[];
}

type AppAction = 
  | { type: 'SET_USER_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_INVESTMENT'; payload: Investment }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'MARK_NOTIFICATION_READ'; payload: number }
  | { type: 'RESET_DATA' };

export interface AppContextType extends AppState {
  authUser: AuthUser | null;
  loading: boolean;
  dataLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createInvestment: (planId: string, amount: number) => Promise<void>;
  applyForLoan: (amount: number, durationMonths: number) => Promise<void>;
  depositFunds: (amount: number) => Promise<void>;
  withdrawFunds: (amount: number) => Promise<void>;
  loadUserData: (userId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return {
        ...state,
        ...action.payload,
      };
    case 'ADD_INVESTMENT':
      return {
        ...state,
        investments: [action.payload, ...state.investments],
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'ADD_LOAN':
      return {
        ...state,
        loans: [action.payload, ...state.loans],
      };
    case 'UPDATE_WALLET':
      return {
        ...state,
        wallet: action.payload,
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, Is_Read: true }
            : notification
        ),
      };
    case 'RESET_DATA':
      return {
        user: null,
        investments: [],
        investmentPlans: [],
        transactions: [],
        loans: [],
        virtualAccounts: [],
        wallet: null,
        notifications: [],
      };
    default:
      return state;
  }
};

const initialState: AppState = {
  user: null,
  investments: [],
  investmentPlans: [],
  transactions: [],
  loans: [],
  virtualAccounts: [],
  wallet: null,
  notifications: [],
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkUser = async () => {
    setLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      setAuthUser(currentUser);
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
      setAuthUser(user);
      if (user) {
        loadUserData(user.id);
      } else {
        dispatch({ type: 'RESET_DATA' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId?: string) => {
    if (!userId && !authUser?.id) {
      console.error('No user ID provided for loadUserData');
      return;
    }
    
    const userIdToUse = userId || authUser?.id!;
    setDataLoading(true);
    setError(null);

    try {
      const [
        userProfile,
        investments,
        investmentPlans,
        transactions,
        loans,
        virtualAccounts,
        wallet,
        notifications
      ] = await Promise.all([
        DatabaseService.getUserProfile(userIdToUse),
        DatabaseService.getInvestments(userIdToUse),
        DatabaseService.getInvestmentPlans(),
        DatabaseService.getTransactions(userIdToUse),
        DatabaseService.getLoans(userIdToUse),
        DatabaseService.getVirtualAccounts(userIdToUse),
        DatabaseService.getWallet(userIdToUse),
        DatabaseService.getNotifications(userIdToUse)
      ]);

      dispatch({
        type: 'SET_USER_DATA',
        payload: {
          user: userProfile,
          investments,
          investmentPlans,
          transactions,
          loans,
          virtualAccounts,
          wallet,
          notifications
        }
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setDataLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const { user, error } = await AuthService.signIn(email, password);
      if (error) {
        setError(error);
        throw new Error(error);
      }
      setAuthUser(user);
      if (user) {
        await loadUserData(user.id);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      const { user, error } = await AuthService.signUp(email, password);
      if (error) {
        setError(error);
        throw new Error(error);
      }
      setAuthUser(user);
      if (user) {
        await loadUserData(user.id);
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setAuthUser(null);
      dispatch({ type: 'RESET_DATA' });
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message);
      throw error;
    }
  };

  const createInvestment = async (planId: string, amount: number) => {
    if (!authUser) throw new Error('User not authenticated');

    const plan = state.investmentPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Investment plan not found');

    const investment: Omit<Investment, 'id' | 'created_at'> = {
      user_ID: authUser.id,
      amount,
      minAmount: plan.min_amount,
      maxAmount: plan.max_amount,
      'Return On Investment': plan.roi_percentage / 100,
      durationValue: plan.duration_months,
      durationUnit: 'months',
      startDate: new Date().toISOString(),
      maturityDate: new Date(Date.now() + plan.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      payoutAmount: 0,
      InvestmentBalance: amount,
      InvestmentID: `INV_${Date.now()}`,
      InvestmentType: plan.name,
      'Expected Profit': amount * (plan.roi_percentage / 100),
      payment_method: 'wallet',
      payment_status: 'completed'
    };

    try {
      const createdInvestment = await DatabaseService.createInvestment(investment);
      if (createdInvestment) {
        dispatch({ type: 'ADD_INVESTMENT', payload: createdInvestment });
      }
    } catch (error: any) {
      console.error('Error creating investment:', error);
      throw error;
    }
  };

  const applyForLoan = async (amount: number, durationMonths: number) => {
    if (!authUser) throw new Error('User not authenticated');

    const interestRate = 0.15; // 15% annual rate
    const totalPayable = amount * (1 + interestRate * (durationMonths / 12));

    const loan: Omit<Loan, 'id' | 'created_at' | 'loanID'> = {
      user_Id: authUser.id,
      loanAmount: amount,
      interestRate,
      durationValue: durationMonths,
      durationUnit: 'months',
      status: 'pending',
      applicationDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalPayable,
      amountRepaid: 0
    };

    try {
      const createdLoan = await DatabaseService.applyForLoan(loan);
      if (createdLoan) {
        dispatch({ type: 'ADD_LOAN', payload: createdLoan });
      }
    } catch (error: any) {
      console.error('Error applying for loan:', error);
      throw error;
    }
  };

  const depositFunds = async (amount: number) => {
    if (!authUser) throw new Error('User not authenticated');

    const transaction: Omit<Transaction, 'id' | 'created_at'> = {
      user_Id: authUser.id,
      type: 'deposit',
      method: 'bank_transfer',
      amount,
      status: 'completed',
      referenceCode: `DEP_${Date.now()}`,
      timestamp: new Date().toISOString(),
      currency: 'USD',
      'Sender Account': 'External Bank',
      receipientAccount: 'Wallet',
      transactionID: `TXN_${Date.now()}`
    };

    try {
      const createdTransaction = await DatabaseService.createTransaction(transaction);
      if (createdTransaction) {
        dispatch({ type: 'ADD_TRANSACTION', payload: createdTransaction });
        // Update wallet balance
        if (state.wallet) {
          const updatedWallet = { ...state.wallet, balance: (state.wallet.balance || 0) + amount };
          await DatabaseService.updateWalletBalance(authUser.id, updatedWallet.balance);
          dispatch({ type: 'UPDATE_WALLET', payload: updatedWallet });
        }
      }
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  };

  const withdrawFunds = async (amount: number) => {
    if (!authUser) throw new Error('User not authenticated');
    if (!state.wallet || state.wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const transaction: Omit<Transaction, 'id' | 'created_at'> = {
      user_Id: authUser.id,
      type: 'withdrawal',
      method: 'bank_transfer',
      amount: -amount,
      status: 'pending',
      referenceCode: `WTH_${Date.now()}`,
      timestamp: new Date().toISOString(),
      currency: 'USD',
      'Sender Account': 'Wallet',
      receipientAccount: 'External Bank',
      transactionID: `TXN_${Date.now()}`
    };

    try {
      const createdTransaction = await DatabaseService.createTransaction(transaction);
      if (createdTransaction) {
        dispatch({ type: 'ADD_TRANSACTION', payload: createdTransaction });
        // Update wallet balance
        const updatedWallet = { ...state.wallet, balance: state.wallet.balance - amount };
        await DatabaseService.updateWalletBalance(authUser.id, updatedWallet.balance);
        dispatch({ type: 'UPDATE_WALLET', payload: updatedWallet });
      }
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const success = await DatabaseService.markNotificationAsRead(notificationId);
      if (success) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const contextValue = useMemo<AppContextType>(
    () => ({
      ...state,
      authUser,
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
      markNotificationAsRead,
    }),
    [state, authUser, loading, dataLoading, error]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppState = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

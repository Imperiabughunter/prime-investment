import { supabase, handleSupabaseError } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
  lastSignInAt?: string;
}

export class AuthService {
  static async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (!email || !password) {
        return { user: null, error: 'Email and password are required' };
      }

      if (password.length < 6) {
        return { user: null, error: 'Password must be at least 6 characters' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation for development
        },
      });

      if (error) {
        handleSupabaseError(error, 'sign up');
      }

      if (!data.user) {
        return { user: null, error: 'Failed to create account' };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        emailConfirmed: data.user.email_confirmed_at !== null,
        lastSignInAt: data.user.last_sign_in_at || undefined,
      };

      return { user: authUser, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (!email || !password) {
        return { user: null, error: 'Email and password are required' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        handleSupabaseError(error, 'sign in');
      }

      if (!data.user) {
        return { user: null, error: 'Invalid credentials' };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        emailConfirmed: data.user.email_confirmed_at !== null,
        lastSignInAt: data.user.last_sign_in_at || undefined,
      };

      return { user: authUser, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        handleSupabaseError(error, 'sign out');
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        emailConfirmed: user.email_confirmed_at !== null,
        lastSignInAt: user.last_sign_in_at || undefined,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          emailConfirmed: session.user.email_confirmed_at !== null,
          lastSignInAt: session.user.last_sign_in_at || undefined,
        };
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }

  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        handleSupabaseError(error, 'reset password');
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
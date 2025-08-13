
import { supabase } from '../lib/supabase';

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface BankDetails {
  accountNumber: string;
  routingNumber: string;
  accountName: string;
  bankName: string;
}

export class PaymentService {
  private static baseUrl = process.env.EXPO_PUBLIC_PAYMENT_API_URL || 'https://api.example-payment-provider.com';
  private static apiKey = process.env.EXPO_PUBLIC_PAYMENT_API_KEY || 'your-api-key';

  static async initiateDeposit(amount: number, userId: string): Promise<PaymentResponse> {
    try {
      const idempotencyKey = `deposit_${userId}_${Date.now()}`;
      
      // Mock payment provider integration
      const response = await fetch(`${this.baseUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          type: 'deposit',
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      // Create pending transaction record
      await supabase.from('transactions').insert({
        id: data.transactionId,
        user_id: userId,
        type: 'deposit',
        amount,
        status: 'pending',
        created_at: new Date().toISOString(),
        meta: {
          payment_provider_id: data.transactionId,
          idempotency_key: idempotencyKey,
        },
      });

      return {
        success: true,
        transactionId: data.transactionId,
        paymentUrl: data.paymentUrl,
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  static async confirmPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (data.status === 'completed') {
        // Update transaction status
        await supabase
          .from('transactions')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', transactionId);

        // Update user wallet balance
        const { data: transaction } = await supabase
          .from('transactions')
          .select('user_id, amount')
          .eq('id', transactionId)
          .single();

        if (transaction) {
          await supabase.rpc('increment_wallet_balance', {
            user_id: transaction.user_id,
            amount: transaction.amount,
          });
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return false;
    }
  }

  static async initiateWithdrawal(amount: number, userId: string, bankDetails: BankDetails): Promise<PaymentResponse> {
    try {
      // Check user balance first
      const { data: user } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (!user || user.wallet_balance < amount) {
        return {
          success: false,
          error: 'Insufficient balance',
        };
      }

      // Create withdrawal transaction
      const transactionId = `withdrawal_${userId}_${Date.now()}`;
      
      await supabase.from('transactions').insert({
        id: transactionId,
        user_id: userId,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        created_at: new Date().toISOString(),
        meta: {
          bank_details: bankDetails,
          requires_admin_approval: true,
        },
      });

      // Hold the amount (subtract from available balance)
      await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        amount: -amount,
      });

      return {
        success: true,
        transactionId,
      };
    } catch (error) {
      console.error('Withdrawal initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Withdrawal failed',
      };
    }
  }
}

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabase = createClient(
  Constants.expoConfig?.extra?.supabaseUrl!,
  Constants.expoConfig?.extra?.supabaseAnonKey!
);

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

export const PaymentService = {
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          currency,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },
};
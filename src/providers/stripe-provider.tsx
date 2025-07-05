import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.stripePublishableKey;

interface StripeWrapperProps {
  children: React.ReactNode;
}

export default function StripeWrapper({ children }: StripeWrapperProps) {
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Stripe publishable key not found');
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <>{children}</>
    </StripeProvider>
  );
}
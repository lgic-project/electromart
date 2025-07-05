import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PaymentService } from '../services/payment-service';
import { router, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../store/cart-store';
import { createOrder, createOrderItem } from '../api/api';

export default function PaymentScreen() {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { items, resetCart } = useCartStore();
  
  const { mutateAsync: createSupabaseOrder } = createOrder();
  const { mutateAsync: createSupabaseOrderItem } = createOrderItem();
  
  // Get total amount from route params
  const { totalAmount } = useLocalSearchParams<{ totalAmount: string }>();
  const amount = parseFloat(totalAmount || '0');

  const createOrderInDatabase = async () => {
    try {
      // Create order in database
      const orderData = await createSupabaseOrder({ totalPrice: amount });

      // Safety check
      if (!orderData || !orderData.id) {
        throw new Error('Order creation failed');
      }

      // Filter valid items
      const validItems = items.filter(
        (item) => item && item.id != null && item.quantity > 0
      );

      if (validItems.length === 0) {
        throw new Error('No valid items in cart');
      }

      // Create order items
      await createSupabaseOrderItem(
        validItems.map((item) => ({
          orderId: orderData.id,
          productId: item.id,
          quantity: item.quantity,
        }))
      );

      return orderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    // Validate cart items before payment
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    const validItems = items.filter(
      (item) => item && item.id != null && item.quantity > 0
    );

    if (validItems.length === 0) {
      Alert.alert('Error', 'No valid items in cart');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating payment intent for amount:', amount);
      
      // Create payment intent on backend
      const { client_secret } = await PaymentService.createPaymentIntent(amount);
      
      console.log('Payment intent created successfully');

      // Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(client_secret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Payment error:', error);
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Payment succeeded - now create order in database
        try {
          await createOrderInDatabase();
          
          // Show success message and navigate
          Alert.alert('Success', 'Payment completed and order created successfully!', [
            {
              text: 'OK',
              onPress: () => {
                resetCart();
                router.replace('/(shop)');
              },
            },
          ]);
        } catch (orderError: any) {
          console.error('Order creation error:', orderError);
          // Payment succeeded but order creation failed
          Alert.alert(
            'Payment Successful', 
            'Your payment was processed successfully, but there was an issue creating your order. Please contact support.',
            [
              {
                text: 'OK',
                onPress: () => {
                  resetCart();
                  router.replace('/(shop)');
                },
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Payment process error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (details: any) => {
    console.log('Card details changed:', details);
    setCardDetails(details);
  };

  // Since CardField callback isn't working, we'll use a different approach
  // The payment button will attempt payment and let Stripe handle validation
  const isButtonEnabled = !loading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Payment Details</Text>
        <Text style={styles.amount}>Amount: Rs {amount.toFixed(2)}</Text>
        
        <Text style={styles.instructionText}>
          Enter your card details below:
        </Text>
        
        <CardField
          postalCodeEnabled={false}
          placeholder={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={{
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
            borderColor: '#DEDEDE',
            borderWidth: 1,
            borderRadius: 8,
            fontSize: 16,
          }}
          style={styles.cardContainer}
          onCardChange={handleCardChange}
          autofocus={true}
        />

        <Text style={styles.testCardInfo}>
          Test Card: 4242 4242 4242 4242{'\n'}
          Expiry: Any future date (e.g., 12/34){'\n'}
          CVC: Any 3 digits (e.g., 123)
        </Text>

        <TouchableOpacity
          style={[
            styles.payButton,
            !isButtonEnabled && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={!isButtonEnabled}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay Rs {amount.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Note: If card validation fails, Stripe will show an error message.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  amount: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#28a745',
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
  },
  cardContainer: {
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  testCardInfo: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  payButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
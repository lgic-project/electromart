import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import AuthProvider from "../providers/auth-provider";
import QueryProvider from "../providers/query-provider";
import StripeWrapper from "../providers/stripe-provider";

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <QueryProvider>
          <StripeWrapper>
            <Stack>
              <Stack.Screen
                name="(shop)"
                options={{ headerShown: false, title: "Shop" }}
              />
              <Stack.Screen
                name="categories"
                options={{ headerShown: false, title: "Categories" }}
              />
              <Stack.Screen
                name="product"
                options={{ headerShown: true, title: "Product" }}
              />
              <Stack.Screen
                name="cart"
                options={{ presentation: "modal", title: "Shopping Cart" }}
              />
              <Stack.Screen name ="account" options={{ headerShown: false }} />

              <Stack.Screen name ="forgotpassword" options={{ headerShown: false }} />
              
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen 
                name="payment" 
                options={{ 
                  presentation: "modal", 
                  title: "Payment",
                  headerShown: true 
                }} 
              />
            
            </Stack>
          </StripeWrapper>
        </QueryProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
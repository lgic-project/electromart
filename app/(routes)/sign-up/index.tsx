import SignUpScreen from "@/screens/auth/signup/signup.screen";
import { Stack } from "expo-router";

export default function SignUp() {
  return (<><SignUpScreen /><Stack.Screen options={{ headerShown: false }} /></>
  );
}
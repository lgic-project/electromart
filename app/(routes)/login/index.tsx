
import { Stack } from "expo-router";
import LoginScreen from '@/screens/auth/login/login.screen';



export default function Login() {
  return (
   <>
      <Stack.Screen options={{ headerShown: false }} />
     <LoginScreen/>
    </>

  )
}
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useFonts, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";

import { router } from "expo-router";


export default function OnBoardingScreen() {
    let [fontsLoaded, fontError] = useFonts({
        Raleway_700Bold,
        Nunito_400Regular,
        Nunito_700Bold,
      });
      if (!fontsLoaded && !fontError) {
        return null;
      }
  return (
    <View>
      <Text>onboardingscreen</Text>
    </View>
  )
}
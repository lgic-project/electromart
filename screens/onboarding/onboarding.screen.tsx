import { View, Text, Image, TouchableOpacity,StyleSheet } from "react-native";
import { useFonts, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/styles/onboarding/onboard";
import { router } from "expo-router";
import {Stack} from "expo-router";

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
    
    <LinearGradient
    colors={["#E5ECF9", "#F6F7F9"]}
    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
  >
      <>
      <Stack.Screen options={{ headerShown: false }} /> 
      
    </>

    <View style={styles.firstContainer}>
      <View>
        <Image source={require("@/assets/logo.png")} style={styles.logo} />

        
      </View>
      <View style={styles.titleWrapper}>
          <Image
            style={styles.titleTextShape1}
            source={require("@/assets/onboarding/shape_3.png")}/>
          <Text style={[styles.titleText, { fontFamily: "Raleway_700Bold" }]}>
            Start Buying With
          </Text>
          
        </View>
         

          <View>
          <Image
            style={styles.titleShape3}
            source={require("@/assets/onboarding/shape_6.png")}
          />
          <Text style={[styles.titleText, { fontFamily: "Raleway_700Bold" }]}>
            Gadget-app
          </Text>
        </View>

             <View style={styles.dscpWrapper}>
          <Text style={[styles.dscpText, { fontFamily: "Nunito_400Regular" }]}>
            Explore a variety of Gadgets
          </Text>
          <Text style={[styles.dscpText, { fontFamily: "Nunito_400Regular" }]}>
            in an affordable price
          </Text>
        </View>

         <TouchableOpacity
          style={styles.buttonWrapper}  onPress={() => router.push("./login")}>
          <Text style={[styles.buttonText, { fontFamily: "Nunito_700Bold" }]}>
            Getting Started
          </Text>
        </TouchableOpacity>
     
     
     
    </View>
  </LinearGradient>
  )
}
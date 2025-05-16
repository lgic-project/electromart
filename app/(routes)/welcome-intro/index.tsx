import { StyleSheet, Text, View } from 'react-native'
import {Stack} from "expo-router";

export default function index() {
  return (
     <><>
      <Stack.Screen options={{ headerShown: false }} />

    </><View>
        <Text>index</Text>
      </View></>
  )
}

const styles = StyleSheet.create({})
mport { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! This screen doesn't exist." }} />
      <View style={styles.container}>
        <Link href="/">Go to home screen</Link>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


// Stylesheet used for styling the components within the screen
const styles = StyleSheet.create({
  container: {
    flex: 1,                       // Takes full height of the screen
    justifyContent: 'center',     // Centers content vertically
    alignItems: 'center',         // Centers content horizontally
    backgroundColor: '#f8f8f8',   // Light gray background
    padding: 20,                  // Adds padding around the content
  },
  message: {
    fontSize: 18,                 // Slightly larger font size for readability
    marginBottom: 20,            // Adds space below the message
    color: '#333',               // Dark gray color for the text
    textAlign: 'center',         // Center-aligned text
  },
   link: {
    fontSize: 16,                // Font size for the link text
    color: '#007AFF',           // iOS-style blue link color
    textDecorationLine: 'underline', // Underline the link
  },
});
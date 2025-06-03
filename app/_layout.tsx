// // import { ClerkProvider } from '@clerk/clerk-expo';
// // import { tokenCache } from '@clerk/clerk-expo/token-cache';
// // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // import { useFonts } from 'expo-font';
// // import { Stack } from 'expo-router';
// // import { StatusBar } from 'expo-status-bar';
// // import 'react-native-reanimated';

// // import { useColorScheme } from '@/hooks/useColorScheme';

// // export default function RootLayout() {
// //   const colorScheme = useColorScheme();
// //   const [loaded] = useFonts({
// //     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
// //   });

// //   if (!loaded) {
// //     // Async font loading only occurs in development.
// //     return null;
// //   }

// //   return (
// //     <ClerkProvider tokenCache={tokenCache}>

// //     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
// //       <Stack>
// //         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
// //         <Stack.Screen name="+not-found" />
// //       </Stack>
// //       <StatusBar style="auto" />
// //     </ThemeProvider>
// //     </ClerkProvider>
// //   );
// // }

// import { useColorScheme } from "@/hooks/useColorScheme";
// import { ClerkProvider } from "@clerk/clerk-expo";
// import { tokenCache } from "@clerk/clerk-expo/token-cache";
// import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
// import { useFonts } from "expo-font";
// import { Slot } from "expo-router";
// import 'react-native-reanimated';
// import { SafeAreaProvider } from "react-native-safe-area-context";

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   const [loaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   });

//   if (!loaded) return null;

//   return (
//     <SafeAreaProvider>

//     <ClerkProvider tokenCache={tokenCache}>
//       <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//         <Slot />
//         {/* <StatusBar style="auto" /> */}
//       </ThemeProvider>
//     </ClerkProvider>
//     </SafeAreaProvider>
//   );
// }


import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'
import SafeScreen from "../components/SafeScreen"

export default function RootLayoutNav() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeScreen>
      <Slot />
      </SafeScreen>
    </ClerkProvider>
  )
}
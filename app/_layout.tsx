

import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'
import SafeScreen from "../components/SafeScreen"

export default function RootLayoutNav() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      {/* <SafeScreen> */}
      <Slot />
      {/* </SafeScreen> */}
    </ClerkProvider>
  )
}
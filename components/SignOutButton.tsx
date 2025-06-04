import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export const SignOutButton = () => {
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    try {
      await signOut()
      Linking.openURL(Linking.createURL('/'))
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})

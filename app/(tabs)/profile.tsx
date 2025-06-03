import { SignOutButton } from '@/components/SignOutButton'
import { useUser } from '@clerk/clerk-expo'
import React from 'react'
import { Text, View } from 'react-native'

const profile = () => {
    const { user } = useUser()
  return (
    <View>
      <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
      <Text>Hello {user?.username}</Text>
      <SignOutButton />
    </View>
  )
}

export default profile
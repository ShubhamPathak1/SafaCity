// import SafeScreen from '@/components/SafeScreen'
// import { SignOutButton } from '@/components/SignOutButton'
// import { getRewardForUser } from '@/utils/rewardStorage'
// import { useUser } from '@clerk/clerk-expo'
// import React, { useEffect, useState } from 'react'
// import { Text, View } from 'react-native'

// const profile = () => {
//      const { user } = useUser();
//   const [rewards, setRewards] = useState(0);

//   useEffect(() => {
//     const load = async () => {
//       const username = user?.username || user?.primaryEmailAddress?.emailAddress;
//       if (username) {
//         const points = await getRewardForUser(username);
//         setRewards(points);
//       }
//     };
//     load();
//   }, [user]);
//   return (
//     <SafeScreen>

//     <View>
//       <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
//       <Text>Hello {user?.username}</Text>
//        <Text style={{ fontSize: 18 }}>🎉 Reward Points: {rewards}</Text>

//       <SignOutButton />
//     </View>
//     </SafeScreen>
//   )
// }

// export default profile

import SafeScreen from '@/components/SafeScreen'
import { SignOutButton } from '@/components/SignOutButton'
import { getRewardForUser } from '@/utils/rewardStorage'
import { useUser } from '@clerk/clerk-expo'
import { FontAwesome6 } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'

const Profile = () => {
  const { user } = useUser()
  const [rewards, setRewards] = useState(0)
  const [animation] = useState(new Animated.Value(0))

  useEffect(() => {
    const load = async () => {
      const username = user?.username || user?.primaryEmailAddress?.emailAddress
      if (username) {
        const points = await getRewardForUser(username)
        setRewards(points)
        // Trigger reward animation if points changed
        if (points > 0) {
          Animated.sequence([
            Animated.timing(animation, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true
            }),
            Animated.timing(animation, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true
            })
          ]).start()
        }
      }
    }
    load()
  }, [user])

  const spin = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
    <SafeScreen>
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.imageUrl }}
              style={styles.avatar}
              defaultSource={require('@/assets/images/default-avatar.jpg')}
            />
            <Animated.View style={[styles.rewardBadge, { transform: [{ rotate: spin }] }]}>
              <FontAwesome6 name="crown" size={24} color="#FFD700" />
            </Animated.View>
          </View>
          
          <Text style={styles.name}>
            {user?.firstName || user?.username || 'Eco Warrior'}
          </Text>
          <Text style={styles.email}>
            {user?.emailAddresses[0]?.emailAddress}
          </Text>
        </View>

        {/* Stats Section */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialIcons name="recycling" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Items Recycled</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="earth" size={28} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>3.7kg</Text>
            <Text style={styles.statLabel}>Waste Diverted</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <FontAwesome6 name="leaf" size={28} color="#8BC34A" />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Green Actions</Text>
          </View>
        </View> */}

        {/* Reward Section */}
        <View style={styles.rewardSection}>
          <View style={styles.sectionHeader}>
            <FontAwesome6 name="trophy" size={20} color="#FFC107" />
            <Text style={styles.sectionTitle}>Your Eco Rewards</Text>
          </View>
          
          <View style={styles.rewardCard}>
            <View style={styles.coinContainer}>
              <FontAwesome6 name="coins" size={40} color="#FFD700" />
            </View>
            <View style={styles.rewardDetails}>
              <Text style={styles.rewardPoints}>{rewards} pts</Text>
            </View>
          </View>
        </View>


        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <SignOutButton />
        </View>
      </ScrollView>
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#E0F7FA',
  },
  rewardBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#78909C',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    backgroundColor: '#E3F2FD',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
    marginLeft: 8,
  },
  rewardSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  coinContainer: {
    backgroundColor: '#FFF8E1',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardDetails: {
    flex: 1,
  },
  rewardPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#78909C',
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 4,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#455A64',
  },
  signOutContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
})

export default Profile
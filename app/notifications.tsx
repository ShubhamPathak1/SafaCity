import SafeScreen from '@/components/SafeScreen'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const staticNotifications = [
  {
    title: '🗓️ Waste Collection Schedule',
    body: 'Residential waste will be collected every Monday and Thursday at 7 AM.',
    timestamp: 'June 4, 2025',
  },
  {
    title: '🚫 Plastic Ban Notice',
    body: 'Single-use plastic bags are banned in the city effective from July 1st.',
    timestamp: 'May 31, 2025',
  },
  {
    title: '🗑️ Bulk Waste Pickup',
    body: 'Register for bulk waste pickup by contacting your local ward office before 25th June.',
    timestamp: 'May 28, 2025',
  },
  {
    title: '♻️ E-Waste Drive',
    body: 'An e-waste collection drive will be held at Community Center on June 10th.',
    timestamp: 'May 24, 2025',
  },
]

const Notifications = () => {
  const navigation = useNavigation()

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <MaterialIcons name="notifications-active" color="#1f7f4c" size={28} />
          <Text style={styles.headerText}>Notifications</Text>
        </View>

        <LinearGradient
          colors={['#bbf7d0', '#f0fdf4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divider}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {staticNotifications.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.timestamp}</Text>
                </View>
              </View>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#166534',
    marginLeft: 10,
  },
  divider: {
    height: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#4ade80',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#064e3b',
    flex: 1,
    paddingRight: 10,
  },
  cardBody: {
    fontSize: 14.5,
    color: '#14532d',
    lineHeight: 20,
  },
  badge: {
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
})

export default Notifications

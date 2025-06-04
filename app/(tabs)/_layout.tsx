
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');
export const titleSize = (height + width) * 0.04 / 2;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const Header = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>SafaCity</Text>
       <View style={styles.headerIcons}>
        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <MaterialIcons name="notifications" size={titleSize} color="#1f7f4c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: '#22c55e',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Bin Map',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wastebot"
        options={{
          title: 'WasteBot',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="smart-toy" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Waste Scan',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="center-focus-strong" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          title: 'Feedback',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="feedback" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#e6f4ea',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#bbf7d0',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#166534',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
});

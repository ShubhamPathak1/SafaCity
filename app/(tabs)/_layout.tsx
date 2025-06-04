import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

 const {height, width} = Dimensions.get('window');
export const titleSize = (height+width) * 0.04/2;


export default function TabLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // headerShown: false,
        headerRight: () => (
          <>
              <MaterialIcons 
                name="person"
                size = {titleSize}
                color = "#000"
                style = {{marginRight: titleSize}}
                onPress = {() => {router.push('/profile')}}
                />
                <MaterialIcons 
                  name="notifications"
                  size = {titleSize}
                  color = "#000"
                  style = {{marginRight: titleSize}}
                  onPress = {() => {router.push('/notifications')}}
                />

            </>
    ),
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
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
        name="camera"
        options={{
          title: 'Waste Scan',
          tabBarIcon: ({ color }) => (
      <MaterialIcons name="center-focus-strong" size={28} color={color} />
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
        name="feedback"
        options={{
          title: 'Feedback',
          tabBarIcon: ({ color }) => (
        <MaterialIcons name="feedback" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { display: 'none' }, tabBarActiveTintColor: '#367C9C' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen name="inventoryScreen" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="wishlistScreen" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="TradeReady" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
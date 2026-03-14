import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#367C9C' }}>
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

      {/* Ocultamos estas pantallas de las tabs pero son accesibles por navegación */}
      <Tabs.Screen
        name="inventoryScreen"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="wishlistScreen"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="TradeReady"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
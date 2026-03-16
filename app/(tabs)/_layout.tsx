// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#367C9C' }}>
      {/* Esta es la unica pestaña visible. Las otras son accesibles mediante navegacion pero no tienen icono en las tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          headerShown: false, // Ocultamos el header por defecto de las tabs
        }}
      />
      {/* Ocultamos estas pantallas de las tabs pero son accesibles por navegacion */}
      <Tabs.Screen
        name="inventoryScreen"
        options={{
          href: null, // Esto hace que no aparezca en la barra de pestañas
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
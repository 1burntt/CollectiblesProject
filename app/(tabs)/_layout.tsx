import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  console.log('✅ TabsLayout se está ejecutando');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF8A5C',
        tabBarInactiveTintColor: '#4A5568',
        tabBarStyle: {
          backgroundColor: '#0F1420',
          borderTopColor: '#2A3344',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      {/* Pantalla de inicio (Explorar) - ESTA ES LA ÚNICA PESTAÑA VISIBLE */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* Estas pantallas NO son pestañas, son accesibles por navegación.
          Al poner href: null, las escondemos de la barra de pestañas */}
      <Tabs.Screen
        name="inventoryScreen"
        options={{
          href: null, // Esto la esconde de las tabs
        }}
      />
      <Tabs.Screen
        name="wishlistScreen"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="TradeReady"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
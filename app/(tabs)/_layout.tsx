// app/(tabs)/_layout.tsx
// =============================================
// LAYOUT DE LAS PESTAÑAS (TABS)
// =============================================
//
// SOLO UNA PESTAÑA VISIBLE: Explorar
// Las demas pantallas existen pero no tienen pestaña
//
// =============================================

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#367C9C' }}>
      
      {/* =========================================
          PESTAÑA 1: EXPLORAR (index)
          ========================================= */}
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
      
      {/* =========================================
          PANTALLAS OCULTAS (sin pestaña)
          ========================================= */}
      
      {/* Pantalla de Inventario */}
      <Tabs.Screen
        name="inventoryScreen"
        options={{
          href: null,        // No aparece en la barra de pestañas
          headerShown: false,
        }}
      />
      
      {/* Pantalla de Wishlist */}
      <Tabs.Screen
        name="wishlistScreen"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      
      {/* Pantalla de Trade Ready */}
      <Tabs.Screen
        name="TradeReady"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      
      {/* NOTA: backendDemo YA NO EXISTE, fue eliminado */}
      
    </Tabs>
  );
}
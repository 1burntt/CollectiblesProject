import { Stack } from 'expo-router';
import { UserCollectionProvider } from '../contexts/UserCollectionContext';

// Este es el layout PRINCIPAL de toda la app
export default function RootLayout() {
  console.log('✅ RootLayout se está ejecutando');

  return (
    // IMPORTANTE: El Provider envuelve TODO para que cualquier pantalla pueda usarlo
    <UserCollectionProvider>
      <Stack>
        {/* Las pantallas de pestañas */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        
        {/* Pantalla de detalle de carta */}
        <Stack.Screen 
          name="card/[id]" 
          options={{ 
            presentation: 'card', 
            headerShown: false 
          }} 
        />
        
        {/* Pantalla modal (si la usas) */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            headerShown: false 
          }} 
        />
      </Stack>
    </UserCollectionProvider>
  );
}
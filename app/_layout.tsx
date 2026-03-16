// app/_layout.tsx
import { Stack } from 'expo-router';
import { UserCollectionProvider } from '../contexts/UserCollectionContext';

// Este es el layout principal. Todo lo que este aqui adentro estara disponible en todas las pantallas.
export default function RootLayout() {
  return (
    // Envolvemos toda la app en el proveedor para que todas las pantallas puedan acceder al inventario, wishlist, etc.
    <UserCollectionProvider>
      <Stack>
        {/* Las pantallas se definen aqui. El orden no importa mucho. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="card/[id]" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </UserCollectionProvider>
  );
}
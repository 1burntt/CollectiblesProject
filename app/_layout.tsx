// app/_layout.tsx
import { Stack } from 'expo-router';
import { UserCollectionProvider } from '../contexts/UserCollectionContext';

export default function RootLayout() {
  return (
    <UserCollectionProvider>
      <Stack>
        <Stack.Screen name="loginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="card/[id]" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </UserCollectionProvider>
  );
}
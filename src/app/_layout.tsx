import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '../store/useThemeStore';

// Create TanStack Query Client for global cache syncing
const queryClient = new QueryClient();

export default function RootLayout() {
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false, // Turn off default operating system title bars
          animation: 'fade', // Use a high-quality fluid fade transition between screens
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </QueryClientProvider>
  );
}

import React from 'react';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { useThemeStore } from '../store/useThemeStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { getIsDark } = useThemeStore();

  const isDark = getIsDark();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </QueryClientProvider>
  );
}
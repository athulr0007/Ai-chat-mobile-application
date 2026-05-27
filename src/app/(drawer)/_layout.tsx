import React from 'react';
import { Stack } from 'expo-router';

export default function DrawerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', // Slide settings screen in smoothly from the right
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

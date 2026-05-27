import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
  getIsDark: () => boolean;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'system',
  
  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem('eye1_theme_mode', mode);
    } catch (err) {
      console.error('Error saving theme mode:', err);
    }
  },

  initializeTheme: async () => {
    try {
      const savedMode = await AsyncStorage.getItem('eye1_theme_mode') as ThemeMode | null;
      if (savedMode) {
        set({ themeMode: savedMode });
      }
    } catch (err) {
      console.error('Error loading saved theme:', err);
    }
  },

  getIsDark: () => {
    const { themeMode } = get();
    if (themeMode === 'system') {
      return Appearance.getColorScheme() === 'dark';
    }
    return themeMode === 'dark';
  },
}));

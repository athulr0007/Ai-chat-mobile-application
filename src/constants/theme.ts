import { HSL } from 'react-native';

export type ColorTheme = {
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string; // Accent Color (Indigo / Violet Glow)
  primaryGlow: string;
  userBubble: string;
  aiBubble: string;
  inputBackground: string;
  shadow: string;
};

export const Colors = {
  light: {
    background: '#F9FAFB', // Off-white
    card: '#FFFFFF',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    primary: '#6366F1', // Indigo
    primaryGlow: 'rgba(99, 102, 241, 0.15)',
    userBubble: '#6366F1',
    aiBubble: '#F3F4F6',
    inputBackground: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.05)',
  } as ColorTheme,
  
  dark: {
    background: '#0B0F19', // Deep spatial space black/navy
    card: '#161E2E',       // Charcoal space gray
    text: '#F9FAFB',
    textMuted: '#9CA3AF',
    border: '#1F2937',
    primary: '#8B5CF6', // Violet/Indigo glow
    primaryGlow: 'rgba(139, 92, 246, 0.25)',
    userBubble: '#8B5CF6',
    aiBubble: '#1F2937', // Darker bubble
    inputBackground: '#131A26',
    shadow: 'rgba(0, 0, 0, 0.3)',
  } as ColorTheme,
};

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
};

export const Typography = {
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '900' as const,
  }
};

export const Layout = {
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 20,
    full: 9999,
  },
  maxWidth: 600,
};

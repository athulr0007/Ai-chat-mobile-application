import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,  Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Colors, Spacing, Typography, Layout } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { themeMode, setThemeMode, getIsDark } = useThemeStore();
  
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out of EYE 1?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const themeOptions = [
    { mode: 'light' as const, label: 'Light', icon: 'sunny-outline' },
    { mode: 'dark' as const, label: 'Dark', icon: 'moon-outline' },
    { mode: 'system' as const, label: 'System', icon: 'cog-outline' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      {/* Custom Header with Back Button */}
      <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back-outline" size={24} color={activeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: activeColors.text }]}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info Section */}
        {user && (
          <View style={[styles.section, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.userRow}>
              <View style={[styles.userAvatar, { backgroundColor: activeColors.primaryGlow }]}>
                <Text style={[styles.avatarText, { color: activeColors.primary }]}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={[styles.userName, { color: activeColors.text }]}>{user.name}</Text>
                <Text style={[styles.userEmail, { color: activeColors.textMuted }]}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Theme Settings Selector */}
        <Text style={[styles.sectionTitle, { color: activeColors.textMuted }]}>Theme Preference</Text>
        <View style={[styles.section, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <View style={styles.themeRow}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => setThemeMode(opt.mode)}
                  style={[
                    styles.themeButton,
                    { 
                      backgroundColor: isSelected ? activeColors.primaryGlow : activeColors.background,
                      borderColor: isSelected ? activeColors.primary : activeColors.border
                    }
                  ]}
                >
                  <Ionicons 
                    name={opt.icon as any} 
                    size={20} 
                    color={isSelected ? activeColors.primary : activeColors.textMuted} 
                  />
                  <Text 
                    style={[
                      styles.themeLabel, 
                      { color: isSelected ? activeColors.primary : activeColors.text },
                      isSelected && { fontWeight: Typography.weight.bold }
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* System & Architecture Info */}
        <Text style={[styles.sectionTitle, { color: activeColors.textMuted }]}>Application Architecture</Text>
        <View style={[styles.section, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeColors.text }]}>Version</Text>
            <Text style={[styles.infoValue, { color: activeColors.textMuted }]}>1.0.0 (Release)</Text>
          </View>
          <View style={[styles.infoSeparator, { backgroundColor: activeColors.border }]} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeColors.text }]}>AI LLM Model</Text>
            <Text style={[styles.infoValue, { color: activeColors.textMuted }]}>llama-3.1-8b-instant</Text>
          </View>
          <View style={[styles.infoSeparator, { backgroundColor: activeColors.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeColors.text }]}>Voice Whisper STT</Text>
            <Text style={[styles.infoValue, { color: activeColors.textMuted }]}>whisper-large-v3</Text>
          </View>
          <View style={[styles.infoSeparator, { backgroundColor: activeColors.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeColors.text }]}>Speech Playback TTS</Text>
            <Text style={[styles.infoValue, { color: activeColors.textMuted }]}>expo-speech (Native)</Text>
          </View>
          <View style={[styles.infoSeparator, { backgroundColor: activeColors.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeColors.text }]}>Framework Engine</Text>
            <Text style={[styles.infoValue, { color: activeColors.textMuted }]}>React Native + Expo SDK 56</Text>
          </View>
        </View>

        {/* Action Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Log Out from EYE 1</Text>
        </TouchableOpacity>

        {/* Evaluation Branding Info footer */}
        <View style={styles.footerBranding}>
          <Text style={[styles.brandingText, { color: activeColors.textMuted }]}>EYE 1 — Premium AI Interface</Text>
          <Text style={[styles.brandingSubtext, { color: activeColors.textMuted }]}>Built for Evaluation & Selection</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: Spacing.one,
    marginTop: Spacing.two,
  },
  section: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    padding: Spacing.four,
    shadowOpacity: 0.02,
    elevation: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  userEmail: {
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    gap: Spacing.one,
  },
  themeLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  infoLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  infoValue: {
    fontSize: Typography.size.sm,
  },
  infoSeparator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  footerBranding: {
    alignItems: 'center',
    marginVertical: Spacing.six,
    gap: 4,
  },
  brandingText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
  },
  brandingSubtext: {
    fontSize: 10,
  },
});

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Colors, Spacing, Typography, Layout } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
type ThemeMode = 'light' | 'dark' | 'system';

// ─── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  icon,
  activeColors,
  showSeparator = true,
}: {
  label: string;
  value: string;
  icon: string;
  activeColors: any;
  showSeparator?: boolean;
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <View style={styles.infoRowLeft}>
          <View style={[styles.infoIconBox, { backgroundColor: activeColors.primaryGlow }]}>
            <Ionicons name={icon as any} size={14} color={activeColors.primary} />
          </View>
          <Text style={[styles.infoLabel, { color: activeColors.text }]}>{label}</Text>
        </View>
        <Text
          style={[styles.infoValue, { color: activeColors.textMuted }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
      {showSeparator && (
        <View style={[styles.infoSeparator, { backgroundColor: activeColors.border }]} />
      )}
    </>
  );
}

// ─── PressCard ────────────────────────────────────────────────────────────────
function PressCard({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({
  label,
  icon,
  activeColors,
}: {
  label: string;
  icon: string;
  activeColors: any;
}) {
  return (
    <View style={styles.sectionLabelRow}>
      <Ionicons name={icon as any} size={11} color={activeColors.primary} />
      <Text style={[styles.sectionLabelText, { color: activeColors.primary }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { themeMode, setThemeMode, getIsDark } = useThemeStore();

  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  // Header border fades in as user scrolls
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of EYE 1?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: 'sunny-outline' },
    { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
    { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  const systemInfo = [
    { label: 'App Version',  value: '1.0.0 (Release)',           icon: 'cube-outline' },
    { label: 'AI Model',     value: 'llama-3.1-8b-instant',      icon: 'sparkles-outline' },
    { label: 'Voice STT',    value: 'Coming Soon',           icon: 'mic-outline' },
    { label: 'Speech TTS',   value: 'expo-speech (Native)',       icon: 'volume-medium-outline' },
    { label: 'Runtime',      value: 'React Native · Expo SDK 56', icon: 'layers-outline' },
  ];

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: activeColors.background }]}
      edges={['top']}
    >
      {/* ── Header ── */}
      <View style={styles.headerWrap}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: activeColors.card }]}
        >
          <Ionicons name="arrow-back-outline" size={20} color={activeColors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerEyebrow, { color: activeColors.primary }]}>EYE 1</Text>
          <Text style={[styles.headerTitle, { color: activeColors.text }]}>Settings</Text>
        </View>

        {/* Balance spacer */}
        <View style={{ width: 36 }} />

        {/* Animated bottom border */}
        <Animated.View
          style={[
            styles.headerBorder,
            { backgroundColor: activeColors.border, opacity: headerBorderOpacity },
          ]}
        />
      </View>

      {/* ── Scrollable Body ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: activeColors.background },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >

        {/* ── Profile Card ── */}
        {user && (
          <View style={styles.sectionGroup}>
            <View
              style={[
                styles.card,
                { backgroundColor: activeColors.card, borderColor: activeColors.border },
              ]}
            >
              {/* Tinted accent bar — pure View, no gradient lib needed */}
              <View
                style={[
                  styles.cardAccentBar,
                  { backgroundColor: activeColors.primary + '18' },
                ]}
              />

              <View style={styles.profileRow}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  <View
                    style={[styles.avatarBox, { backgroundColor: activeColors.primary }]}
                  >
                    <Text style={styles.avatarLetter}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[styles.onlineDot, { borderColor: activeColors.card }]}
                  />
                </View>

                {/* Meta */}
                <View style={styles.profileMeta}>
                  <Text style={[styles.profileName, { color: activeColors.text }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.profileEmail, { color: activeColors.textMuted }]}>
                    {user.email}
                  </Text>
                  <View
                    style={[
                      styles.activeBadge,
                      { backgroundColor: activeColors.primaryGlow },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={10}
                      color={activeColors.primary}
                    />
                    <Text
                      style={[styles.activeBadgeText, { color: activeColors.primary }]}
                    >
                      Active
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={activeColors.textMuted}
                />
              </View>
            </View>
          </View>
        )}

        {/* ── Appearance ── */}
        <View style={styles.sectionGroup}>
          <SectionLabel
            label="Appearance"
            icon="contrast-outline"
            activeColors={activeColors}
          />
          <View
            style={[
              styles.card,
              { backgroundColor: activeColors.card, borderColor: activeColors.border },
            ]}
          >
            <View style={styles.themeGrid}>
              {themeOptions.map((opt) => {
                const isActive = themeMode === opt.mode;
                return (
                  <TouchableOpacity
                    key={opt.mode}
                    onPress={() => setThemeMode(opt.mode)}
                    activeOpacity={0.75}
                    style={[
                      styles.themeChip,
                      {
                        backgroundColor: isActive
                          ? activeColors.primary
                          : activeColors.background,
                        borderColor: isActive
                          ? activeColors.primary
                          : activeColors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={18}
                      color={isActive ? '#FFFFFF' : activeColors.textMuted}
                    />
                    <Text
                      style={[
                        styles.themeChipLabel,
                        {
                          color: isActive ? '#FFFFFF' : activeColors.textMuted,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isActive && <View style={styles.themeActiveDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Architecture Info ── */}
        <View style={styles.sectionGroup}>
          <SectionLabel
            label="Architecture"
            icon="server-outline"
            activeColors={activeColors}
          />
          <View
            style={[
              styles.card,
              { backgroundColor: activeColors.card, borderColor: activeColors.border },
            ]}
          >
            {systemInfo.map((item, idx) => (
              <InfoRow
                key={item.label}
                label={item.label}
                value={item.value}
                icon={item.icon}
                activeColors={activeColors}
                showSeparator={idx < systemInfo.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ── Sign Out ── */}
        <View style={styles.sectionGroup}>
          <PressCard onPress={handleLogout}>
            <View
              style={[
                styles.logoutCard,
                {
                  backgroundColor: isDark ? '#1F0A0A' : '#FFF5F5',
                  borderColor: isDark ? '#3D1515' : '#FECACA',
                },
              ]}
            >
              <View style={styles.logoutLeft}>
                <View style={styles.logoutIconBox}>
                  <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.logoutTitle}>Sign Out</Text>
                  <Text style={[styles.logoutSub, { color: activeColors.textMuted }]}>
                    You'll need to log in again
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#EF444488" />
            </View>
          </PressCard>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={[styles.footerPill, { backgroundColor: activeColors.border }]} />
          <Text style={[styles.footerBrand, { color: activeColors.textMuted }]}>
            EYE 1
          </Text>
          <Text style={[styles.footerSub, { color: activeColors.textMuted }]}>
            Premium AI Interface · v1.0.0
          </Text>
          <Text style={[styles.footerTag, { color: activeColors.primary + '66' }]}>
            Built for Evaluation & Selection
          </Text>
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header
  headerWrap: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },

  // ── Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 52,
  },

  // ── Section groups
  sectionGroup: { marginTop: 22 },

  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
    paddingLeft: 2,
  },
  sectionLabelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  // ── Card
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
  },

  // ── Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  avatarWrap: { position: 'relative' },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
  },
  profileMeta: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileEmail: { fontSize: 12 },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ── Theme chips
  themeGrid: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  themeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  themeChipLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  themeActiveDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // ── Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  infoIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    maxWidth: '45%',
    textAlign: 'right',
  },
  infoSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
    marginRight: 16,
  },

  // ── Logout card
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: -0.1,
  },
  logoutSub: {
    fontSize: 11,
    marginTop: 1,
  },

  // ── Footer
  footer: {
    alignItems: 'center',
    marginTop: 44,
    gap: 4,
  },
  footerPill: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 10,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  footerSub: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footerTag: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.4,
  },
});
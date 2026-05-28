import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useThemeStore } from '../../store/useThemeStore';
import {
  Colors,
  Spacing,
  Typography,
  Layout,
} from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const { getIsDark } = useThemeStore();

  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const [isLoading, setIsLoading] = useState(false);

  const handleGooglePress = async () => {
    setIsLoading(true);

    // Real OAuth comes later
    setTimeout(() => {
      setIsLoading(false);
      router.push('/(auth)/login');
    }, 500);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeColors.background,
        },
      ]}
    >
      {/* Background Glow */}
      <View
        style={[
          styles.glowOrb,
          {
            backgroundColor: activeColors.primary,
            opacity: isDark ? 0.15 : 0.08,
          },
        ]}
      />

      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View
            style={[
              styles.logoIcon,
              {
                borderColor: activeColors.primary,
              },
            ]}
          >
            <View
              style={[
                styles.logoCore,
                {
                  backgroundColor: activeColors.primary,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: activeColors.text,
              },
            ]}
          >
            EYE 1
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: activeColors.textMuted,
              },
            ]}
          >
            High-performance AI conversation platform
          </Text>
        </View>

        {/* Google Button */}
        <TouchableOpacity
          style={[
            styles.googleButton,
            {
              backgroundColor: isDark ? '#1C2538' : '#FFFFFF',
              borderColor: activeColors.border,
            },
          ]}
          onPress={handleGooglePress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={activeColors.text} />
          ) : (
            <>
              <Image
                source={{
                  uri: 'https://developers.google.com/static/identity/images/g-logo.png',
                }}
                style={styles.googleIcon}
              />

              <Text
                style={[
                  styles.googleButtonText,
                  {
                    color: isDark ? '#FFF' : '#333',
                  },
                ]}
              >
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View
            style={[
              styles.dividerLine,
              {
                backgroundColor: activeColors.border,
              },
            ]}
          />

          <Text
            style={[
              styles.dividerText,
              {
                color: activeColors.textMuted,
              },
            ]}
          >
            OR
          </Text>

          <View
            style={[
              styles.dividerLine,
              {
                backgroundColor: activeColors.border,
              },
            ]}
          />
        </View>

        {/* Email Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: activeColors.primary,
            },
          ]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>
            Continue with Email
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },

  glowOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: '15%',
    left: '10%',
  },

  cardContainer: {
    width: '100%',
    maxWidth: Layout.maxWidth,
    padding: Spacing.six,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowRadius: 30,
    shadowOpacity: 0.1,
    elevation: 8,
  },

  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },

  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },

  logoCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    letterSpacing: 6,
    marginBottom: Spacing.one,
  },

  subtitle: {
    fontSize: Typography.size.sm,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.four,
  },

  googleButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },

  googleIcon: {
    width: 20,
    height: 20,
  },

  googleButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.five,
  },

  dividerLine: {
    flex: 1,
    height: 1,
  },

  dividerText: {
    fontSize: Typography.size.xs,
    paddingHorizontal: Spacing.three,
    fontWeight: Typography.weight.bold,
  },

  primaryButton: {
    height: 52,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});


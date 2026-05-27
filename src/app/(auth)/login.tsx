import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Colors, Spacing, Typography, Layout } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const [email, setEmail] = useState('demo-user@eye1.ai');
  const [name, setName] = useState('John Doe');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');
    
    // Simulate standard Google authentication profile
    const googleEmail = 'developer@eye1.ai';
    const googleName = 'EYE 1 Developer';
    const googleAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=eye1';

    const success = await login(googleEmail, googleName, googleAvatar);
    
    setIsLoggingIn(false);
    if (success) {
      router.replace('/(drawer)');
    } else {
      setErrorMessage('Failed to connect to backend server. Ensure backend is running.');
    }
  };

  const handleCustomLogin = async () => {
    if (!email || !name) {
      setErrorMessage('Please fill in both email and name.');
      return;
    }
    
    setIsLoggingIn(true);
    setErrorMessage('');
    
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    const success = await login(email, name, avatar);
    
    setIsLoggingIn(false);
    if (success) {
      router.replace('/(drawer)');
    } else {
      setErrorMessage('Backend error. Is your server running at http://localhost:5000?');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      {/* Background glowing orb */}
      <View style={[styles.glowOrb, { backgroundColor: activeColors.primary, opacity: isDark ? 0.15 : 0.08 }]} />

      <View style={styles.cardContainer}>
        {/* Eye AI Icon / Header */}
        <View style={styles.headerSection}>
          <View style={[styles.logoIcon, { borderColor: activeColors.primary }]}>
            <View style={[styles.logoCore, { backgroundColor: activeColors.primary }]} />
          </View>
          <Text style={[styles.title, { color: activeColors.text }]}>EYE 1</Text>
          <Text style={[styles.subtitle, { color: activeColors.textMuted }]}>
            Sign in to experience high-performance AI chat
          </Text>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Form Inputs for quick testing customization */}
        <View style={styles.formContainer}>
          <Text style={[styles.inputLabel, { color: activeColors.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: activeColors.inputBackground, 
              color: activeColors.text, 
              borderColor: activeColors.border 
            }]}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor={activeColors.textMuted}
          />

          <Text style={[styles.inputLabel, { color: activeColors.text, marginTop: Spacing.two }]}>Email</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: activeColors.inputBackground, 
              color: activeColors.text, 
              borderColor: activeColors.border 
            }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@example.com"
            placeholderTextColor={activeColors.textMuted}
          />

          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: activeColors.primary }]}
            onPress={handleCustomLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Continue with Credentials</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: activeColors.border }]} />
          <Text style={[styles.dividerText, { color: activeColors.textMuted }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: activeColors.border }]} />
        </View>

        {/* Premium Google OAuth simulated button */}
        <TouchableOpacity
          style={[styles.googleButton, { 
            backgroundColor: isDark ? '#1C2538' : '#FFFFFF', 
            borderColor: activeColors.border 
          }]}
          onPress={handleGoogleLogin}
          disabled={isLoggingIn}
        >
          <Image
            source={{ uri: 'https://developers.google.com/static/identity/images/g-logo.png' }}
            style={styles.googleIcon}
          />
          <Text style={[styles.googleButtonText, { color: isDark ? '#FFF' : '#333' }]}>
            Sign in with Google
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
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '15%',
    left: '10%',
    filter: 'blur(80px)' as any, // Only Web, works as a placeholder on mobile
  },
  cardContainer: {
    width: '100%',
    maxWidth: Layout.maxWidth,
    padding: Spacing.six,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    shadowOpacity: 0.1,
    elevation: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  logoCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    letterSpacing: 4,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.four,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  input: {
    height: 48,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.two,
  },
  primaryButton: {
    height: 48,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  buttonText: {
    color: '#FFF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.four,
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
  googleButton: {
    flexDirection: 'row',
    height: 48,
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
  errorText: {
    color: '#EF4444',
    fontSize: Typography.size.xs,
    textAlign: 'center',
    marginBottom: Spacing.three,
    fontWeight: Typography.weight.semibold,
  },
});

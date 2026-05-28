import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useRouter } from 'expo-router';

import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

import {
  Colors,
  Spacing,
  Typography,
  Layout,
} from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();

  const { login } = useAuthStore();
  const { getIsDark } = useThemeStore();

  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    try {
      setErrorMessage('');
      setIsLoading(true);

      // Temporary mock auth until backend login API is completed
      const success = await login(
        email,
        'EYE 1 User',
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
      );

      setIsLoading(false);

      if (success) {
        router.replace('/(drawer)');
      } else {
        setErrorMessage('Invalid credentials or backend unavailable.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Something went wrong.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: activeColors.background,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          <Text
            style={[
              styles.title,
              {
                color: activeColors.text,
              },
            ]}
          >
            Welcome Back
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: activeColors.textMuted,
              },
            ]}
          >
            Sign in to continue using EYE 1
          </Text>
        </View>

        {/* Error */}
        {errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}

        {/* Email */}
        <View style={styles.formContainer}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: activeColors.text,
              },
            ]}
          >
            Email
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: activeColors.inputBackground,
                color: activeColors.text,
                borderColor: activeColors.border,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@example.com"
            placeholderTextColor={activeColors.textMuted}
          />

          {/* Password */}
          <Text
            style={[
              styles.inputLabel,
              {
                color: activeColors.text,
                marginTop: Spacing.two,
              },
            ]}
          >
            Password
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: activeColors.inputBackground,
                color: activeColors.text,
                borderColor: activeColors.border,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            placeholderTextColor={activeColors.textMuted}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: activeColors.primary,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text
              style={[
                styles.registerText,
                {
                  color: activeColors.primary,
                },
              ]}
            >
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text
              style={[
                styles.backText,
                {
                  color: activeColors.textMuted,
                },
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignSelf: 'center',
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

  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.one,
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: Typography.size.sm,
    textAlign: 'center',
    lineHeight: 20,
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
    height: 52,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.two,
  },

  primaryButton: {
    height: 52,
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

  registerButton: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },

  registerText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },

  backButton: {
    marginTop: Spacing.three,
    alignItems: 'center',
  },

  backText: {
    fontSize: Typography.size.sm,
  },

  errorText: {
    color: '#EF4444',
    fontSize: Typography.size.xs,
    textAlign: 'center',
    marginBottom: Spacing.three,
    fontWeight: Typography.weight.semibold,
  },
});


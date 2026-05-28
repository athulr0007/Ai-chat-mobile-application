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
  ScrollView,
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

export default function RegisterScreen() {
  const router = useRouter();

  const { register } = useAuthStore();
  const { getIsDark } = useThemeStore();

  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setErrorMessage('');
      setIsLoading(true);

      const success = await register( name, email, password );

      setIsLoading(false);

      if (success) {
        router.replace('/(drawer)');
      } else {
        setErrorMessage('Registration failed.');
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              Create Account
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: activeColors.textMuted,
                },
              ]}
            >
              Start using the EYE 1 AI platform
            </Text>
          </View>

          {/* Error */}
          {errorMessage ? (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name */}
            <Text
              style={[
                styles.inputLabel,
                {
                  color: activeColors.text,
                },
              ]}
            >
              Name
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
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor={activeColors.textMuted}
            />

            {/* Email */}
            <Text
              style={[
                styles.inputLabel,
                {
                  color: activeColors.text,
                  marginTop: Spacing.two,
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

            {/* Confirm Password */}
            <Text
              style={[
                styles.inputLabel,
                {
                  color: activeColors.text,
                  marginTop: Spacing.two,
                },
              ]}
            >
              Confirm Password
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
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm password"
              placeholderTextColor={activeColors.textMuted}
            />

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: activeColors.primary,
                },
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text
                style={[
                  styles.loginText,
                  {
                    color: activeColors.primary,
                  },
                ]}
              >
                Already have an account? Login
              </Text>
            </TouchableOpacity>

            {/* Back */}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },

  glowOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: '10%',
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
    marginTop: Spacing.four,
  },

  buttonText: {
    color: '#FFF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },

  loginButton: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },

  loginText: {
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


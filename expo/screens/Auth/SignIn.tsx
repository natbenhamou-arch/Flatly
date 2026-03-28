import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { ClayButton } from '@/components/ClayButton';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing, radius } from '@/constants/theme';
import { signIn, validateEmail } from '@/services/auth';
import { useAppStore } from '@/store/app-store';
import { FlatlyLogo } from '@/components/FlatlyLogo';

export default function SignInScreen() {
  const { setCurrentUser, setOnboardingCompleted } = useAppStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success && result.user) {
        await setCurrentUser(result.user);
        
        // Check if user has completed onboarding
        try {
          const { getPreferencesByUserId } = await import('@/services/data');
          const preferences = await getPreferencesByUserId(result.user.id);
          const hasCompletedOnboarding = !!preferences;
          setOnboardingCompleted(hasCompletedOnboarding);
          
          console.log('Sign in successful, navigating...');
          if (hasCompletedOnboarding) {
            router.replace('/(tabs)/discover');
          } else {
            router.replace('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          router.replace('/(tabs)/discover');
        }
      } else {
        Alert.alert('Sign In Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ClayCard style={styles.formCard}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <FlatlyLogo size={80} withText={true} testID="signin-logo" />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue finding your perfect roommate
              </Text>
            </View>

            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value.toLowerCase())}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    testID="email-input"
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    testID="password-input"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <ClayButton
                title={isLoading ? 'Signing In...' : 'Sign In'}
                onPress={handleSignIn}
                variant="primary"
                disabled={isLoading}
                style={styles.signInButton}
                testID="sign-in-button"
              />

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/signup')}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ClayCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  formCard: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 500,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: spacing.sm,
    minHeight: 52,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: spacing.xs,
  },
  signInButton: {
    marginTop: spacing.md,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  signUpText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: 16,
    color: colors.lavender,
    fontWeight: '600',
  },
});
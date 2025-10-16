import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme, colors } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { signIn, signInWithProvider } from '@/services/auth';

export default function IndexScreen() {
  const { currentUser, initializeApp, isLoading, hasCompletedOnboarding, setCurrentUser, setOnboardingCompleted } = useAppStore();
  const styles = getStyles();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Handle navigation when user is signed in
  useEffect(() => {
    if (!isLoading && currentUser) {
      console.log('User detected, redirecting to app...');
      // Use setTimeout to avoid state update during render
      const timeoutId = setTimeout(() => {
        if (hasCompletedOnboarding) {
          router.replace('/(tabs)/discover');
        } else {
          router.replace('/onboarding/full-name');
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, isLoading, hasCompletedOnboarding]);

  const handleProvider = useCallback(async (provider: 'apple' | 'google') => {
    console.log('Provider sign-in pressed', provider);
    setError('');
    try {
      const result = await signInWithProvider(provider);
      if (result.success && result.user) {
        await setCurrentUser(result.user);
        const hasOnboarding = hasCompletedOnboarding;
        if (hasOnboarding) {
          router.replace('/(tabs)/discover');
        } else {
          router.replace('/onboarding');
        }
      } else {
        setError(result.error || 'Sign in failed');
      }
    } catch (e) {
      console.log('Provider sign-in error', e);
      setError('Something went wrong. Please try again.');
    }
  }, [setCurrentUser, setOnboardingCompleted, hasCompletedOnboarding]);

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setIsSigningIn(true);
    setError('');
    
    try {
      const result = await signIn(email.toLowerCase().trim(), password);
      
      if (result.success && result.user) {
        await setCurrentUser(result.user);
        
        try {
          const { getPreferencesByUserId } = await import('@/services/data');
          const preferences = await getPreferencesByUserId(result.user.id);
          const hasOnboarding = !!preferences;
          setOnboardingCompleted(hasOnboarding);
          
          if (hasOnboarding) {
            router.replace('/(tabs)/discover');
          } else {
            router.replace('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding:', error);
          router.replace('/(tabs)/discover');
        }
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  }, [email, password, setCurrentUser, setOnboardingCompleted]);

  const handleSignUp = useCallback(() => {
    router.push('/signup');
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Flatly...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render anything if user is signed in (navigation will happen)
  if (currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/344pj7718gxg1qvcgbgp1' }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title} testID="brand-wordmark">Welcome to Flatly</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleProvider('google')}
                  testID="google-signin-button"
                >
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleProvider('apple')}
                  testID="apple-signin-button"
                >
                  <Text style={styles.appleIcon}>🍎</Text>
                  <Text style={styles.socialButtonText}>Continue with Apple</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      testID="email-input"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setError('');
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      testID="password-input"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      testID="toggle-password-visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.signInButtonPrimary}
                  onPress={handleSignIn}
                  disabled={isSigningIn}
                  testID="signin-button"
                >
                  <Text style={styles.signInButtonPrimaryText}>
                    {isSigningIn ? 'Signing in...' : 'Sign in'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.bottomLinks}>
                  <TouchableOpacity onPress={() => console.log('Forgot password')}>
                    <Text style={styles.linkText}>Forgot password?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSignUp} testID="need-account-button">
                    <Text style={styles.linkTextRight}>Need an account? Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme?.colors?.text?.secondary || '#4C5768',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    tintColor: '#2563EB',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#111827',
    textAlign: 'center' as const,
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center' as const,
    fontFamily: 'Montserrat-Regular',
  },
  actions: {
    gap: 14,
  },
  divider: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 16,
    fontFamily: 'Montserrat-Regular',
    fontWeight: '500' as const,
  },
  socialButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    fontFamily: 'Montserrat-SemiBold',
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  googleG: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  appleIcon: {
    fontSize: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F9FAFB',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    minHeight: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Montserrat-Regular',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center' as const,
    marginTop: 4,
    fontFamily: 'Montserrat-Regular',
  },
  signInButtonPrimary: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  bottomLinks: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Montserrat-Regular',
  },
  linkTextRight: {
    fontSize: 14,
    color: '#2563EB',
    fontFamily: 'Montserrat-SemiBold',
  },
});
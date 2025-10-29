import React, { useState, useMemo } from 'react';
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
import { User, Mail, Eye, EyeOff, Calendar, CheckSquare, Square } from 'lucide-react-native';
import { ClayButton } from '@/components/ClayButton';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing, radius } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { FlatlyLogo } from '@/components/FlatlyLogo';
import { signUp } from '@/services/auth';

export default function CreateAccountScreen() {
  const { setCurrentUser, setOnboardingCompleted } = useAppStore();
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    birthdate: string;
    termsAccepted: boolean;
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const parseBirthdate = (ddmmyyyy: string): Date | null => {
    const trimmed = ddmmyyyy.trim();
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;
    
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== (month - 1) || d.getDate() !== day) return null;
    return d;
  };

  const formatToDDMMYYYY = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  };

  const getAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Birthdate validation
    if (!formData.birthdate.trim()) {
      newErrors.birthdate = 'Birthdate is required (DD/MM/YYYY)';
    } else {
      const date = parseBirthdate(formData.birthdate);
      if (!date) {
        newErrors.birthdate = 'Enter a valid date (DD/MM/YYYY)';
      } else {
        const age = getAge(date);
        if (age < 18) {
          newErrors.birthdate = 'You must be at least 18 years old';
        }
        if (age > 120) {
          newErrors.birthdate = 'Please enter a valid birthdate';
        }
      }
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const birth = parseBirthdate(formData.birthdate);
      if (!birth) return;
      
      const age = getAge(birth);
      const iso = `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2,'0')}-${String(birth.getDate()).padStart(2,'0')}`;

      // Create user with email/password
      const result = await signUp(formData.email.trim(), formData.password, {
        firstName: '',
        lastName: '',
        birthdate: iso,
        age,
        university: '',
        city: '',
        geo: { lat: 0, lng: 0 },
        hasRoom: false,
        shortBio: '',
        photos: [],
        badges: []
      } as any);

      if (result.success && result.user) {
        await setCurrentUser(result.user);
        setOnboardingCompleted(false);
        console.log('Account created successfully, redirecting to onboarding...');
        router.replace('/onboarding/full-name');
      } else {
        Alert.alert('Error', result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Create account error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const webDateValue = useMemo(() => {
    const d = parseBirthdate(formData.birthdate);
    if (!d) return '';
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [formData.birthdate]);

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
                <FlatlyLogo size={60} withText={true} testID="create-account-logo" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Flatly to find your perfect roommate
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
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    testID="email-input"
                  />
                </View>
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    testID="password-input"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    testID="confirm-password-input"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* Birthdate */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={[styles.inputContainer, errors.birthdate && styles.inputError]}>
                  <Calendar size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  {Platform.OS === 'web' ? (
                    <View style={styles.webDateWrapper} testID="birthdate-web-wrapper">
                      {React.createElement('input', {
                        type: 'date',
                        value: webDateValue,
                        onChange: (e: any) => {
                          try {
                            const val: string = e?.target?.value ?? '';
                            if (!val) {
                              handleInputChange('birthdate', '');
                              return;
                            }
                            const [y, m, d] = val.split('-');
                            const asDate = new Date(Number(y), Number(m) - 1, Number(d));
                            const formatted = formatToDDMMYYYY(asDate);
                            handleInputChange('birthdate', formatted);
                          } catch (err) {
                            console.log('Web date change error', err);
                          }
                        },
                        min: '1940-01-01',
                        max: (() => {
                          const today = new Date();
                          const yyyy = String(today.getFullYear());
                          const mm = String(today.getMonth() + 1).padStart(2, '0');
                          const dd = String(today.getDate()).padStart(2, '0');
                          return `${yyyy}-${mm}-${dd}`;
                        })(),
                        id: 'birthdate-web-input',
                        'data-testid': 'birthdate-web-input',
                        style: {
                          flex: 1,
                          fontSize: 16,
                          padding: 0,
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          color: colors.textPrimary,
                        },
                      })}
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.birthdate}
                      onChangeText={(value) => {
                        const cleaned = value.replace(/[^0-9\/]/g, '');
                        if (cleaned.length <= 10) {
                          handleInputChange('birthdate', cleaned);
                        }
                      }}
                      keyboardType="numeric"
                      testID="birthdate-input"
                      maxLength={10}
                    />
                  )}
                </View>
                {errors.birthdate ? (
                  <Text style={styles.errorText}>{errors.birthdate}</Text>
                ) : null}
                <Text style={styles.helperText}>You must be 18 or older to use Flatly</Text>
              </View>

              {/* Terms & Privacy */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => handleInputChange('termsAccepted', !formData.termsAccepted)}
                testID="terms-checkbox"
              >
                {formData.termsAccepted ? (
                  <CheckSquare size={24} color={colors.lavender} />
                ) : (
                  <Square size={24} color={colors.textSecondary} />
                )}
                <Text style={styles.checkboxText}>
                  I accept the{' '}
                  <Text style={styles.linkText} onPress={() => router.push('/privacy')}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={styles.linkText} onPress={() => router.push('/privacy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
              {errors.terms ? (
                <Text style={styles.errorText}>{errors.terms}</Text>
              ) : null}

              <ClayButton
                title={isLoading ? 'Creating Account...' : 'Create Account'}
                onPress={handleCreateAccount}
                variant="primary"
                disabled={isLoading}
                style={styles.createButton}
                testID="create-account-button"
              />

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/signin')}>
                  <Text style={styles.signInLink}>Sign In</Text>
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
    minHeight: 600,
    padding: spacing.lg,
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
    textAlign: 'center',
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
  webDateWrapper: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    paddingTop: 2,
  },
  linkText: {
    color: colors.lavender,
    textDecorationLine: 'underline',
  },
  createButton: {
    marginTop: spacing.md,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  signInText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: 16,
    color: colors.lavender,
    fontWeight: '600',
  },
});

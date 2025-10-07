import React, { useMemo, useState } from 'react';
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
import { User, Calendar } from 'lucide-react-native';
import { ClayButton } from '@/components/ClayButton';
import { ClayCard } from '@/components/ClayCard';
import { OnboardingProgressBar } from '@/components/OnboardingProgressBar';
import { colors, spacing, radius } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

export default function SignUpScreen() {
  const { setUserOnboardingPartial } = useAppStore();
  const [formData, setFormData] = useState<{ firstName: string; birthdate: string }>({
    firstName: '',
    birthdate: ''
  });
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.birthdate.trim()) {
      newErrors.birthdate = 'Birthdate is required (DD/MM/YYYY)';
    } else {
      const date = parseBirthdate(formData.birthdate);
      if (!date) {
        newErrors.birthdate = 'Enter a valid date (DD/MM/YYYY)';
      } else {
        const age = getAge(date);
        if (age < 18) {
          newErrors.birthdate = 'You must be at least 18 to continue';
        }
        if (age > 120) {
          newErrors.birthdate = 'Please enter a valid birthdate';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const birth = parseBirthdate(formData.birthdate);
      if (!birth) return;
      const age = getAge(birth);
      const iso = `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2,'0')}-${String(birth.getDate()).padStart(2,'0')}`;

      setUserOnboardingPartial({
        firstName: formData.firstName.trim(),
        birthdate: iso,
        age
      });

      router.replace('/onboarding/school-city');
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'firstName' | 'birthdate', value: string) => {
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
      <OnboardingProgressBar 
        currentStep={1}
        totalSteps={6}
        stepTitles={['Basic Info', 'School & City', 'Housing Details', 'Lifestyle Preferences', 'Matching Preferences', 'Create Account']}
      />
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
              <Text style={styles.logo}>🏠</Text>
              <Text style={styles.title}>Get Started</Text>
              <Text style={styles.subtitle}>
                Let&apos;s start with the basics
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                  <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    testID="first-name-input"
                  />
                </View>
                {errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Birthdate (DD/MM/YYYY)</Text>
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
                          color: '#111827',
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
              </View>

              <ClayButton
                title={isLoading ? 'Starting...' : 'Continue'}
                onPress={handleSignUp}
                variant="primary"
                disabled={isLoading}
                style={styles.signUpButton}
                testID="continue-button"
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
    justifyContent: 'center',
    minHeight: 600,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 48,
    marginBottom: spacing.sm,
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
  webDateWrapper: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: spacing.xs,
  },
  signUpButton: {
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
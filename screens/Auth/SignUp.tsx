import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react-native';
import { colors, spacing, radius, shadows } from '@/constants/theme';

type PasswordRequirement = {
  label: string;
  test: (password: string) => boolean;
};

const passwordRequirements: PasswordRequirement[] = [
  { label: '≥ 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: '≥ 1 uppercase', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: '≥ 1 lowercase', test: (pwd) => /[a-z]/.test(pwd) },
  { label: '≥ 1 number', test: (pwd) => /\d/.test(pwd) },
  { label: '≥ 1 special character', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
];

export default function SignUpScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const passwordValidation = useMemo(() => {
    return passwordRequirements.map((req) => ({
      label: req.label,
      met: req.test(password),
    }));
  }, [password]);

  const allRequirementsMet = useMemo(() => {
    return passwordValidation.every((v) => v.met);
  }, [passwordValidation]);

  const passwordsMatch = useMemo(() => {
    return password === confirmPassword && confirmPassword.length > 0;
  }, [password, confirmPassword]);

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      allRequirementsMet &&
      passwordsMatch &&
      !isLoading
    );
  }, [email, allRequirementsMet, passwordsMatch, isLoading]);

  const handleCreateAccount = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      console.log('Creating account:', { email });
      
      setTimeout(() => {
        router.replace('/onboarding');
      }, 500);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={24} color={colors.textSecondary} />
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Create your account</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    testID="email-input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    testID="password-input"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    testID="toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    testID="confirm-password-input"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                    testID="toggle-confirm-password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.requirementsContainer}>
                {passwordValidation.map((req, index) => (
                  <View key={index} style={styles.requirementRow} testID={`requirement-${index}`}>
                    <View style={[
                      styles.requirementIcon,
                      req.met ? styles.requirementIconMet : styles.requirementIconUnmet
                    ]}>
                      {req.met ? (
                        <Check size={12} color={colors.success} />
                      ) : (
                        <X size={12} color={colors.danger} />
                      )}
                    </View>
                    <Text style={[
                      styles.requirementText,
                      req.met ? styles.requirementTextMet : styles.requirementTextUnmet
                    ]}>
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !canSubmit && styles.createButtonDisabled
                ]}
                onPress={handleCreateAccount}
                disabled={!canSubmit}
                testID="create-account-button"
              >
                <Text style={styles.createButtonText}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  backText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    minHeight: 56,
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
    marginLeft: spacing.xs,
  },
  requirementsContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementIconMet: {
    backgroundColor: '#D1FAE5',
  },
  requirementIconUnmet: {
    backgroundColor: '#FEE2E2',
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '500',
  },
  requirementTextMet: {
    color: colors.success,
  },
  requirementTextUnmet: {
    color: colors.danger,
  },
  createButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.medium,
    paddingVertical: spacing.md + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.button,
  },
  createButtonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.5,
    ...shadows.soft,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

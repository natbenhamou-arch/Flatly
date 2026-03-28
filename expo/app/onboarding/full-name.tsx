import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app-store';
import { colors, spacing, radius } from '@/constants/theme';
import { router } from 'expo-router';

export default function FullNameScreen() {
  const { setUserOnboardingPartial } = useAppStore();
  const [fullName, setFullName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { firstName, lastName } = useMemo(() => {
    const trimmed = fullName.trim().replace(/\s+/g, ' ');
    if (!trimmed) return { firstName: '', lastName: '' };
    const parts = trimmed.split(' ');
    return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
  }, [fullName]);

  const onContinue = async () => {
    if (!firstName) {
      setError('Please enter your full name');
      return;
    }
    setIsLoading(true);
    try {
      setUserOnboardingPartial({ firstName, // last stored privately, we will only display initial elsewhere
        // @ts-expect-error allow storing last name temporarily via update later if needed
        lastName,
      });
      router.replace('/onboarding/school-city');
    } catch (e) {
      console.log('Full name save error', e);
      Alert.alert('Error', 'Could not save your name. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>What’s your full name?</Text>
            <Text style={styles.subtitle}>We’ll only show your first name and the initial of your last name publicly (e.g., Nathaniel B.).</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputContainer, !!error && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={(v) => { setFullName(v); if (error) setError(''); }}
                autoCapitalize="words"
                autoComplete="name"
                testID="full-name-input"
              />
            </View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <TouchableOpacity style={[styles.ctaButton, isLoading && styles.ctaDisabled]} onPress={onContinue} disabled={isLoading} testID="continue-full-name">
            <Text style={styles.ctaText}>{isLoading ? 'Saving...' : 'Continue'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.lg, justifyContent: 'center' },
  header: { marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: 16, color: colors.textSecondary, lineHeight: 22 },
  inputGroup: { gap: spacing.xs },
  label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.softLilac, borderRadius: radius.medium, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: spacing.sm, minHeight: 52 },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  input: { flex: 1, fontSize: 16, color: colors.textPrimary, paddingVertical: spacing.sm },
  errorText: { fontSize: 14, color: '#EF4444', marginTop: spacing.xs },
  ctaButton: { backgroundColor: colors.lavender, paddingVertical: 16, alignItems: 'center', borderRadius: radius.medium, marginTop: spacing.lg },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { signUp, validateEmail, validatePassword } from '@/services/auth';
import { User, Lifestyle, Housing, Preferences } from '@/types';
import { setLifestyle, setHousing, setPreferences } from '@/services/data';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, GraduationCap, Home, Heart, Sparkles, Briefcase } from 'lucide-react-native';

export default function ReviewCreateScreen() {
  const { onboardingUser, clearOnboardingUser, setCurrentUser, setOnboardingCompleted } = useAppStore();
  const [email, setEmail] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; confirmEmail?: string; password?: string; confirm?: string }>({});



  if (!onboardingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fallbackCenter}> 
          <Text style={styles.errorText}>No onboarding data. Please restart.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/onboarding/account')}>
            <Text style={styles.primaryBtnText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const validate = (): boolean => {
    const e: { email?: string; confirmEmail?: string; password?: string; confirm?: string } = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!validateEmail(email)) e.email = 'Invalid email';
    if (!confirmEmail.trim()) e.confirmEmail = 'Please confirm your email';
    else if (email !== confirmEmail) e.confirmEmail = 'Emails do not match';
    if (!password) e.password = 'Password is required';
    else {
      const pw = validatePassword(password);
      if (!pw.isValid) e.password = pw.errors[0] ?? 'Weak password';
    }
    if (!confirmPassword) e.confirm = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildUserPayload = (): Omit<User, 'id' | 'createdAt'> => {
    return {
      email: email.toLowerCase(),
      phone: '',
      firstName: onboardingUser.firstName ?? '',
      lastName: '',
      birthdate: onboardingUser.birthdate ?? '2000-01-01',
      age: onboardingUser.age ?? 18,
      gender: onboardingUser.gender,
      university: onboardingUser.university ?? '',
      city: onboardingUser.city ?? '',
      geo: onboardingUser.geo ?? { lat: 0, lng: 0 },
      hasRoom: onboardingUser.hasRoom ?? false,
      shortBio: onboardingUser.shortBio ?? '',
      photos: onboardingUser.photos ?? [],
      videoIntroUrl: undefined,
      voiceIntroUrl: undefined,
      igUrl: onboardingUser.igUrl ?? '',
      linkedinUrl: onboardingUser.linkedinUrl ?? '',
      tiktokUrl: onboardingUser.tiktokUrl ?? '',
      badges: [],
      isDemo: false,
    };
  };

  const persistSubdocs = async (userId: string) => {
    try {
      if (onboardingUser.lifestyle) {
        const lifestyle: Lifestyle = { 
          ...(onboardingUser.lifestyle as Lifestyle), 
          userId,
          jobOrInternship: onboardingUser.job || onboardingUser.lifestyle.jobOrInternship || ''
        } as Lifestyle;
        await setLifestyle(lifestyle);
      }
      if (onboardingUser.housing) {
        const baseHousing = onboardingUser.housing as Housing;
        const housing: Housing = { ...baseHousing, userId, targetNeighborhoods: baseHousing.targetNeighborhoods ?? [] } as Housing;
        await setHousing(housing);
      }
      if (onboardingUser.preferences) {
        const basePrefs = onboardingUser.preferences as Preferences;
        const prefs: Preferences = { 
          ...basePrefs, 
          userId,
          ageMin: basePrefs.ageMin ?? 18,
          ageMax: basePrefs.ageMax ?? 30,
          maxDistanceKm: basePrefs.maxDistanceKm ?? 10,
          dealbreakers: basePrefs.dealbreakers ?? [],
          mustHaves: basePrefs.mustHaves ?? [],
          quizAnswers: basePrefs.quizAnswers ?? {},
          cityOnly: basePrefs.cityOnly ?? true,
          universityFilter: basePrefs.universityFilter ?? false,
          lookingFor: basePrefs.lookingFor ?? 'either'
        } as Preferences;
        await setPreferences(prefs);
      }
    } catch (err) {
      console.error('Persist subdocs error', err);
    }
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const userPayload = buildUserPayload();
      const result = await signUp(email, password, userPayload);
      if (!result.success || !result.user) {
        Alert.alert('Error', result.error ?? 'Failed to create account');
        setIsLoading(false);
        return;
      }
      await persistSubdocs(result.user.id);
      setCurrentUser(result.user);
      setOnboardingCompleted(true);
      clearOnboardingUser();
      router.replace('/(tabs)/discover');
    } catch (error) {
      console.error('Create account error', error);
      Alert.alert('Error', 'Could not create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const mainPhoto = onboardingUser?.photos?.[0];
  const hasPhotos = (onboardingUser?.photos?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.kb} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Review Your Profile</Text>
          <Text style={styles.subtitle}>Here&apos;s how your profile will look to others</Text>

          <View style={styles.swipeCardPreview}>
            {hasPhotos ? (
              <View style={styles.photoSection}>
                <Image source={{ uri: mainPhoto }} style={styles.mainPhoto} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.photoGradient}
                />
                <View style={styles.photoOverlay}>
                  <View style={styles.nameRow}>
                    <Text style={styles.nameText}>{onboardingUser?.firstName || 'Your Name'}</Text>
                    <Text style={styles.ageText}>{onboardingUser?.age || 18}</Text>
                  </View>
                  {onboardingUser?.city && (
                    <View style={styles.locationRow}>
                      <MapPin size={14} color="white" />
                      <Text style={styles.locationText}>{onboardingUser.city}</Text>
                    </View>
                  )}
                </View>
                {(onboardingUser?.photos?.length ?? 0) > 1 && (
                  <View style={styles.photoIndicators}>
                    {onboardingUser?.photos?.map((_, idx) => (
                      <View key={idx} style={[styles.photoIndicator, idx === 0 && styles.photoIndicatorActive]} />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noPhotoSection}>
                <Sparkles size={48} color={theme.colors.text.secondary} />
                <Text style={styles.noPhotoText}>No photos added yet</Text>
              </View>
            )}

            <View style={styles.infoSection}>
              {onboardingUser?.shortBio && (
                <View style={styles.bioContainer}>
                  <Text style={styles.bioText}>{onboardingUser.shortBio}</Text>
                </View>
              )}

              <View style={styles.detailsGrid}>
                {onboardingUser?.university && (
                  <View style={styles.detailItem}>
                    <GraduationCap size={18} color={theme.colors.primary} />
                    <Text style={styles.detailText}>{onboardingUser.university}</Text>
                  </View>
                )}
                {onboardingUser?.job && (
                  <View style={styles.detailItem}>
                    <Briefcase size={18} color={theme.colors.primary} />
                    <Text style={styles.detailText}>{onboardingUser.job}</Text>
                  </View>
                )}
                {onboardingUser?.gender && (
                  <View style={styles.detailItem}>
                    <Heart size={18} color={theme.colors.primary} />
                    <Text style={styles.detailText}>{onboardingUser.gender}</Text>
                  </View>
                )}
                {onboardingUser?.hasRoom !== undefined && (
                  <View style={styles.detailItem}>
                    <Home size={18} color={theme.colors.primary} />
                    <Text style={styles.detailText}>
                      {onboardingUser.hasRoom ? 'Has a room' : 'Looking for a room'}
                    </Text>
                  </View>
                )}
              </View>

              {onboardingUser?.lifestyle && (
                <View style={styles.lifestyleSection}>
                  <Text style={styles.sectionTitle}>Lifestyle</Text>
                  <View style={styles.chipsRow}>
                    {onboardingUser.lifestyle.cleanliness && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{onboardingUser.lifestyle.cleanliness}</Text>
                      </View>
                    )}
                    {onboardingUser.lifestyle.sleep && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{onboardingUser.lifestyle.sleep}</Text>
                      </View>
                    )}
                    {onboardingUser.lifestyle.guests && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>guests: {onboardingUser.lifestyle.guests}</Text>
                      </View>
                    )}
                  </View>
                  {onboardingUser.lifestyle.hobbies && onboardingUser.lifestyle.hobbies.length > 0 && (
                    <View style={styles.hobbiesContainer}>
                      <Text style={styles.subsectionTitle}>Interests</Text>
                      <View style={styles.chipsRow}>
                        {onboardingUser.lifestyle.hobbies.slice(0, 5).map((hobby, idx) => (
                          <View key={idx} style={styles.chip}>
                            <Text style={styles.chipText}>{hobby}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {onboardingUser?.preferences && (
                <View style={styles.preferencesSection}>
                  <Text style={styles.sectionTitle}>Looking For</Text>
                  <Text style={styles.preferenceText}>
                    Age {onboardingUser.preferences.ageMin || 18} - {onboardingUser.preferences.ageMax || 30}
                  </Text>
                  {onboardingUser.preferences.lookingFor && (
                    <Text style={styles.preferenceText}>
                      {onboardingUser.preferences.lookingFor === 'roommate' ? 'Looking for a roommate' :
                       onboardingUser.preferences.lookingFor === 'room' ? 'Looking for a room' :
                       'Open to roommate or room'}
                    </Text>
                  )}
                </View>
              )}

              {(onboardingUser?.igUrl || onboardingUser?.linkedinUrl || onboardingUser?.tiktokUrl) && (
                <View style={styles.socialSection}>
                  <Text style={styles.sectionTitle}>Social Links</Text>
                  {onboardingUser.igUrl && (
                    <Text style={styles.socialText}>Instagram: {onboardingUser.igUrl}</Text>
                  )}
                  {onboardingUser.linkedinUrl && (
                    <Text style={styles.socialText}>LinkedIn: {onboardingUser.linkedinUrl}</Text>
                  )}
                  {onboardingUser.tiktokUrl && (
                    <Text style={styles.socialText}>TikTok: {onboardingUser.tiktokUrl}</Text>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.cardTitle}>Complete Your Account</Text>
            <Text style={styles.cardSubtitle}>Enter your email and create a password</Text>
            
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            
            <TextInput
              style={styles.input}
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              placeholder="Confirm Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.confirmEmail ? <Text style={styles.errorText}>{errors.confirmEmail}</Text> : null}
            
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />
            {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}

            <TouchableOpacity style={[styles.primaryBtn, isLoading ? styles.primaryBtnDisabled : null]} disabled={isLoading} onPress={handleCreate}>
              <Text style={styles.primaryBtnText}>{isLoading ? 'Creating...' : 'Create Account'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  kb: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  swipeCardPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...theme.shadows.card,
  },
  photoSection: {
    position: 'relative',
    height: 480,
    backgroundColor: theme.colors.border,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginRight: 8,
  },
  ageText: {
    fontSize: 28,
    fontWeight: '400',
    color: 'white',
    opacity: 0.9,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  photoIndicators: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: 'white',
    width: 24,
  },
  noPhotoSection: {
    height: 300,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noPhotoText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  infoSection: {
    padding: 20,
  },
  bioContainer: {
    marginBottom: 20,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text.primary,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  lifestyleSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  hobbiesContainer: {
    marginTop: 8,
  },
  preferencesSection: {
    marginBottom: 20,
  },
  preferenceText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  socialSection: {
    marginBottom: 12,
  },
  socialText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  accountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: 20 },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius,
    padding: 14,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
    marginBottom: 4,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  primaryBtnDisabled: { opacity: 0.6 },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: theme.borderRadius,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryBtnText: { color: theme.colors.text.secondary, fontSize: 16, fontWeight: '600' },
  errorText: { color: theme.colors.danger, fontSize: 14, marginTop: 4 },
  fallbackCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});

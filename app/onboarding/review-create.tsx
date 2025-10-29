import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, GraduationCap, Home, Heart, Sparkles, Briefcase, CheckSquare, Square } from 'lucide-react-native';

export default function ReviewCreateScreen() {
  const { onboardingUser, clearOnboardingUser, currentUser, setOnboardingCompleted } = useAppStore();
  const [shortBio, setShortBio] = useState<string>(onboardingUser?.shortBio || '');
  const [autoMatchMessage, setAutoMatchMessage] = useState<string>(onboardingUser?.autoMatchMessage || 'Hi! Nice to meet you 👋');
  const [sendAutoMatchMessage, setSendAutoMatchMessage] = useState<boolean>(onboardingUser?.sendAutoMatchMessage !== false);
  const [recommendationCode, setRecommendationCode] = useState<string>(onboardingUser?.recommendationCode || '');
  const [useRecommendationCode, setUseRecommendationCode] = useState<boolean>(onboardingUser?.useRecommendationCode || false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ bio?: string; terms?: string }>({});

  if (!onboardingUser || !currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fallbackCenter}> 
          <Text style={styles.errorText}>Please complete authentication first.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/create-account')}>
            <Text style={styles.primaryBtnText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const validate = (): boolean => {
    const e: { bio?: string; terms?: string } = {};
    if (shortBio.trim().length > 500) {
      e.bio = 'Bio must be 500 characters or less';
    }
    if (!termsAccepted) {
      e.terms = 'You must accept the Terms of Service and Privacy Policy';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };





  const handleCreate = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      console.log('Saving profile to Supabase:', currentUser.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: onboardingUser.firstName || '',
          university: onboardingUser.university || '',
          city: onboardingUser.city || '',
          geo: onboardingUser.geo || { lat: 0, lng: 0 },
          has_room: onboardingUser.hasRoom || false,
          short_bio: shortBio.trim(),
          photos: onboardingUser.photos || [],
          auto_match_message: autoMatchMessage.trim(),
          send_auto_match_message: sendAutoMatchMessage,
          recommendation_code: useRecommendationCode ? recommendationCode.trim() : null,
          use_recommendation_code: useRecommendationCode,
          ig_url: onboardingUser.igUrl || '',
          linkedin_url: onboardingUser.linkedinUrl || '',
        })
        .eq('id', currentUser.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        Alert.alert('Error', 'Failed to save profile');
        setIsLoading(false);
        return;
      }

      if (onboardingUser.lifestyle) {
        const { error: lifestyleError } = await supabase.from('lifestyles').upsert({
          user_id: currentUser.id,
          hobbies: onboardingUser.lifestyle.hobbies || [],
          sports_hobbies: onboardingUser.lifestyle.sportsHobbies || [],
          cleanliness: onboardingUser.lifestyle.cleanliness || '',
          sleep: onboardingUser.lifestyle.sleep || '',
          smoker: onboardingUser.lifestyle.smoker || false,
          alcohol: (onboardingUser.lifestyle as any).alcohol || '',
          pets_ok: onboardingUser.lifestyle.petsOk || false,
          guests: onboardingUser.lifestyle.guests || '',
          noise: onboardingUser.lifestyle.noise || '',
          job_or_internship: onboardingUser.job || '',
          nationalities: onboardingUser.lifestyle.nationalities || [],
          languages: onboardingUser.lifestyle.languages || [],
        });

        if (lifestyleError) console.error('Lifestyle error:', lifestyleError);
      }

      if (onboardingUser.housing) {
        const { error: housingError } = await supabase.from('housing').upsert({
          user_id: currentUser.id,
          has_room: onboardingUser.hasRoom || false,
          neighborhood: onboardingUser.housing.neighborhood || '',
          bedrooms: onboardingUser.housing.bedrooms || 0,
          bathrooms: onboardingUser.housing.bathrooms || 0,
          rent: onboardingUser.housing.rent || 0,
          bills_included: onboardingUser.housing.billsIncluded || false,
          budget_min: onboardingUser.housing.budgetMin || 0,
          budget_max: onboardingUser.housing.budgetMax || 0,
          target_neighborhoods: onboardingUser.housing.targetNeighborhoods || [],
        });

        if (housingError) console.error('Housing error:', housingError);
      }

      if (onboardingUser.preferences) {
        const { error: prefError } = await supabase.from('preferences').upsert({
          user_id: currentUser.id,
          age_min: onboardingUser.preferences.ageMin || 18,
          age_max: onboardingUser.preferences.ageMax || 30,
          max_distance_km: onboardingUser.preferences.maxDistanceKm || 10,
          looking_for: onboardingUser.preferences.lookingFor || 'either',
          dealbreakers: onboardingUser.preferences.dealbreakers || [],
          must_haves: onboardingUser.preferences.mustHaves || [],
          city_only: onboardingUser.preferences.cityOnly !== false,
          university_filter: onboardingUser.preferences.universityFilter || false,
          gender_preference: (onboardingUser.preferences as any).genderPreference || 'no-preference',
          looking_for_gender: (onboardingUser.preferences as any).lookingForGender || [],
        });

        if (prefError) console.error('Preferences error:', prefError);
      }

      await logActivity(currentUser.id, 'onboarding_completed', {
        hasPhotos: (onboardingUser.photos?.length || 0) > 0,
        hasBio: !!shortBio.trim(),
      });

      setOnboardingCompleted(true);
      clearOnboardingUser();
      console.log('Onboarding complete, navigating to discover...');
      router.replace('/(tabs)/discover');
    } catch (error) {
      console.error('Complete profile error', error);
      Alert.alert('Error', 'Could not save profile.');
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
            <Text style={styles.cardTitle}>Complete Your Profile</Text>
            <Text style={styles.cardSubtitle}>Add a bio and set up your match preferences</Text>
            
            <Text style={styles.inputLabel}>Short Bio (optional, max 500 characters)</Text>
            <Text style={styles.helperText}>Tell potential roommates a bit about yourself</Text>
            <TextInput
              style={[styles.textArea, errors.bio && styles.inputError]}
              value={shortBio}
              onChangeText={setShortBio}
              placeholder="I'm a 3rd year computer science student who loves hiking and cooking. Looking for a clean, respectful roommate who enjoys good conversation..."
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={4}
              maxLength={500}
              testID="bio-input"
            />
            <Text style={styles.charCount}>{shortBio.length}/500</Text>
            {errors.bio ? <Text style={styles.errorText}>{errors.bio}</Text> : null}
            
            <Text style={styles.inputLabel}>Auto-Match Message</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={styles.toggleBtn}
                onPress={() => setSendAutoMatchMessage(!sendAutoMatchMessage)}
                testID="auto-message-toggle"
              >
                {sendAutoMatchMessage ? (
                  <CheckSquare size={24} color={theme.colors.primary} />
                ) : (
                  <Square size={24} color={theme.colors.text.secondary} />
                )}
                <Text style={styles.toggleText}>Send automatically when I match</Text>
              </TouchableOpacity>
            </View>
            {sendAutoMatchMessage && (
              <TextInput
                style={styles.input}
                value={autoMatchMessage}
                onChangeText={setAutoMatchMessage}
                placeholder="Hi! Nice to meet you 👋"
                placeholderTextColor={theme.colors.text.secondary}
                testID="auto-message-input"
              />
            )}

            <Text style={styles.inputLabel}>Recommendation Code (optional)</Text>
            <Text style={styles.helperText}>Have a code from your university or sports club? Enter it here to match within your verified community.</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={styles.toggleBtn}
                onPress={() => setUseRecommendationCode(!useRecommendationCode)}
                testID="rec-code-toggle"
              >
                {useRecommendationCode ? (
                  <CheckSquare size={24} color={theme.colors.primary} />
                ) : (
                  <Square size={24} color={theme.colors.text.secondary} />
                )}
                <Text style={styles.toggleText}>I have a recommendation code</Text>
              </TouchableOpacity>
            </View>
            {useRecommendationCode && (
              <TextInput
                style={styles.input}
                value={recommendationCode}
                onChangeText={setRecommendationCode}
                placeholder="e.g., UCLA2024, RUGBY-LON"
                placeholderTextColor={theme.colors.text.secondary}
                autoCapitalize="characters"
                testID="rec-code-input"
              />
            )}

            <View style={styles.termsSection}>
              <TouchableOpacity 
                style={styles.termsRow}
                onPress={() => setTermsAccepted(!termsAccepted)}
                testID="terms-checkbox"
              >
                {termsAccepted ? (
                  <CheckSquare size={24} color={theme.colors.primary} />
                ) : (
                  <Square size={24} color={theme.colors.text.secondary} />
                )}
                <Text style={styles.termsText}>
                  I accept the{' '}
                  <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
              {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, isLoading ? styles.primaryBtnDisabled : null]} 
              disabled={isLoading} 
              onPress={handleCreate}
              testID="find-roommate-button"
            >
              <Text style={styles.primaryBtnText}>{isLoading ? 'Saving...' : 'Find a Roommate'}</Text>
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
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius,
    padding: 14,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  toggleRow: {
    marginTop: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    flex: 1,
  },
  termsSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    lineHeight: 20,
    paddingTop: 2,
  },
  termsLink: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
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
  passwordHint: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 4, marginBottom: 4, lineHeight: 16 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, backgroundColor: theme.colors.surface },
  eyeText: { color: theme.colors.text.primary, fontWeight: '600' },
  passwordChecklist: { marginTop: 8, marginBottom: 4 },
  passwordRuleText: { fontSize: 13, marginTop: 2 },
  rulePassed: { color: '#10B981' },
  ruleFailed: { color: '#EF4444' },
  fallbackCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});

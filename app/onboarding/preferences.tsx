import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { setPreferences, getPreferencesByUserId } from '@/services/data';
import { Preferences } from '@/types';
import { useAppStore } from '@/store/app-store';




const DEALBREAKERS = [
  'smoker',
  'no pets',
  'often guests',
  'messy',
  'loud music',
  'parties',
  'Other'
];

const MUST_HAVES = [
  'pets ok',
  'quiet hours',
  'near campus',
  'clean',
  'non-smoker',
  'early bird',
  'night owl',
  'social',
  'Other'
];

export default function PreferencesScreen() {
  const params = useLocalSearchParams<{ edit?: string }>();
  const isEditMode = params?.edit === '1';
  const { updateOnboardingUser, currentUser, setOnboardingCompleted } = useAppStore();
  const [ageMin, setAgeMin] = useState<string>('18');
  const [ageMax, setAgeMax] = useState<string>('30');
  const [lookingForGender, setLookingForGender] = useState<'male' | 'female' | 'both'>('both');
  const [universityOnly, setUniversityOnly] = useState<boolean>(false);
  const [selectedDealbreakers, setSelectedDealbreakers] = useState<string[]>([]);
  const [selectedMustHaves, setSelectedMustHaves] = useState<string[]>([]);
  const [customDealbreaker, setCustomDealbreaker] = useState<string>('');
  const [customMustHave, setCustomMustHave] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadExisting = async () => {
      try {
        if (isEditMode && currentUser) {
          const existing = await getPreferencesByUserId(currentUser.id);
          if (existing) {
            setAgeMin(existing.ageMin.toString());
            setAgeMax(existing.ageMax.toString());
            setLookingForGender((existing.lookingFor === 'roommate' || existing.lookingFor === 'room') ? 'both' : 'both');
            setUniversityOnly(existing.universityFilter || false);
            
            const dealbreakers = existing.dealbreakers || [];
            const customDB = dealbreakers.find(db => !DEALBREAKERS.includes(db));
            if (customDB) {
              setCustomDealbreaker(customDB);
              setSelectedDealbreakers([...dealbreakers.filter(db => DEALBREAKERS.includes(db)), 'Other']);
            } else {
              setSelectedDealbreakers(dealbreakers);
            }
            
            const mustHaves = existing.mustHaves || [];
            const customMH = mustHaves.find(mh => !MUST_HAVES.includes(mh));
            if (customMH) {
              setCustomMustHave(customMH);
              setSelectedMustHaves([...mustHaves.filter(mh => MUST_HAVES.includes(mh)), 'Other']);
            } else {
              setSelectedMustHaves(mustHaves);
            }
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadExisting();
  }, [isEditMode, currentUser]);

  const toggleChip = (item: string, isDealbreakerList: boolean) => {
    if (!item?.trim()) return;
    
    if (isDealbreakerList) {
      setSelectedDealbreakers(prev => {
        if (prev.includes(item)) {
          if (item === 'Other') {
            setCustomDealbreaker('');
          }
          return prev.filter(i => i !== item);
        }
        return [...prev, item];
      });
    } else {
      setSelectedMustHaves(prev => {
        if (prev.includes(item)) {
          if (item === 'Other') {
            setCustomMustHave('');
          }
          return prev.filter(i => i !== item);
        }
        return [...prev, item];
      });
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const ageMinNum = parseInt(ageMin, 10);
      const ageMaxNum = parseInt(ageMax, 10);
      
      const finalDealbreakers = selectedDealbreakers
        .filter(db => db !== 'Other')
        .concat(selectedDealbreakers.includes('Other') && customDealbreaker.trim() ? [customDealbreaker.trim()] : []);
      
      const finalMustHaves = selectedMustHaves
        .filter(mh => mh !== 'Other')
        .concat(selectedMustHaves.includes('Other') && customMustHave.trim() ? [customMustHave.trim()] : []);
      
      if (isEditMode && currentUser) {
        const preferences: Preferences = {
          userId: currentUser.id,
          ageMin: ageMinNum,
          ageMax: ageMaxNum,
          cityOnly: true,
          universityFilter: universityOnly,
          maxDistanceKm: 0,
          lookingFor: 'either',
          dealbreakers: finalDealbreakers,
          mustHaves: finalMustHaves,
          quizAnswers: {}
        };
        await setPreferences(preferences);
        Alert.alert('Saved', 'Preferences updated');
        router.back();
      } else {
        updateOnboardingUser({
          preferences: {
            ageMin: ageMinNum,
            ageMax: ageMaxNum,
            cityOnly: true,
            universityFilter: universityOnly,
            maxDistanceKm: 0,
            lookingFor: 'either',
            dealbreakers: finalDealbreakers,
            mustHaves: finalMustHaves,
            quizAnswers: {}
          }
        });
        router.push('./review-create');
      }
    } catch (error) {
      console.error('Error handling preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      if (isEditMode && currentUser) {
        const defaultPreferences: Preferences = {
          userId: currentUser.id,
          ageMin: 18,
          ageMax: 30,
          cityOnly: true,
          universityFilter: false,
          maxDistanceKm: 0,
          lookingFor: 'either',
          dealbreakers: [],
          mustHaves: [],
          quizAnswers: {}
        };
        await setPreferences(defaultPreferences);
        Alert.alert('Saved', 'Reverted to defaults');
        router.back();
      } else {
        updateOnboardingUser({
          preferences: {
            ageMin: 18,
            ageMax: 30,
            cityOnly: true,
            universityFilter: false,
            maxDistanceKm: 0,
            lookingFor: 'either',
            dealbreakers: [],
            mustHaves: [],
            quizAnswers: {}
          }
        });
        router.push('./review-create');
      }
    } catch (error) {
      console.error('Error saving default preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ageMinNum = parseInt(ageMin, 10) || 0;
  const ageMaxNum = parseInt(ageMax, 10) || 0;
  const canComplete = ageMinNum <= ageMaxNum && ageMinNum >= 18 && ageMaxNum <= 99;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>Preferences</Text>
            <Text style={styles.subtitle}>
              Set your matching preferences
            </Text>
            
            {/* Who are you looking for */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who are you looking for?</Text>
              <View style={styles.genderOptionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    lookingForGender === 'male' && styles.genderOptionSelected
                  ]}
                  onPress={() => setLookingForGender('male')}
                >
                  <Text style={[
                    styles.genderOptionText,
                    lookingForGender === 'male' && styles.genderOptionTextSelected
                  ]}>
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    lookingForGender === 'female' && styles.genderOptionSelected
                  ]}
                  onPress={() => setLookingForGender('female')}
                >
                  <Text style={[
                    styles.genderOptionText,
                    lookingForGender === 'female' && styles.genderOptionTextSelected
                  ]}>
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    lookingForGender === 'both' && styles.genderOptionSelected
                  ]}
                  onPress={() => setLookingForGender('both')}
                >
                  <Text style={[
                    styles.genderOptionText,
                    lookingForGender === 'both' && styles.genderOptionTextSelected
                  ]}>
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* University Filter */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.sectionTitle}>Only show people from my university</Text>
                </View>
                <Switch
                  value={universityOnly}
                  onValueChange={setUniversityOnly}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="white"
                />
              </View>
            </View>

            {/* Age Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Age Range</Text>
              <View style={styles.ageInputsContainer}>
                <View style={styles.ageInputWrapper}>
                  <Text style={styles.ageInputLabel}>Min Age</Text>
                  <TextInput
                    style={styles.ageInput}
                    value={ageMin}
                    onChangeText={setAgeMin}
                    keyboardType="number-pad"
                    placeholder="18"
                    placeholderTextColor={theme.colors.text.secondary}
                    maxLength={2}
                  />
                </View>
                <View style={styles.ageInputWrapper}>
                  <Text style={styles.ageInputLabel}>Max Age</Text>
                  <TextInput
                    style={styles.ageInput}
                    value={ageMax}
                    onChangeText={setAgeMax}
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor={theme.colors.text.secondary}
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            {/* Deal-breakers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deal-breakers</Text>
              <Text style={styles.sectionSubtitle}>Things you absolutely don&apos;t want</Text>
              <View style={styles.chipsContainer}>
                {DEALBREAKERS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      selectedDealbreakers.includes(item) && styles.chipSelected
                    ]}
                    onPress={() => toggleChip(item, true)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedDealbreakers.includes(item) && styles.chipTextSelected
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedDealbreakers.includes('Other') && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    value={customDealbreaker}
                    onChangeText={setCustomDealbreaker}
                    placeholder="Enter your deal-breaker"
                    placeholderTextColor={theme.colors.text.secondary}
                  />
                </View>
              )}
            </View>

            {/* Must-haves */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Must-haves</Text>
              <Text style={styles.sectionSubtitle}>Things that are important to you</Text>
              <View style={styles.chipsContainer}>
                {MUST_HAVES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      selectedMustHaves.includes(item) && styles.chipSelected
                    ]}
                    onPress={() => toggleChip(item, false)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedMustHaves.includes(item) && styles.chipTextSelected
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedMustHaves.includes('Other') && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    value={customMustHave}
                    onChangeText={setCustomMustHave}
                    placeholder="Enter your must-have"
                    placeholderTextColor={theme.colors.text.secondary}
                  />
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                disabled={isLoading}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  (!canComplete || isLoading) && styles.completeButtonDisabled
                ]}
                onPress={handleComplete}
                disabled={!canComplete || isLoading}
              >
                <Text style={styles.completeButtonText}>
                  {isLoading ? 'Saving...' : isEditMode ? 'Save' : 'Continue'}
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
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  genderOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  genderOptionTextSelected: {
    color: 'white',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  ageInputsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ageInputWrapper: {
    flex: 1,
  },
  ageInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  ageInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  completeButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    ...theme.shadows.button,
  },
  completeButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  customInputContainer: {
    marginTop: 12,
  },
  customInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
});
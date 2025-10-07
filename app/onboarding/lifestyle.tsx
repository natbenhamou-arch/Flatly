import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { CleanlinessLevel, SleepSchedule, GuestFrequency, NoiseTolerance, Lifestyle } from '@/types';

const COOKING_QUESTION = {
  id: 'cooking_habits',
  question: 'What are your cooking habits like?',
  options: ['🍳 Love cooking elaborate meals', '🥗 Simple meals', '🍕 Mostly takeout/delivery']
};

export default function LifestyleScreen() {
  const { onboardingUser, updateOnboardingUser } = useAppStore();
  
  const [cleanliness, setCleanliness] = useState<'chill' | 'avg' | 'meticulous'>(onboardingUser?.lifestyle?.cleanliness ?? 'avg');
  const [sleep, setSleep] = useState<'early' | 'flex' | 'night'>(onboardingUser?.lifestyle?.sleep ?? 'flex');
  const [smoker, setSmoker] = useState<boolean>(onboardingUser?.lifestyle?.smoker ?? false);
  const [petsOk, setPetsOk] = useState<boolean>(onboardingUser?.lifestyle?.petsOk ?? true);
  const [guests, setGuests] = useState<'never' | 'sometimes' | 'often'>(onboardingUser?.lifestyle?.guests ?? 'sometimes');
  const [noise, setNoise] = useState<'low' | 'med' | 'high'>(onboardingUser?.lifestyle?.noise ?? 'med');
  const [cookingAnswer, setCookingAnswer] = useState<string>(onboardingUser?.preferences?.quizAnswers?.cooking_habits ?? '');
  const [foodPreference, setFoodPreference] = useState<Lifestyle['foodPreference']>(onboardingUser?.lifestyle?.foodPreference ?? undefined);

  const handleCookingAnswer = (answer: string) => {
    setCookingAnswer(answer);
  };

  const handleContinue = () => {
    updateOnboardingUser({ 
      lifestyle: {
        ...onboardingUser?.lifestyle,
        cleanliness,
        sleep,
        smoker,
        petsOk,
        guests,
        noise,
        foodPreference,
      },
      preferences: {
        ...onboardingUser?.preferences,
        quizAnswers: {
          ...onboardingUser?.preferences?.quizAnswers,
          cooking_habits: cookingAnswer
        }
      }
    });
    
    router.push('./vibe');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Lifestyle</Text>
          <Text style={styles.subtitle}>
            Tell us about your daily habits
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Living Preferences 🏠</Text>
            
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Cleanliness level</Text>
              <View style={styles.optionRow}>
                {[
                  { key: 'chill', label: '😌 Chill', value: CleanlinessLevel.CHILL },
                  { key: 'avg', label: '🧹 Average', value: CleanlinessLevel.AVG },
                  { key: 'meticulous', label: '✨ Meticulous', value: CleanlinessLevel.METICULOUS }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionButton,
                      cleanliness === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => setCleanliness(option.value as 'chill' | 'avg' | 'meticulous')}
                  >
                    <Text style={[
                      styles.optionText,
                      cleanliness === option.value && styles.optionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Sleep schedule</Text>
              <View style={styles.optionRow}>
                {[
                  { key: 'early', label: '🌅 Early bird', value: SleepSchedule.EARLY },
                  { key: 'flex', label: '🔄 Flexible', value: SleepSchedule.FLEX },
                  { key: 'night', label: '🦉 Night owl', value: SleepSchedule.NIGHT }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionButton,
                      sleep === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => setSleep(option.value as 'early' | 'flex' | 'night')}
                  >
                    <Text style={[
                      styles.optionText,
                      sleep === option.value && styles.optionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Having guests over</Text>
              <View style={styles.optionRow}>
                {[
                  { key: 'never', label: '🚫 Never', value: GuestFrequency.NEVER },
                  { key: 'sometimes', label: '👥 Sometimes', value: GuestFrequency.SOMETIMES },
                  { key: 'often', label: '🎉 Often', value: GuestFrequency.OFTEN }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionButton,
                      guests === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => setGuests(option.value as 'never' | 'sometimes' | 'often')}
                  >
                    <Text style={[
                      styles.optionText,
                      guests === option.value && styles.optionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Noise tolerance</Text>
              <View style={styles.optionRow}>
                {[
                  { key: 'low', label: '🤫 Low', value: NoiseTolerance.LOW },
                  { key: 'med', label: '🔊 Medium', value: NoiseTolerance.MED },
                  { key: 'high', label: '🎵 High', value: NoiseTolerance.HIGH }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionButton,
                      noise === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => setNoise(option.value as 'low' | 'med' | 'high')}
                  >
                    <Text style={[
                      styles.optionText,
                      noise === option.value && styles.optionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>🚬 I smoke</Text>
                <Switch
                  value={smoker}
                  onValueChange={setSmoker}
                  trackColor={{ false: theme.colors.text.secondary + '40', true: theme.colors.primary + '80' }}
                  thumbColor={smoker ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>🐕 I&apos;m okay with pets</Text>
                <Switch
                  value={petsOk}
                  onValueChange={setPetsOk}
                  trackColor={{ false: theme.colors.text.secondary + '40', true: theme.colors.primary + '80' }}
                  thumbColor={petsOk ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cooking Habits 🍳</Text>
            <View style={styles.cookingQuestion}>
              <Text style={styles.questionText}>{COOKING_QUESTION.question}</Text>
              <View style={styles.cookingOptions}>
                {COOKING_QUESTION.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.cookingOption,
                      cookingAnswer === option && styles.cookingOptionSelected
                    ]}
                    onPress={() => handleCookingAnswer(option)}
                  >
                    <Text style={[
                      styles.cookingOptionText,
                      cookingAnswer === option && styles.cookingOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Preference 🍽️</Text>
            <View style={styles.pillsContainer}>
              {[
                { key: 'omnivore', label: '🥩 Omnivore', color: '#e17055' },
                { key: 'vegetarian', label: '🥬 Vegetarian', color: '#00b894' },
                { key: 'vegan', label: '🌱 Vegan', color: '#55a3ff' },
                { key: 'halal', label: '☪️ Halal', color: '#fdcb6e' },
                { key: 'kosher', label: '✡️ Kosher', color: '#a29bfe' },
                { key: 'other', label: '🤔 Other', color: '#fd79a8' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.pill,
                    { backgroundColor: foodPreference === (opt.key as Lifestyle['foodPreference']) ? opt.color : opt.color + '30' },
                    foodPreference === (opt.key as Lifestyle['foodPreference']) && styles.pillSelected
                  ]}
                  onPress={() => setFoodPreference(opt.key as Lifestyle['foodPreference'])}
                  testID={`food-${opt.key}`}
                >
                  <Text style={[
                    styles.pillText,
                    { color: foodPreference === (opt.key as Lifestyle['foodPreference']) ? 'white' : opt.color }
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
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
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  preferenceGroup: {
    marginBottom: 24,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary + '40',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  switchGroup: {
    marginTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  cookingQuestion: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
    lineHeight: 22,
  },
  cookingOptions: {
    gap: 8,
  },
  cookingOption: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text.secondary + '30',
  },
  cookingOptionSelected: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  cookingOptionText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  cookingOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pillSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
    ...theme.shadows.button,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

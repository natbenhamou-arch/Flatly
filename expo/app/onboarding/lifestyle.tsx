import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform, PanResponder, LayoutChangeEvent } from 'react-native';
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

  const [cleanlinessScore, setCleanlinessScore] = useState<number>(onboardingUser?.lifestyle?.cleanlinessScore ?? 5);
  const [sleepRhythmScore, setSleepRhythmScore] = useState<number>(onboardingUser?.lifestyle?.sleepRhythmScore ?? 5);
  const [guestsScore, setGuestsScore] = useState<number>(onboardingUser?.lifestyle?.guestsScore ?? 5);
  const [noiseLevelScore, setNoiseLevelScore] = useState<number>(onboardingUser?.lifestyle?.noiseLevelScore ?? 5);

  const [smoker, setSmoker] = useState<boolean>(onboardingUser?.lifestyle?.smoker ?? false);
  const [petsOk, setPetsOk] = useState<boolean>(onboardingUser?.lifestyle?.petsOk ?? true);
  const [cookingAnswer, setCookingAnswer] = useState<string>(onboardingUser?.preferences?.quizAnswers?.cooking_habits ?? '');
  const [foodPreference, setFoodPreference] = useState<Lifestyle['foodPreference']>(onboardingUser?.lifestyle?.foodPreference ?? undefined);

  const handleCookingAnswer = (answer: string) => {
    setCookingAnswer(answer);
  };

  const bucketize = useCallback((value: number, buckets: Array<{ max: number; label: string }>): string => {
    for (let i = 0; i < buckets.length; i++) {
      if (value <= buckets[i].max) return buckets[i].label;
    }
    return buckets[buckets.length - 1]?.label ?? '';
  }, []);

  const cleanlinessEnum = useMemo(() => {
    return bucketize(cleanlinessScore, [
      { max: 3, label: CleanlinessLevel.CHILL },
      { max: 7, label: CleanlinessLevel.AVG },
      { max: 10, label: CleanlinessLevel.METICULOUS },
    ]) as 'chill' | 'avg' | 'meticulous';
  }, [bucketize, cleanlinessScore]);

  const sleepEnum = useMemo(() => {
    // 0 = very early, 10 = very late
    return bucketize(sleepRhythmScore, [
      { max: 3, label: SleepSchedule.EARLY },
      { max: 7, label: SleepSchedule.FLEX },
      { max: 10, label: SleepSchedule.NIGHT },
    ]) as 'early' | 'flex' | 'night';
  }, [bucketize, sleepRhythmScore]);

  const guestsEnum = useMemo(() => {
    return bucketize(guestsScore, [
      { max: 3, label: GuestFrequency.NEVER },
      { max: 7, label: GuestFrequency.SOMETIMES },
      { max: 10, label: GuestFrequency.OFTEN },
    ]) as 'never' | 'sometimes' | 'often';
  }, [bucketize, guestsScore]);

  const noiseEnum = useMemo(() => {
    return bucketize(noiseLevelScore, [
      { max: 3, label: NoiseTolerance.LOW },
      { max: 7, label: NoiseTolerance.MED },
      { max: 10, label: NoiseTolerance.HIGH },
    ]) as 'low' | 'med' | 'high';
  }, [bucketize, noiseLevelScore]);

  const handleContinue = () => {
    updateOnboardingUser({ 
      lifestyle: {
        ...onboardingUser?.lifestyle,
        // categorical for backward compatibility in other parts of the app
        cleanliness: cleanlinessEnum,
        sleep: sleepEnum,
        guests: guestsEnum,
        noise: noiseEnum,
        // numeric sliders
        cleanlinessScore,
        sleepRhythmScore,
        guestsScore,
        noiseLevelScore,
        smoker,
        petsOk,
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

            <SliderRow
              label="Cleanliness"
              category="cleanliness"
              value={cleanlinessScore}
              onChange={setCleanlinessScore}
              leftHint="Chill"
              rightHint="Meticulous"
              testID="slider-cleanliness"
            />

            <SliderRow
              label="Sleep rhythm"
              category="sleep"
              value={sleepRhythmScore}
              onChange={setSleepRhythmScore}
              leftHint="Early"
              rightHint="Night owl"
              testID="slider-sleep"
            />

            <SliderRow
              label="Guests"
              category="guests"
              value={guestsScore}
              onChange={setGuestsScore}
              leftHint="Never"
              rightHint="Often"
              testID="slider-guests"
            />

            <SliderRow
              label="Noise tolerance"
              category="noise"
              value={noiseLevelScore}
              onChange={setNoiseLevelScore}
              leftHint="Low"
              rightHint="High"
              testID="slider-noise"
            />

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
            testID="continue-button"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SliderRow({
  label,
  category,
  value,
  onChange,
  leftHint,
  rightHint,
  testID,
}: {
  label: string;
  category: 'cleanliness' | 'sleep' | 'guests' | 'noise';
  value: number;
  onChange: (v: number) => void;
  leftHint?: string;
  rightHint?: string;
  testID?: string;
}) {
  const trackWidthRef = useRef<number>(0);
  const [local, setLocal] = useState<number>(value);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
  }, []);

  const clamp = useCallback((n: number, min = 0, max = 10) => Math.max(min, Math.min(max, n)), []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const x = (evt.nativeEvent as any).locationX as number;
          const next = clamp(Math.round((x / Math.max(trackWidthRef.current, 1)) * 10));
          setLocal(next);
          onChange(next);
        },
        onPanResponderMove: (evt) => {
          const x = (evt.nativeEvent as any).locationX as number;
          const next = clamp(Math.round((x / Math.max(trackWidthRef.current, 1)) * 10));
          setLocal(next);
          onChange(next);
        },
        onPanResponderRelease: () => {
          onChange(local);
        },
      }),
    [clamp, local, onChange]
  );

  const fillPercent = useMemo(() => (local / 10), [local]);
  const percentText = `${fillPercent * 100}%`;

  const emoji = useMemo(() => {
    const p = fillPercent;
    switch (category) {
      case 'cleanliness':
        if (p <= 0.2) return '😅'; // chill
        if (p <= 0.4) return '🧹';
        if (p <= 0.6) return '🧼';
        if (p <= 0.8) return '🧽';
        return '✨';
      case 'sleep':
        if (p <= 0.2) return '🌅'; // early
        if (p <= 0.4) return '😴';
        if (p <= 0.6) return '🌙';
        if (p <= 0.8) return '🦉';
        return '🌃';
      case 'guests':
        if (p <= 0.2) return '🙅‍♂️'; // never
        if (p <= 0.4) return '🙂';
        if (p <= 0.6) return '👥';
        if (p <= 0.8) return '🎈';
        return '🎉';
      case 'noise':
      default:
        if (p <= 0.2) return '🤫'; // low
        if (p <= 0.4) return '🎧';
        if (p <= 0.6) return '🙂';
        if (p <= 0.8) return '📣';
        return '🔊';
    }
  }, [fillPercent, category]);

  return (
    <View style={styles.preferenceGroup} testID={testID}>
      <View style={styles.sliderHeaderRow}>
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <View style={styles.sliderTrack} onLayout={onLayout} {...panResponder.panHandlers}>
        <View style={[styles.sliderFill, { width: percentText, backgroundColor: `rgba(37,99,235,${0.2 + 0.6 * fillPercent})` }]} />
        <View style={[styles.valueBubbleFloating]}> 
          <Text style={styles.valueBubbleText}>{local}</Text>
        </View>
        <View style={[styles.sliderThumb, { left: percentText }]}> 
          <Text style={styles.sliderThumbEmoji}>{emoji}</Text>
        </View>
      </View>
      <View style={styles.sliderHintsRow}>
        <Text style={styles.sliderHintText}>{leftHint ?? ''}</Text>
        <Text style={styles.sliderHintText}>{rightHint ?? ''}</Text>
      </View>
    </View>
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
  sliderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderTrack: {
    height: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary + '30',
    overflow: 'visible',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary + '33',
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 28,
    height: 28,
    marginLeft: -14,
    borderRadius: 14,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumbEmoji: {
    fontSize: 18,
  },
  sliderHintsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderHintText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  valueBubble: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  valueBubbleFloating: {
    position: 'absolute',
    top: -38,
    right: 0,
    minWidth: 48,
    height: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBubbleText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  switchGroup: {
    marginTop: 24,
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

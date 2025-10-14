import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, KeyboardAvoidingView, Platform, PanResponder, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { Lifestyle } from '@/types';

export default function VibeScreen() {
  const { onboardingUser, updateOnboardingUser } = useAppStore();
  
  const [religion, setReligion] = useState<string>(onboardingUser?.lifestyle?.religion ?? '');
  const [showReligion, setShowReligion] = useState<boolean>(onboardingUser?.lifestyle?.showReligion ?? false);
  const [politicalView, setPoliticalView] = useState<Lifestyle['politicalView']>(onboardingUser?.lifestyle?.politicalView ?? undefined);
  const [showPoliticalView, setShowPoliticalView] = useState<boolean>(onboardingUser?.lifestyle?.showPoliticalView ?? false);
  const [religiousChoice, setReligiousChoice] = useState<Lifestyle['religiousChoice']>(onboardingUser?.lifestyle?.religiousChoice ?? undefined);
  const [moneyStyle, setMoneyStyle] = useState<Lifestyle['moneyStyle']>(onboardingUser?.lifestyle?.moneyStyle ?? undefined);

  const initialPoliticalIndex = useMemo(() => {
    switch (politicalView) {
      case 'progressive':
        return 0;
      case 'centrist':
        return 1;
      case 'conservative':
        return 2;
      default:
        return 1;
    }
  }, [politicalView]);

  const [politicsIndex, setPoliticsIndex] = useState<number>(initialPoliticalIndex);
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const x = (evt.nativeEvent as any).locationX as number;
      const w = trackWidth || 1;
      const ratio = Math.max(0, Math.min(1, x / w));
      const idx = ratio < 0.33 ? 0 : ratio < 0.66 ? 1 : 2;
      setPoliticsIndex(idx);
    },
    onPanResponderMove: (evt) => {
      const x = (evt.nativeEvent as any).locationX as number;
      const w = trackWidth || 1;
      const ratio = Math.max(0, Math.min(1, x / w));
      const idx = ratio < 0.33 ? 0 : ratio < 0.66 ? 1 : 2;
      setPoliticsIndex(idx);
    },
    onPanResponderRelease: () => {
      const map: Lifestyle['politicalView'][] = ['progressive', 'centrist', 'conservative'];
      setPoliticalView(map[politicsIndex]);
    },
  }), [politicsIndex, trackWidth]);

  const handleContinue = () => {
    updateOnboardingUser({ 
      lifestyle: {
        ...onboardingUser?.lifestyle,
        religion: religion.trim() || undefined,
        showReligion,
        politicalView,
        showPoliticalView,
        religiousChoice,
        moneyStyle,
      }
    });
    
    router.push('./preferences');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Vibe Questionnaire</Text>
          <Text style={styles.subtitle}>
            Help us understand your values and preferences
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Religion (Optional)</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Add an optional clarification</Text>
              <TextInput
                style={styles.input}
                value={religion}
                onChangeText={setReligion}
                placeholder="e.g., Catholic, Muslim, Hindu, Spiritual, etc."
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Show religion in my profile</Text>
              <Switch
                value={showReligion}
                onValueChange={setShowReligion}
                trackColor={{ false: theme.colors.text.secondary + '40', true: theme.colors.primary + '80' }}
                thumbColor={showReligion ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Are you religious?</Text>
            <View style={styles.dotsContainer}>
              {[
                { key: 'yes', label: 'Yes', color: '#74b9ff' },
                { key: 'no', label: 'No', color: '#fd79a8' },
                { key: 'prefer_not', label: 'Prefer not to say', color: '#fdcb6e' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.dotItem}
                  onPress={() => setReligiousChoice(opt.key as Lifestyle['religiousChoice'])}
                  testID={`religious-${opt.key}`}
                >
                  <View style={[
                    styles.dot,
                    { backgroundColor: opt.color },
                    religiousChoice === (opt.key as Lifestyle['religiousChoice']) && styles.dotSelected
                  ]} />
                  <Text style={[
                    styles.dotText,
                    religiousChoice === (opt.key as Lifestyle['religiousChoice']) && styles.dotTextSelected
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Politics</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack} onLayout={onTrackLayout} {...panResponder.panHandlers} testID="politics-slider">
                <View style={styles.sliderTickRow} pointerEvents="none">
                  {[0, 1, 2].map((i) => (
                    <View key={`tick-${i}`} style={[styles.tick, politicsIndex === i && styles.tickActive]} />
                  ))}
                </View>
                <View style={[styles.knob, { left: Math.max(0, trackWidth > 0 ? 12 + ((trackWidth - 24) * (politicsIndex / 2)) - 14 : 0) }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelLeft}>Progressive</Text>
                <Text style={styles.sliderLabelCenter}>Center</Text>
                <Text style={styles.sliderLabelRight}>Conservative</Text>
              </View>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Show political view in my profile</Text>
              <Switch
                value={showPoliticalView}
                onValueChange={setShowPoliticalView}
                trackColor={{ false: theme.colors.text.secondary + '40', true: theme.colors.primary + '80' }}
                thumbColor={showPoliticalView ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Money style 💰</Text>
            <View style={styles.emojiCardsContainer}>
              {[
                { key: 'meticulous', label: 'Meticulous', emoji: '📊', desc: 'Track every penny' },
                { key: 'balanced', label: 'Balanced', emoji: '⚖️', desc: 'Budget but flexible' },
                { key: 'loose', label: 'Loose', emoji: '💸', desc: 'Go with the flow' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.emojiCard,
                    moneyStyle === (opt.key as Lifestyle['moneyStyle']) && styles.emojiCardSelected
                  ]}
                  onPress={() => setMoneyStyle(opt.key as Lifestyle['moneyStyle'])}
                  testID={`money-${opt.key}`}
                >
                  <Text style={styles.emojiCardEmoji}>{opt.emoji}</Text>
                  <Text style={[
                    styles.emojiCardTitle,
                    moneyStyle === (opt.key as Lifestyle['moneyStyle']) && styles.emojiCardTitleSelected
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.emojiCardDesc}>{opt.desc}</Text>
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
    color: theme.colors.text.primary,
    ...theme.shadows.input,
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
  dotsContainer: {
    gap: 12,
  },
  dotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  dotSelected: {
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dotText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  dotTextSelected: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  sliderContainer: {
    gap: 8,
  },
  sliderTrack: {
    position: 'relative',
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text.secondary + '30',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sliderTickRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tick: {
    width: 2,
    height: 12,
    backgroundColor: theme.colors.text.secondary + '50',
  },
  tickActive: {
    backgroundColor: theme.colors.primary,
  },
  knob: {
    position: 'absolute',
    top: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelLeft: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  sliderLabelCenter: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  sliderLabelRight: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  emojiCardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  emojiCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text.secondary + '30',
    alignItems: 'center',
    gap: 6,
  },
  emojiCardSelected: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  emojiCardEmoji: {
    fontSize: 24,
  },
  emojiCardTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  emojiCardTitleSelected: {
    color: theme.colors.primary,
  },
  emojiCardDesc: {
    fontSize: 11,
    color: theme.colors.text.secondary + '80',
    textAlign: 'center',
    fontWeight: '400',
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

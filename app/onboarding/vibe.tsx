import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native';
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
  const [religiousChoice, setReligiousChoice] = useState<Lifestyle['religiousChoice']>(onboardingUser?.lifestyle?.religiousChoice ?? undefined);
  const [moneyStyle, setMoneyStyle] = useState<Lifestyle['moneyStyle']>(onboardingUser?.lifestyle?.moneyStyle ?? undefined);

  const handleContinue = () => {
    updateOnboardingUser({ 
      lifestyle: {
        ...onboardingUser?.lifestyle,
        religion: religion.trim() || undefined,
        showReligion,
        politicalView,
        religiousChoice,
        moneyStyle,
      }
    });
    
    router.push('./media');
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
            <Text style={styles.sectionTitle}>Religion (Optional) 🙏</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Religion</Text>
              <TextInput
                style={styles.input}
                value={religion}
                onChangeText={setReligion}
                placeholder="e.g., Christian, Muslim, Hindu, etc."
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
            <Text style={styles.sectionTitle}>How religious are you? 🙏</Text>
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
            <Text style={styles.sectionTitle}>Political view 🗳️</Text>
            <View style={styles.arrowContainer}>
              {[
                { key: 'conservative', label: 'Conservative', emoji: '🔵' },
                { key: 'progressive', label: 'Progressive', emoji: '🟢' },
                { key: 'centrist', label: 'Centrist', emoji: '⚪' },
                { key: 'ecological', label: 'Ecological', emoji: '🌱' },
                { key: 'apolitical', label: 'Apolitical', emoji: '🤷' },
              ].map((opt, index) => (
                <View key={opt.key} style={styles.arrowItem}>
                  <TouchableOpacity
                    style={[
                      styles.arrowButton,
                      politicalView === (opt.key as Lifestyle['politicalView']) && styles.arrowButtonSelected
                    ]}
                    onPress={() => setPoliticalView(opt.key as Lifestyle['politicalView'])}
                    testID={`politics-${opt.key}`}
                  >
                    <Text style={styles.arrowEmoji}>{opt.emoji}</Text>
                    <Text style={[
                      styles.arrowText,
                      politicalView === (opt.key as Lifestyle['politicalView']) && styles.arrowTextSelected
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                  {index < 4 && <Text style={styles.arrowSeparator}>→</Text>}
                </View>
              ))}
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
  arrowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  arrowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text.secondary + '30',
    gap: 6,
  },
  arrowButtonSelected: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  arrowEmoji: {
    fontSize: 16,
  },
  arrowText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  arrowTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  arrowSeparator: {
    fontSize: 16,
    color: theme.colors.text.secondary + '60',
    marginHorizontal: 4,
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

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { HOBBY_CATEGORIES } from '@/types';

const SPORTS_HOBBIES = ['Gym','Running','Cycling','Football','Basketball','Yoga','Chess','Gaming','Photography','Cooking','Travel','Reading'];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'];

const NATIONALITIES = ['American', 'British', 'Canadian', 'Australian', 'French', 'German', 'Italian', 'Spanish', 'Chinese', 'Japanese', 'Indian', 'Brazilian', 'Mexican', 'Other'];

type SearchMultiSelectProps = {
  title: string;
  subtitle?: string;
  curated: string[];
  placeholder: string;
  selected: string[];
  onChange: (next: string[]) => void;
  testIDPrefix: string;
};

const SearchMultiSelect = React.memo(function SearchMultiSelect({
  title,
  subtitle,
  curated,
  placeholder,
  selected,
  onChange,
  testIDPrefix,
}: SearchMultiSelectProps) {
  const [query, setQuery] = useState<string>('');

  const normalizedSelected = useMemo(() => selected.map(s => s.trim()), [selected]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = curated.filter(item => !normalizedSelected.includes(item));
    if (!q) return base.slice(0, 20);
    return base.filter(item => item.toLowerCase().includes(q)).slice(0, 20);
  }, [curated, normalizedSelected, query]);

  const addItem = useCallback((item: string) => {
    const v = item.trim();
    if (!v) return;
    if (normalizedSelected.includes(v)) return;
    onChange([...normalizedSelected, v]);
    setQuery('');
  }, [normalizedSelected, onChange]);

  const removeItem = useCallback((item: string) => {
    onChange(normalizedSelected.filter(i => i !== item));
  }, [normalizedSelected, onChange]);

  const canAddCustom = useMemo(() => {
    const v = query.trim();
    if (!v) return false;
    const exists = curated.some(c => c.toLowerCase() === v.toLowerCase()) || normalizedSelected.some(s => s.toLowerCase() === v.toLowerCase());
    return !exists;
  }, [curated, normalizedSelected, query]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}

      <View style={styles.searchBox}>
        <TextInput
          testID={`${testIDPrefix}-search`}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={() => addItem(query)}
        />
        {canAddCustom && (
          <TouchableOpacity
            testID={`${testIDPrefix}-add-custom`}
            onPress={() => addItem(query)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsWrap}>
          {suggestions.map(s => (
            <TouchableOpacity
              key={`${testIDPrefix}-sugg-${s}`}
              testID={`${testIDPrefix}-sugg-${s}`}
              style={styles.suggestionChip}
              onPress={() => addItem(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {normalizedSelected.length > 0 && (
        <View style={styles.chipContainer}>
          {normalizedSelected.map(v => (
            <TouchableOpacity
              key={`${testIDPrefix}-sel-${v}`}
              testID={`${testIDPrefix}-chip-${v}`}
              onPress={() => removeItem(v)}
              style={[styles.chip, styles.chipSelected]}
            >
              <Text style={[styles.chipText, styles.chipTextSelected]}>{v} ×</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

export default function InterestsScreen() {
  const { onboardingUser, updateOnboardingUser } = useAppStore();
  
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(onboardingUser?.lifestyle?.hobbies ?? []);
  const [selectedSports, setSelectedSports] = useState<string[]>(onboardingUser?.lifestyle?.sportsHobbies ?? []);
  const [seriesFilms, setSeriesFilms] = useState<string>(onboardingUser?.lifestyle?.seriesFilms ?? '');
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleContinue = () => {
    updateOnboardingUser({ 
      lifestyle: {
        ...onboardingUser?.lifestyle,
        hobbies: selectedHobbies,
        sportsHobbies: selectedSports,
        seriesFilms: seriesFilms.trim() || undefined,
      }
    });

    router.push('./lifestyle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Interests</Text>
          <Text style={styles.subtitle}>
            Tell us what you&apos;re passionate about
          </Text>
          
          <SearchMultiSelect
            title="What are you into? 🎯"
            subtitle="Search or add your own"
            curated={[...HOBBY_CATEGORIES] as string[]}
            placeholder="Search interests..."
            selected={selectedHobbies}
            onChange={setSelectedHobbies}
            testIDPrefix="hobbies"
          />

          <SearchMultiSelect
            title="Sports & hobbies 🏃"
            subtitle="Pick everything that fits"
            curated={SPORTS_HOBBIES}
            placeholder="Search sports..."
            selected={selectedSports}
            onChange={setSelectedSports}
            testIDPrefix="sports"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Series/Films you love 🎬</Text>
            <TextInput
              testID="series-input"
              style={styles.input}
              value={seriesFilms}
              onChangeText={setSeriesFilms}
              placeholder="e.g., The Office, Marvel movies, anime..."
              placeholderTextColor={theme.colors.text.secondary}
              maxLength={120}
            />
          </View>

          <SearchMultiSelect
            title="Nationality 🌍"
            subtitle="You can pick multiple or add your own"
            curated={NATIONALITIES}
            placeholder="Search nationalities..."
            selected={selectedNationalities}
            onChange={setSelectedNationalities}
            testIDPrefix="nationalities"
          />

          <SearchMultiSelect
            title="Languages you speak 🗣️"
            subtitle="Select all that apply"
            curated={LANGUAGES}
            placeholder="Search languages..."
            selected={selectedLanguages}
            onChange={setSelectedLanguages}
            testIDPrefix="languages"
          />

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
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary + '40',
  },
  chipSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary + '33',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  suggestionChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary + '33',
  },
  suggestionText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
});

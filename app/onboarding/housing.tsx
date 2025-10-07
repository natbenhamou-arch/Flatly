import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { Housing } from '@/types';
import { getHousingByUserId, setHousing as saveHousing } from '@/services/data';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';
import { ChevronDown, Calendar } from 'lucide-react-native';

const NEIGHBORHOODS = [
  'Downtown', 'University District', 'Midtown', 'Uptown', 'Old Town',
  'Arts District', 'Financial District', 'Riverside', 'Hillside', 'Suburbs', 'Other'
] as const;

type NeighborhoodOption = typeof NEIGHBORHOODS[number];

export default function HousingScreen() {
  const params = useLocalSearchParams<{ edit?: string }>();
  const isEditMode = params?.edit === '1';
  const { onboardingUser, updateOnboardingUser, currentUser, updateCurrentUser } = useAppStore();
  
  const [hasRoom, setHasRoom] = useState<boolean>(onboardingUser?.hasRoom ?? false);
  const [neighborhood, setNeighborhood] = useState<string>(onboardingUser?.housing?.neighborhood ?? '');
  const [bedrooms, setBedrooms] = useState<string>(onboardingUser?.housing?.bedrooms?.toString() ?? '');
  const [bathrooms, setBathrooms] = useState<string>(onboardingUser?.housing?.bathrooms?.toString() ?? '');
  const [rent, setRent] = useState<string>(onboardingUser?.housing?.rent?.toString() ?? '');
  const [billsIncluded, setBillsIncluded] = useState<boolean>(onboardingUser?.housing?.billsIncluded ?? false);
  const [availableFrom, setAvailableFrom] = useState<string>(onboardingUser?.housing?.availableFrom ?? '');
  const [availableTo, setAvailableTo] = useState<string>(onboardingUser?.housing?.availableTo ?? '');
  const [isOwner, setIsOwner] = useState<boolean>(onboardingUser?.housing?.isOwner ?? false);
  const [rentCurrency, setRentCurrency] = useState<string>(onboardingUser?.housing?.currency ?? DEFAULT_CURRENCY);
  const [showRentCurrencyDropdown, setShowRentCurrencyDropdown] = useState<boolean>(false);
  
  // For room seekers
  const [budgetMin, setBudgetMin] = useState<string>(onboardingUser?.housing?.budgetMin?.toString() ?? '');
  const [budgetMax, setBudgetMax] = useState<string>(onboardingUser?.housing?.budgetMax?.toString() ?? '');
  const [currency, setCurrency] = useState<string>(onboardingUser?.housing?.currency ?? DEFAULT_CURRENCY);
  const [targetNeighborhoods, setTargetNeighborhoods] = useState<string[]>(onboardingUser?.housing?.targetNeighborhoods ?? []);
  const [preferencesText, setPreferencesText] = useState<string>(onboardingUser?.housing?.preferencesText ?? '');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState<boolean>(false);
  const [wantedFrom, setWantedFrom] = useState<string>(onboardingUser?.housing?.wantedFrom ?? '');
  const [wantedTo, setWantedTo] = useState<string>(onboardingUser?.housing?.wantedTo ?? '');
  const [customNeighborhood, setCustomNeighborhood] = useState<string>('');

  useEffect(() => {
    try {
      const initialTargets: string[] = targetNeighborhoods;
      const knownSet = new Set<NeighborhoodOption>(NEIGHBORHOODS);
      const custom = initialTargets.find((n) => !knownSet.has(n as NeighborhoodOption));
      if (custom) {
        if (!customNeighborhood) setCustomNeighborhood(custom);
        if (!initialTargets.includes('Other')) {
          setTargetNeighborhoods((prev) => [...prev, 'Other']);
        }
      }
    } catch (e) {
      console.log('Init custom neighborhood failed', e);
    }
  }, [targetNeighborhoods, customNeighborhood]);

  const toggleNeighborhood = (hood: NeighborhoodOption) => {
    if (targetNeighborhoods.includes(hood)) {
      setTargetNeighborhoods(prev => prev.filter(n => n !== hood));
      if (hood === 'Other') {
        setCustomNeighborhood('');
      }
    } else {
      setTargetNeighborhoods(prev => [...prev, hood]);
    }
  };

  useEffect(() => {
    const loadExisting = async () => {
      try {
        if (isEditMode && currentUser) {
          const existing = await getHousingByUserId(currentUser.id);
          if (existing) {
            setHasRoom(existing.hasRoom);
            setNeighborhood(existing.neighborhood ?? '');
            setBedrooms(existing.bedrooms?.toString() ?? '');
            setBathrooms(existing.bathrooms?.toString() ?? '');
            setRent(existing.rent?.toString() ?? '');
            setBillsIncluded(existing.billsIncluded ?? false);
            setAvailableFrom(existing.availableFrom ?? '');
            setAvailableTo(existing.availableTo ?? '');
            setIsOwner(existing.isOwner ?? false);
            setRentCurrency(existing.currency ?? DEFAULT_CURRENCY);
            setBudgetMin(existing.budgetMin?.toString() ?? '');
            setBudgetMax(existing.budgetMax?.toString() ?? '');
            setCurrency(existing.currency ?? DEFAULT_CURRENCY);
            setTargetNeighborhoods(existing.targetNeighborhoods ?? []);
            setPreferencesText(existing.preferencesText ?? '');
            setWantedFrom(existing.wantedFrom ?? '');
            setWantedTo(existing.wantedTo ?? '');
          }
        }
      } catch (err) {
        console.error('Load housing error', err);
      }
    };
    loadExisting();
  }, [isEditMode, currentUser]);

  const finalTargetNeighborhoods = useMemo(() => {
    try {
      const base = targetNeighborhoods.filter((n) => n !== 'Other');
      const trimmed = customNeighborhood.trim();
      if (targetNeighborhoods.includes('Other') && trimmed.length > 0) {
        return [...base, trimmed];
      }
      return base;
    } catch (e) {
      console.log('Compute finalTargetNeighborhoods error', e);
      return targetNeighborhoods;
    }
  }, [targetNeighborhoods, customNeighborhood]);

  const handleContinue = async () => {
    const housingData: Partial<Housing> = {
      hasRoom,
      ...(hasRoom ? {
        neighborhood,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        rent: rent ? parseFloat(rent) : undefined,
        currency: rentCurrency,
        billsIncluded,
        availableFrom: availableFrom || undefined,
        availableTo: availableTo || undefined,
        isOwner,
      } : {
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        currency,
        targetNeighborhoods: finalTargetNeighborhoods,
        preferencesText: preferencesText || undefined,
        wantedFrom: wantedFrom || undefined,
        wantedTo: wantedTo || undefined,
      })
    };

    if (isEditMode && currentUser) {
      try {
        const payload: Housing = {
          userId: currentUser.id,
          hasRoom: housingData.hasRoom ?? false,
          neighborhood: housingData.neighborhood,
          bedrooms: housingData.bedrooms,
          bathrooms: housingData.bathrooms,
          rent: housingData.rent,
          billsIncluded: housingData.billsIncluded,
          availableFrom: housingData.availableFrom,
          availableTo: housingData.availableTo,
          isOwner: housingData.isOwner,
          budgetMin: housingData.budgetMin,
          budgetMax: housingData.budgetMax,
          currency: housingData.currency ?? DEFAULT_CURRENCY,
          targetNeighborhoods: housingData.targetNeighborhoods ?? [],
          preferencesText: housingData.preferencesText,
          wantedFrom: housingData.wantedFrom,
          wantedTo: housingData.wantedTo,
        };
        console.log('Saving housing payload', JSON.stringify(payload));
        await saveHousing(payload);
        if (currentUser.hasRoom !== hasRoom) {
          updateCurrentUser({ hasRoom });
        }
        Alert.alert('Saved', 'Housing updated');
        router.back();
        return;
      } catch (error) {
        console.error('Save housing error', error);
        Alert.alert('Error', 'Failed to save housing');
        return;
      }
    }

    console.log('Onboarding housing save', JSON.stringify(housingData));
    updateOnboardingUser({ 
      hasRoom,
      housing: housingData 
    });
    
    router.push('./interests');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Housing</Text>
        <Text style={styles.subtitle}>
          Do you have a room to fill or looking for one?
        </Text>
        
        {/* Has Room Toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleOption}>
            <TouchableOpacity 
              style={[styles.toggleButton, !hasRoom && styles.toggleButtonActive]}
              onPress={() => setHasRoom(false)}
            >
              <Text style={[styles.toggleText, !hasRoom && styles.toggleTextActive]}>
                🔍 Looking for a room
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.toggleOption}>
            <TouchableOpacity 
              style={[styles.toggleButton, hasRoom && styles.toggleButtonActive]}
              onPress={() => setHasRoom(true)}
            >
              <Text style={[styles.toggleText, hasRoom && styles.toggleTextActive]}>
                🏠 I have a room to fill
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {hasRoom ? (
          // Room Owner Section
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Neighborhood</Text>
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="e.g., University District"
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Bedrooms</Text>
                <TextInput
                  style={styles.input}
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  placeholder="2"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Bathrooms</Text>
                <TextInput
                  style={styles.input}
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  placeholder="1.5"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monthly Rent (optional)</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2, marginRight: 8, marginBottom: 0 }]}>
                  <TextInput
                    style={styles.input}
                    value={rent}
                    onChangeText={setRent}
                    placeholder="800"
                    keyboardType="numeric"
                    placeholderTextColor={theme.colors.text.secondary}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: 0 }]}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowRentCurrencyDropdown(!showRentCurrencyDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {CURRENCIES.find(c => c.code === rentCurrency)?.code || rentCurrency}
                    </Text>
                    <ChevronDown size={16} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {showRentCurrencyDropdown && (
                <ScrollView style={styles.dropdown} nestedScrollEnabled>
                  {CURRENCIES.map((curr) => (
                    <TouchableOpacity
                      key={curr.code}
                      style={[
                        styles.dropdownItem,
                        rentCurrency === curr.code && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        setRentCurrency(curr.code);
                        setShowRentCurrencyDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        rentCurrency === curr.code && styles.dropdownItemTextSelected
                      ]}>
                        {curr.code} - {curr.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Bills included in rent</Text>
              <Switch
                value={billsIncluded}
                onValueChange={setBillsIncluded}
                trackColor={{ false: theme.colors.text.secondary + '40', true: theme.colors.primary + '80' }}
                thumbColor={billsIncluded ? theme.colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>I am the owner/landlord</Text>
              <Switch
                value={isOwner}
                onValueChange={setIsOwner}
                trackColor={{ false: theme.colors.text.secondary + '40', true: theme.colors.primary + '80' }}
                thumbColor={isOwner ? theme.colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available from (optional)</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color={theme.colors.text.secondary} style={styles.dateIcon} />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={availableFrom}
                  onChangeText={setAvailableFrom}
                  placeholder="September 1, 2024"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available until (optional)</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color={theme.colors.text.secondary} style={styles.dateIcon} />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={availableTo}
                  onChangeText={setAvailableTo}
                  placeholder="August 31, 2025 or leave empty for indefinite"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>
            </View>
          </View>
        ) : (
          // Room Seeker Section
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget & Preferences</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Min Budget</Text>
                <TextInput
                  style={styles.input}
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  placeholder="500"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Max Budget</Text>
                <TextInput
                  style={styles.input}
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  placeholder="1200"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Currency</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {CURRENCIES.find(c => c.code === currency)?.code || currency} - {CURRENCIES.find(c => c.code === currency)?.name || 'Unknown'}
                </Text>
                <ChevronDown size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
              
              {showCurrencyDropdown && (
                <ScrollView style={styles.dropdown} nestedScrollEnabled>
                  {CURRENCIES.map((curr) => (
                    <TouchableOpacity
                      key={curr.code}
                      style={[
                        styles.dropdownItem,
                        currency === curr.code && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        setCurrency(curr.code);
                        setShowCurrencyDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        currency === curr.code && styles.dropdownItemTextSelected
                      ]}>
                        {curr.code} - {curr.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label} testID="preferred-neighborhoods-label">Preferred Neighborhoods</Text>
              <View style={styles.chipContainer}>
                {NEIGHBORHOODS.map((hood) => (
                  <TouchableOpacity
                    testID={`chip-${hood}`}
                    key={hood}
                    style={[
                      styles.chip,
                      targetNeighborhoods.includes(hood) && styles.chipSelected
                    ]}
                    onPress={() => toggleNeighborhood(hood)}
                  >
                    <Text
                    style={[
                      styles.chipText,
                      targetNeighborhoods.includes(hood) && styles.chipTextSelected,
                    ]}
                    accessibilityLabel={`Neighborhood ${hood}`}
                  >
                    {hood}
                  </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {targetNeighborhoods.includes('Other') && (
                <View style={styles.customNeighborhoodContainer}>
                  <TextInput
                    testID="custom-neighborhood-input"
                    style={styles.input}
                    value={customNeighborhood}
                    onChangeText={setCustomNeighborhood}
                    placeholder="Enter neighborhood name"
                    placeholderTextColor={theme.colors.text.secondary}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>When do you need the room? (optional)</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: 0 }]}>
                  <Text style={[styles.label, { fontSize: 14, marginBottom: 4 }]}>From</Text>
                  <View style={styles.dateInputContainer}>
                    <Calendar size={16} color={theme.colors.text.secondary} style={styles.dateIcon} />
                    <TextInput
                      style={[styles.input, styles.dateInput]}
                      value={wantedFrom}
                      onChangeText={setWantedFrom}
                      placeholder="Sept 1, 2024"
                      placeholderTextColor={theme.colors.text.secondary}
                    />
                  </View>
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: 0 }]}>
                  <Text style={[styles.label, { fontSize: 14, marginBottom: 4 }]}>Until</Text>
                  <View style={styles.dateInputContainer}>
                    <Calendar size={16} color={theme.colors.text.secondary} style={styles.dateIcon} />
                    <TextInput
                      style={[styles.input, styles.dateInput]}
                      value={wantedTo}
                      onChangeText={setWantedTo}
                      placeholder="Aug 31, 2025"
                      placeholderTextColor={theme.colors.text.secondary}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Preferences (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={preferencesText}
                onChangeText={setPreferencesText}
                placeholder="Any specific requirements or preferences..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>{isEditMode ? 'Save' : 'Continue'}</Text>
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
  keyboardView: {
    flex: 1,
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
  toggleContainer: {
    marginBottom: 32,
    gap: 12,
  },
  toggleOption: {
    width: '100%',
  },
  toggleButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.card,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  toggleTextActive: {
    color: theme.colors.primary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 20,
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
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 20,
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
  dropdownButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.input,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    flex: 1,
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    marginTop: 4,
    ...theme.shadows.card,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  dropdownItemText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  dropdownItemTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  dateIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  dateInput: {
    paddingLeft: 48,
  },
  customNeighborhoodContainer: {
    marginTop: 12,
  },
});
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { searchUniversities, getNeighborhoods, findUniversityByName } from '@/mocks/universities';
import { University } from '@/types';
import { useAppStore } from '@/store/app-store';
import { LinearGradient } from 'expo-linear-gradient';


export default function SchoolCityScreen() {
  const { onboardingUser, updateOnboardingUser } = useAppStore();
  const [universityQuery, setUniversityQuery] = useState<string>(onboardingUser?.university || '');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(
    onboardingUser?.university ? findUniversityByName(onboardingUser.university) : null
  );
  const [showUniversityDropdown, setShowUniversityDropdown] = useState<boolean>(false);
  const [cityQuery, setCityQuery] = useState<string>('');
  const [city, setCity] = useState<string>(onboardingUser?.city || '');
  const [country, setCountry] = useState<string>(onboardingUser?.country || '');
  const [cityResults, setCityResults] = useState<{ id: string; name: string; country: string; lat: number; lng: number }[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [top500Only, setTop500Only] = useState<boolean>(false);
  const [job, setJob] = useState<string>(onboardingUser?.job || '');

  const universityResults = useMemo(() => {
    if (!universityQuery || universityQuery.length < 2) return [] as University[];
    return searchUniversities(universityQuery, { top500Only });
  }, [universityQuery, top500Only]);

  const availableNeighborhoods = useMemo(() => {
    return getNeighborhoods(city);
  }, [city]);

  const handleUniversitySelect = (university: University) => {
    if (!university?.name?.trim() || university.name.length > 200) {
      return;
    }
    setSelectedUniversity(university);
    setUniversityQuery(university.name.trim());
    setShowUniversityDropdown(false);
    if (!city && university.city?.trim()) {
      setCity(university.city.trim());
      setCityQuery(university.city.trim());
      // Auto-fetch city details to get country and coordinates
      fetchCities(university.city.trim());
    }
  };

  const fetchCities = useCallback(async (q: string) => {
    try {
      setLoadingCities(true);
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&accept-language=en&q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json', 'Accept-Language': 'en', 'User-Agent': 'Flatly/1.0 (demo)' }
      });
      const data = await resp.json();
      const mapped = (data as any[]).map((item, idx) => {
        const name: string = item.display_name?.split(',')[0] ?? item.address?.city ?? item.address?.town ?? item.address?.village ?? item.address?.state ?? '';
        const countryName: string = item.address?.country ?? '';
        return {
          id: `${item.place_id ?? idx}`,
          name,
          country: countryName,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      }).filter(c => c.name && c.country);
      setCityResults(mapped);
    } catch {
      setCityResults([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const handleCitySelect = (c: { id: string; name: string; country: string; lat: number; lng: number }) => {
    setCity(c.name);
    setCountry(c.country);
    setCityQuery(`${c.name}, ${c.country}`);
    setCityResults([]);
    updateOnboardingUser({ city: c.name, country: c.country, geo: { lat: c.lat, lng: c.lng } });
  };

  const handleNeighborhoodToggle = (neighborhood: string) => {
    if (!neighborhood?.trim() || neighborhood.length > 100) {
      return;
    }
    const sanitizedNeighborhood = neighborhood.trim();
    setSelectedNeighborhoods(prev => {
      if (prev.includes(sanitizedNeighborhood)) {
        return prev.filter(n => n !== sanitizedNeighborhood);
      } else {
        return [...prev, sanitizedNeighborhood];
      }
    });
  };

  const handleContinue = () => {
    // If university is selected but no city, use university city
    let finalCity = city.trim();
    let finalCountry = country.trim();
    
    if (!finalCity && selectedUniversity?.city) {
      finalCity = selectedUniversity.city.trim();
      finalCountry = (selectedUniversity.country?.trim() ?? finalCountry) || 'Unknown';
    }
    
    if (!finalCity) {
      alert('Please select a city to continue.');
      return;
    }
    
    updateOnboardingUser({
      university: selectedUniversity?.name || '',
      city: finalCity,
      country: finalCountry,
      job: job.trim(),
    });
    router.push('./housing');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>School & City</Text>
        <Text style={styles.subtitle}>
          We&apos;ll match you with students from your area
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>University (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search for your university..."
              value={universityQuery}
              onChangeText={(text) => {
                setUniversityQuery(text);
                setSelectedUniversity(null);
                setShowUniversityDropdown(text.length >= 2);
              }}
              onFocus={() => setShowUniversityDropdown(universityQuery.length >= 2)}
              placeholderTextColor={theme.colors.text.secondary}
              testID="input-university"
            />
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              accessibilityRole="button"
              testID="toggle-top500"
              onPress={() => setTop500Only(v => !v)}
              style={[styles.toggle, top500Only && styles.toggleOn]}
            >
              <View style={[styles.toggleKnob, top500Only && styles.toggleKnobOn]} />
              <Text style={styles.toggleLabel}>Top-500 only</Text>
            </TouchableOpacity>
          </View>
          {showUniversityDropdown && universityResults.length > 0 && (
            <View style={styles.dropdownRelative}>
              <FlatList
                data={universityResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleUniversitySelect(item)}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                    <Text style={styles.dropdownItemSubtext}>{item.city} • {item.country}</Text>
                  </TouchableOpacity>
                )}
                style={styles.dropdownList}
                nestedScrollEnabled
              />
            </View>
          )}
          {selectedUniversity && (
            <View style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>✓ {selectedUniversity.name}</Text>
              <Text style={styles.selectedItemSubtext}>{selectedUniversity.city} • {selectedUniversity.country}</Text>
            </View>
          )}
        </View>

        {/* Show city input if no city is set */}
        {!city && (
          <View style={styles.section}>
            <Text style={styles.label}>City *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search any city worldwide (e.g., Paris, Tokyo)"
                value={cityQuery}
                onChangeText={(text) => {
                  setCityQuery(text);
                  if (text.trim().length >= 2) {
                    fetchCities(text.trim());
                  } else {
                    setCityResults([]);
                  }
                }}
                placeholderTextColor={theme.colors.text.secondary}
                autoCorrect={false}
                autoCapitalize="words"
                testID="input-city"
              />
            </View>
            {loadingCities && (
              <ActivityIndicator style={styles.loadingIndicator} color={theme.colors.primary} />
            )}
            {cityResults.length > 0 && (
              <View style={styles.dropdownRelative}>
                <FlatList
                  data={cityResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleCitySelect(item)}>
                      <Text style={styles.dropdownItemText}>{item.name}</Text>
                      <Text style={styles.dropdownItemSubtext}>{item.country}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.dropdownList}
                  nestedScrollEnabled
                />
              </View>
            )}
          </View>
        )}
        
        {/* Show confirmed city if set */}
        {city && (
          <View style={styles.section}>
            <Text style={styles.label}>Confirmed City</Text>
            <View style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>✓ {city}</Text>
              <Text style={styles.selectedItemSubtext}>{country}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Job / Occupation</Text>
          <Text style={styles.helperText}>
            What do you do? (e.g., Student, Software Engineer, Marketing Intern)
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your job or occupation..."
              value={job}
              onChangeText={setJob}
              placeholderTextColor={theme.colors.text.secondary}
              autoCorrect={false}
              autoCapitalize="words"
              testID="input-job"
            />
          </View>
        </View>

        {availableNeighborhoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Preferred Neighborhoods</Text>
            <Text style={styles.helperText}>
              Select areas you&apos;d like to live in (optional)
            </Text>
            <View style={styles.chipContainer}>
              {availableNeighborhoods.map((neighborhood) => (
                <TouchableOpacity
                  key={neighborhood}
                  style={[
                    styles.chip,
                    selectedNeighborhoods.includes(neighborhood.trim()) && styles.chipSelected
                  ]}
                  onPress={() => handleNeighborhoodToggle(neighborhood)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedNeighborhoods.includes(neighborhood.trim()) && styles.chipTextSelected
                  ]}>
                    {neighborhood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <LinearGradient
          colors={['#74b9ff', '#0984e3']}
          style={styles.infoBox}
        >
          <Text style={styles.infoText}>
            💡 We only show you potential roommates from the same city for safety.
          </Text>
        </LinearGradient>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!city.trim() && !selectedUniversity?.city) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!city.trim() && !selectedUniversity?.city}
          testID="button-continue"
        >
          <Text style={[
            styles.continueButtonText,
            (!city.trim() && !selectedUniversity?.city) && styles.continueButtonTextDisabled
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: 'white',
    ...theme.shadows.input,
  },
  dropdownRelative: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius,
    marginTop: 8,
    marginBottom: 16,
    maxHeight: 240,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.card,
  },
  toggleRow: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  toggleOn: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  toggleKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.border,
  },
  toggleKnobOn: {
    backgroundColor: theme.colors.primary,
  },
  toggleLabel: {
    color: theme.colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownList: {
    maxHeight: 240,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '40',
  },
  dropdownItemText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dropdownItemSubtext: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  selectedItem: {
    marginTop: 8,
    padding: 12,
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  selectedItemText: {
    fontSize: 16,
    color: theme.colors.success,
    fontWeight: '600',
  },
  selectedItemSubtext: {
    fontSize: 14,
    color: theme.colors.success,
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
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
  infoBox: {
    borderRadius: theme.borderRadius,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.button,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.text.secondary + '40',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  continueButtonTextDisabled: {
    color: theme.colors.text.secondary,
  },
  loadingIndicator: {
    marginTop: 8,
  },
});
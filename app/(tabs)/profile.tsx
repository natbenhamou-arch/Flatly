import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Modal
} from 'react-native';
import { Edit3, MapPin, DollarSign, Calendar, Home, Plus, X, Sparkles, Clock, Heart, Coffee, Music, Book, Gamepad2, Camera, Palette, Dumbbell, Plane, PauseCircle, ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/store/app-store';
import { ClayCard } from '@/components/ClayCard';
import { ClayButton } from '@/components/ClayButton';
import { colors, spacing, radius } from '@/constants/theme';
import { generateBio } from '@/services/ai';
import { updateUser, getLifestyleByUserId, getHousingByUserId, getPreferencesByUserId } from '@/services/data';
import { displayName } from '@/utils/format';
import { exportMyData, deleteMyData } from '@/services/gdpr';
import { Lifestyle, Housing, Preferences } from '@/types';
import { useToast } from '@/components/Toast';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
];

export default function ProfileScreen() {
  const { currentUser, updateCurrentUser, signOut, refreshFeed } = useAppStore();
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [isEditingPhotos, setIsEditingPhotos] = useState<boolean>(false);
  const [editedBio, setEditedBio] = useState<string>(currentUser?.shortBio || '');
  const [editedPhotos, setEditedPhotos] = useState<string[]>(currentUser?.photos || []);
  const [isGeneratingBio, setIsGeneratingBio] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { showToast } = useToast();
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [showMatchMessageModal, setShowMatchMessageModal] = useState<boolean>(false);
  const [editedMatchMessage, setEditedMatchMessage] = useState<string>(currentUser?.autoMatchMessage || 'Hi! Nice to meet you 👋');
  const [sendAutoMessage, setSendAutoMessage] = useState<boolean>(currentUser?.sendAutoMatchMessage !== false);
  
  // Onboarding data state
  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(null);
  const [housing, setHousing] = useState<Housing | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  
  // Secret gesture state
  const tapCount = useRef<number>(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load onboarding data
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!currentUser) return;
      
      setIsLoadingData(true);
      try {
        const [lifestyleData, housingData, preferencesData] = await Promise.all([
          getLifestyleByUserId(currentUser.id),
          getHousingByUserId(currentUser.id),
          getPreferencesByUserId(currentUser.id)
        ]);
        
        setLifestyle(lifestyleData);
        setHousing(housingData);
        setPreferences(preferencesData);
      } catch (error) {
        console.error('Failed to load onboarding data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadOnboardingData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptySubtitle}>Please complete onboarding first.</Text>
        </View>
      </View>
    );
  }

  const age = currentUser.age || new Date().getFullYear() - new Date(currentUser.birthdate).getFullYear();

  // Helper function to get hobby icon
  const getHobbyIcon = (hobby: string) => {
    const hobbyLower = hobby.toLowerCase();
    if (hobbyLower.includes('music')) return Music;
    if (hobbyLower.includes('read') || hobbyLower.includes('book')) return Book;
    if (hobbyLower.includes('game') || hobbyLower.includes('gaming')) return Gamepad2;
    if (hobbyLower.includes('photo')) return Camera;
    if (hobbyLower.includes('art') || hobbyLower.includes('paint') || hobbyLower.includes('draw')) return Palette;
    if (hobbyLower.includes('gym') || hobbyLower.includes('fitness') || hobbyLower.includes('workout')) return Dumbbell;
    if (hobbyLower.includes('travel')) return Plane;
    if (hobbyLower.includes('coffee')) return Coffee;
    return Heart; // Default icon
  };

  // Helper function to format cleanliness level
  const formatCleanliness = (level: string) => {
    switch (level) {
      case 'chill': return '😌 Chill';
      case 'avg': return '🧹 Average';
      case 'meticulous': return '✨ Meticulous';
      default: return level;
    }
  };

  // Helper function to format sleep schedule
  const formatSleep = (schedule: string) => {
    switch (schedule) {
      case 'early': return '🌅 Early bird';
      case 'flex': return '🔄 Flexible';
      case 'night': return '🦉 Night owl';
      default: return schedule;
    }
  };

  // Helper function to format guest frequency
  const formatGuests = (frequency: string) => {
    switch (frequency) {
      case 'never': return '🚫 Never';
      case 'sometimes': return '👥 Sometimes';
      case 'often': return '🎉 Often';
      default: return frequency;
    }
  };

  // Helper function to format noise tolerance
  const formatNoise = (tolerance: string) => {
    switch (tolerance) {
      case 'low': return '🤫 Low';
      case 'med': return '🔊 Medium';
      case 'high': return '🎵 High';
      default: return tolerance;
    }
  };

  const addPhoto = () => {
    if (editedPhotos.length >= 6) {
      Alert.alert('Maximum Photos', 'You can add up to 6 photos.');
      return;
    }

    // For demo purposes, add a random placeholder image
    const availableImages = PLACEHOLDER_IMAGES.filter(img => !editedPhotos.includes(img));
    if (availableImages.length > 0) {
      const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
      setEditedPhotos([...editedPhotos, randomImage]);
    } else {
      Alert.alert('Demo Mode', 'In a real app, this would open your photo library.');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = editedPhotos.filter((_, i) => i !== index);
    setEditedPhotos(newPhotos);
  };

  const setPrimaryPhoto = (index: number) => {
    // Move selected photo to front
    const newPhotos = [...editedPhotos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    setEditedPhotos(newPhotos);
  };

  const generateAIBio = async () => {
    if (!currentUser) return;
    
    setIsGeneratingBio(true);
    try {
      const [lifestyle, housing, preferences] = await Promise.all([
        getLifestyleByUserId(currentUser.id),
        getHousingByUserId(currentUser.id),
        getPreferencesByUserId(currentUser.id)
      ]);

      const generatedBio = await generateBio({
        user: currentUser,
        lifestyle: lifestyle || undefined,
        housing: housing || undefined,
        preferences: preferences || undefined
      });
      setEditedBio(generatedBio);
    } catch (error) {
      console.error('Failed to generate bio:', error);
      Alert.alert('Error', 'Failed to generate bio. Please try again.');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const saveBio = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      const updatedUser = await updateUser(currentUser.id, {
        shortBio: editedBio.trim()
      });
      
      if (updatedUser) {
        updateCurrentUser(updatedUser);
        try { await refreshFeed(); } catch (e) { console.log('Feed refresh after bio update failed', e); }
        setIsEditingBio(false);
        showToast('Profile saved', 'success');
      }
    } catch (error) {
      console.error('Failed to save bio:', error);
      Alert.alert('Error', 'Failed to save bio. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const savePhotos = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      const updatedUser = await updateUser(currentUser.id, {
        photos: editedPhotos
      });
      
      if (updatedUser) {
        updateCurrentUser(updatedUser);
        try { await refreshFeed(); } catch (e) { console.log('Feed refresh after photo update failed', e); }
        setIsEditingPhotos(false);
        showToast('Photos updated', 'success');
      }
    } catch (error) {
      console.error('Failed to save photos:', error);
      Alert.alert('Error', 'Failed to save photos. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelBioEdit = () => {
    setEditedBio(currentUser.shortBio || '');
    setIsEditingBio(false);
  };

  const cancelPhotoEdit = () => {
    setEditedPhotos(currentUser.photos || []);
    setIsEditingPhotos(false);
  };

  const handleSecretTap = () => {
    tapCount.current += 1;
    
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }
    
    if (tapCount.current >= 7) {
      tapCount.current = 0;
      router.push('/admin');
      return;
    }
    
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 5000) as ReturnType<typeof setTimeout>;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ClayCard style={styles.headerCard}>
          {isEditingPhotos ? (
            <View style={styles.editPhotosContainer}>
              <Text style={styles.sectionTitle}>Edit Photos ({editedPhotos.length}/6)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                {editedPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={`edit-photo-${index}`}
                    style={[
                      styles.editPhoto,
                      index === 0 && styles.primaryEditPhoto
                    ]}
                    onPress={() => setPrimaryPhoto(index)}
                  >
                    <Image source={{ uri: photo }} style={styles.editPhotoImage} />
                    {index === 0 && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <X size={14} color="white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
                
                {editedPhotos.length < 6 && (
                  <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
                    <Plus size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </ScrollView>
              
              <View style={styles.editActions}>
                <ClayButton
                  title="Cancel"
                  onPress={cancelPhotoEdit}
                  variant="secondary"
                  size="small"
                />
                <ClayButton
                  title={isSaving ? 'Saving...' : 'Save'}
                  onPress={savePhotos}
                  variant="primary"
                  size="small"
                  disabled={isSaving}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.photoContainer}>
                <TouchableOpacity onPress={handleSecretTap}>
                  {currentUser.photos && currentUser.photos.length > 0 ? (
                    <Image source={{ uri: currentUser.photos[0] }} style={styles.profilePhoto} />
                  ) : (
                    <View style={[styles.profilePhoto, styles.placeholderPhoto]}>
                      <Text style={styles.placeholderText}>No Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <ClayButton
                  title=""
                  onPress={() => {
                    setEditedPhotos(currentUser.photos || []);
                    setIsEditingPhotos(true);
                  }}
                  variant="secondary"
                  size="small"
                  style={styles.editPhotoButton}
                >
                  <Edit3 color={colors.textPrimary} size={16} />
                </ClayButton>
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{displayName(currentUser.firstName, currentUser.lastName)}, {age} {currentUser.paused ? '🧘' : ''}</Text>
                <Text style={styles.school}>{currentUser.university}</Text>
                {currentUser.city && (
                  <Text style={styles.program}>{currentUser.city}</Text>
                )}
              </View>
            </>
          )}
        </ClayCard>

        {/* Bio Section */}
        <ClayCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About Me</Text>
            {!isEditingBio ? (
              <ClayButton
                title="Edit"
                onPress={() => {
                  setEditedBio(currentUser.shortBio || '');
                  setIsEditingBio(true);
                }}
                variant="secondary"
                size="small"
              />
            ) : (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateAIBio}
                disabled={isGeneratingBio}
              >
                <Sparkles size={14} color={colors.lavender} />
                <Text style={styles.generateButtonText}>
                  {isGeneratingBio ? 'Generating...' : 'AI Generate'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isEditingBio ? (
            <View>
              <TextInput
                style={styles.bioInput}
                placeholder="Tell potential roommates about yourself!"
                placeholderTextColor={colors.textSecondary}
                value={editedBio}
                onChangeText={setEditedBio}
                multiline
                maxLength={240}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{editedBio.length}/240</Text>
              
              <View style={styles.editActions}>
                <ClayButton
                  title="Cancel"
                  onPress={cancelBioEdit}
                  variant="secondary"
                  size="small"
                />
                <ClayButton
                  title={isSaving ? 'Saving...' : 'Save'}
                  onPress={saveBio}
                  variant="primary"
                  size="small"
                  disabled={isSaving || editedBio.trim().length === 0}
                />
              </View>
            </View>
          ) : (
            <Text style={styles.bio}>
              {currentUser.shortBio || 'No bio added yet. Tap Edit to add one!'}
            </Text>
          )}
        </ClayCard>

        {/* Lifestyle Section */}
        {lifestyle && (
          <ClayCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lifestyle</Text>
              <ClayButton
                title="Edit"
                onPress={() => router.push('/onboarding/lifestyle?edit=1')}
                variant="secondary"
                size="small"
              />
            </View>
            
            {/* Hobbies */}
            {lifestyle.hobbies && lifestyle.hobbies.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Interests</Text>
                <View style={styles.chipsContainer}>
                  {lifestyle.hobbies.map((hobby, index) => {
                    const IconComponent = getHobbyIcon(hobby);
                    return (
                      <View key={`hobby-${index}`} style={styles.chip}>
                        <IconComponent size={14} color={colors.textPrimary} />
                        <Text style={styles.chipText}>{hobby}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Sports & Hobbies */}
            {lifestyle.sportsHobbies && lifestyle.sportsHobbies.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Sports & hobbies</Text>
                <View style={styles.chipsContainer}>
                  {lifestyle.sportsHobbies.map((item, index) => (
                    <View key={`sport-${index}`} style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Living Preferences */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Living Preferences</Text>
              <View style={styles.preferencesGrid}>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Cleanliness</Text>
                  <Text style={styles.preferenceValue}>{formatCleanliness(lifestyle.cleanliness)}</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Sleep Schedule</Text>
                  <Text style={styles.preferenceValue}>{formatSleep(lifestyle.sleep)}</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Guests</Text>
                  <Text style={styles.preferenceValue}>{formatGuests(lifestyle.guests)}</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Noise Tolerance</Text>
                  <Text style={styles.preferenceValue}>{formatNoise(lifestyle.noise)}</Text>
                </View>
              </View>
              
              {/* Additional preferences */}
              <View style={styles.additionalPrefs}>
                <View style={styles.prefRow}>
                  <Text style={styles.prefLabel}>🚬 Smoker:</Text>
                  <Text style={styles.prefValue}>{lifestyle.smoker ? 'Yes' : 'No'}</Text>
                </View>
                <View style={styles.prefRow}>
                  <Text style={styles.prefLabel}>🐕 Pet-friendly:</Text>
                  <Text style={styles.prefValue}>{lifestyle.petsOk ? 'Yes' : 'No'}</Text>
                </View>
                {lifestyle.religion && lifestyle.showReligion && (
                  <View style={styles.prefRow}>
                    <Text style={styles.prefLabel}>🙏 Religion:</Text>
                    <Text style={styles.prefValue}>{lifestyle.religion}</Text>
                  </View>
                )}
                {lifestyle.politicalView && (
                  <View style={styles.prefRow}>
                    <Text style={styles.prefLabel}>🗳 Political:</Text>
                    <Text style={styles.prefValue}>{lifestyle.politicalView}</Text>
                  </View>
                )}
                {lifestyle.religiousChoice && (
                  <View style={styles.prefRow}>
                    <Text style={styles.prefLabel}>🙏 Religious:</Text>
                    <Text style={styles.prefValue}>{lifestyle.religiousChoice}</Text>
                  </View>
                )}
                {lifestyle.moneyStyle && (
                  <View style={styles.prefRow}>
                    <Text style={styles.prefLabel}>💸 Money style:</Text>
                    <Text style={styles.prefValue}>{lifestyle.moneyStyle}</Text>
                  </View>
                )}
                {lifestyle.foodPreference && (
                  <View style={styles.prefRow}>
                    <Text style={styles.prefLabel}>🍽 Food:</Text>
                    <Text style={styles.prefValue}>{lifestyle.foodPreference === 'other' ? (lifestyle.foodOther || 'Other') : lifestyle.foodPreference}</Text>
                  </View>
                )}
                {lifestyle.seriesFilms && (
                  <View style={styles.prefRow}>
                    <Text style={styles.prefLabel}>🎬 Series/Films:</Text>
                    <Text style={styles.prefValue}>{lifestyle.seriesFilms}</Text>
                  </View>
                )}
              </View>
            </View>
          </ClayCard>
        )}

        {/* Badges Section - Show badges if available */}
        {currentUser.badges && currentUser.badges.length > 0 && (
          <ClayCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Badges</Text>
            </View>
            <View style={styles.chipsContainer}>
              {currentUser.badges.map((badge, index) => (
                <View key={`badge-${index}`} style={styles.chip}>
                  <Text style={styles.chipText}>{badge}</Text>
                </View>
              ))}
            </View>
          </ClayCard>
        )}

        {/* Housing Info */}
        <ClayCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Housing Details</Text>
            <ClayButton
              title="Edit"
              onPress={() => router.push('/onboarding/housing?edit=1')}
              variant="secondary"
              size="small"
            />
          </View>
          
          <View style={styles.infoRow}>
            <MapPin color={colors.textSecondary} size={20} />
            <Text style={styles.infoText}>{currentUser.city}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Home color={colors.textSecondary} size={20} />
            <Text style={styles.infoText}>
              {currentUser.hasRoom ? 'I have a room to share' : 'Looking for a room'}
            </Text>
          </View>
          
          {/* Detailed Housing Information */}
          {housing && (
            <View style={styles.housingDetails}>
              {housing.hasRoom ? (
                // Room owner details
                <View>
                  {housing.neighborhood && (
                    <View style={styles.infoRow}>
                      <MapPin color={colors.textSecondary} size={16} />
                      <Text style={styles.infoText}>{housing.neighborhood}</Text>
                    </View>
                  )}
                  {housing.bedrooms && housing.bathrooms && (
                    <View style={styles.infoRow}>
                      <Home color={colors.textSecondary} size={16} />
                      <Text style={styles.infoText}>
                        {housing.bedrooms} bed, {housing.bathrooms} bath
                      </Text>
                    </View>
                  )}
                  {housing.rent && (
                    <View style={styles.infoRow}>
                      <DollarSign color={colors.textSecondary} size={16} />
                      <Text style={styles.infoText}>
                        ${housing.rent}/month {housing.billsIncluded ? '(bills included)' : '(bills not included)'}
                      </Text>
                    </View>
                  )}
                  {housing.availableFrom && (
                    <View style={styles.infoRow}>
                      <Calendar color={colors.textSecondary} size={16} />
                      <Text style={styles.infoText}>
                        Available from {housing.availableFrom}
                        {housing.availableTo ? ` until ${housing.availableTo}` : ''}
                      </Text>
                    </View>
                  )}
                  {housing.isOwner && (
                    <View style={styles.infoRow}>
                      <Home color={colors.textSecondary} size={16} />
                      <Text style={styles.infoText}>Property owner</Text>
                    </View>
                  )}
                </View>
              ) : (
                // Room seeker details
                <View>
                  {(housing.budgetMin || housing.budgetMax) && (
                    <View style={styles.infoRow}>
                      <DollarSign color={colors.textSecondary} size={16} />
                      <Text style={styles.infoText}>
                        Budget: ${housing.budgetMin || 0} - ${housing.budgetMax || 'unlimited'}/month
                      </Text>
                    </View>
                  )}
                  {housing.targetNeighborhoods && housing.targetNeighborhoods.length > 0 && (
                    <View style={styles.subsection}>
                      <Text style={styles.subsectionTitle}>Preferred Neighborhoods</Text>
                      <View style={styles.chipsContainer}>
                        {housing.targetNeighborhoods.map((neighborhood, index) => (
                          <View key={`neighborhood-${index}`} style={styles.chip}>
                            <Text style={styles.chipText}>{neighborhood}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {(housing.wantedFrom || housing.wantedTo) && (
                    <View style={styles.infoRow}>
                      <Calendar color={colors.textSecondary} size={16} />
                      <Text style={styles.infoText}>
                        Looking for: {housing.wantedFrom || 'ASAP'}
                        {housing.wantedTo ? ` - ${housing.wantedTo}` : ''}
                      </Text>
                    </View>
                  )}
                  {housing.preferencesText && (
                    <View style={styles.subsection}>
                      <Text style={styles.subsectionTitle}>Additional Preferences</Text>
                      <Text style={styles.bio}>{housing.preferencesText}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ClayCard>

        {/* Matching Preferences */}
        {preferences && (
          <ClayCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Matching Preferences</Text>
              <ClayButton
                title="Edit"
                onPress={() => router.push('/onboarding/preferences?edit=1')}
                variant="secondary"
                size="small"
              />
            </View>
            
            <View style={styles.preferencesGrid}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Age Range</Text>
                <Text style={styles.preferenceValue}>{preferences.ageMin} - {preferences.ageMax} years</Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Max Distance</Text>
                <Text style={styles.preferenceValue}>{preferences.maxDistanceKm} km</Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Looking For</Text>
                <Text style={styles.preferenceValue}>
                  {preferences.lookingFor === 'either' ? 'Room or Roommate' : 
                   preferences.lookingFor === 'room' ? 'Room' : 'Roommate'}
                </Text>
              </View>
            </View>
            
            {/* Deal-breakers */}
            {preferences.dealbreakers && preferences.dealbreakers.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Deal-breakers</Text>
                <View style={styles.chipsContainer}>
                  {preferences.dealbreakers.map((item, index) => (
                    <View key={`dealbreaker-${index}`} style={[styles.chip, styles.dealbreakerChip]}>
                      <Text style={[styles.chipText, styles.dealbreakerText]}>❌ {item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Must-haves */}
            {preferences.mustHaves && preferences.mustHaves.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Must-haves</Text>
                <View style={styles.chipsContainer}>
                  {preferences.mustHaves.map((item, index) => (
                    <View key={`musthave-${index}`} style={[styles.chip, styles.mustHaveChip]}>
                      <Text style={[styles.chipText, styles.mustHaveText]}>✅ {item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ClayCard>
        )}

        {/* Availability Section */}
        <ClayCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Viewing Availability</Text>
            <ClayButton
              title="Set Times"
              onPress={() => router.push('/availability')}
              variant="secondary"
              size="small"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => router.push('/availability')}
          >
            <Clock color={colors.textSecondary} size={20} />
            <Text style={styles.infoText}>
              Set your availability for apartment viewings
            </Text>
          </TouchableOpacity>
        </ClayCard>

        {/* Account Section */}
        <ClayCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          {/* Pause Profile */}
          <View style={styles.pauseRow}>
            <View style={styles.pauseInfo}>
              <PauseCircle size={18} color={colors.textPrimary} />
              <Text style={styles.pauseTitle}>Pause profile {currentUser.paused ? '🧘' : ''}</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="switch"
              accessibilityState={{ checked: !!currentUser.paused }}
              testID="pause-profile-toggle"
              onPress={async () => {
                if (!currentUser) return;
                try {
                  const updated = await updateUser(currentUser.id, { paused: !currentUser.paused });
                  if (updated) {
                    updateCurrentUser(updated);
                    try { await refreshFeed(); } catch (e) { console.log('Feed refresh after pause toggle failed', e); }
                    showToast(updated.paused ? 'Profile paused' : 'Profile visible again', 'success');
                  }
                } catch (e) {
                  console.error('Pause toggle failed', e);
                  Alert.alert('Error', 'Could not update pause setting.');
                }
              }}
              style={[styles.pauseSwitch, currentUser.paused ? styles.pauseSwitchOn : styles.pauseSwitchOff]}
            >
              <View style={[styles.knob, currentUser.paused ? styles.knobOn : styles.knobOff]} />
            </TouchableOpacity>
          </View>

          {/* Verify Profile */}
          <TouchableOpacity 
            style={styles.verifyRow}
            onPress={() => setShowVerifyModal(true)}
            testID="verify-profile-button"
          >
            <View style={styles.verifyInfo}>
              <ShieldCheck size={18} color={colors.lavender} />
              <Text style={styles.verifyTitle}>Verify My Profile</Text>
            </View>
            <Text style={styles.verifyArrow}>›</Text>
          </TouchableOpacity>

          {/* Match Message Settings */}
          <TouchableOpacity 
            style={styles.verifyRow}
            onPress={() => {
              setEditedMatchMessage(currentUser.autoMatchMessage || 'Hi! Nice to meet you 👋');
              setSendAutoMessage(currentUser.sendAutoMatchMessage !== false);
              setShowMatchMessageModal(true);
            }}
            testID="match-message-button"
          >
            <View style={styles.verifyInfo}>
              <Sparkles size={18} color={colors.mint} />
              <Text style={styles.verifyTitle}>Match Message</Text>
            </View>
            <Text style={styles.verifyArrow}>›</Text>
          </TouchableOpacity>

          {/* Social Links */}
          {(currentUser.igUrl || currentUser.linkedinUrl) && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Social</Text>
              {currentUser.igUrl ? (
                <TouchableOpacity onPress={async () => {
                  const url = currentUser.igUrl!;
                  const ok = await Linking.canOpenURL(url);
                  if (ok) {
                    Linking.openURL(url);
                  } else {
                    showToast('Invalid Instagram link', 'error');
                  }
                }}>
                  <Text style={[styles.bio, { color: colors.lavender }]} numberOfLines={1}>Instagram: {currentUser.igUrl}</Text>
                </TouchableOpacity>
              ) : null}
              {currentUser.linkedinUrl ? (
                <TouchableOpacity onPress={async () => {
                  const url = currentUser.linkedinUrl!;
                  const ok = await Linking.canOpenURL(url);
                  if (ok) {
                    Linking.openURL(url);
                  } else {
                    showToast('Invalid LinkedIn link', 'error');
                  }
                }}>
                  <Text style={[styles.bio, { color: colors.lavender }]} numberOfLines={1}>LinkedIn: {currentUser.linkedinUrl}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          
          <ClayButton
            title="Log Out"
            onPress={() => {
              Alert.alert(
                'Log Out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await signOut();
                        router.replace('/');
                      } catch (error) {
                        console.error('Logout error:', error);
                        Alert.alert('Error', 'Failed to log out. Please try again.');
                      }
                    }
                  }
                ]
              );
            }}
            variant="secondary"
            style={[styles.gdprButton, styles.logoutButton]}
            testID="logout-button"
          />
        </ClayCard>

        {/* GDPR Section - Small and discreet at bottom */}
        <View style={styles.privacySection}>
          <Text style={styles.privacySectionTitle}>Data & Privacy</Text>
          <View style={styles.privacyButtons}>
            <TouchableOpacity
              onPress={async () => {
                if (!currentUser) return;
                await exportMyData(currentUser.id);
                showToast('Export requested', 'success');
              }}
              style={styles.privacyButton}
            >
              <Text style={styles.privacyButtonText}>Export My Data</Text>
            </TouchableOpacity>
            <Text style={styles.privacySeparator}>•</Text>
            <TouchableOpacity
              onPress={async () => {
                if (!currentUser) return;
                Alert.alert(
                  'Delete Data',
                  'Are you sure? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteMyData(currentUser.id);
                        showToast('Deletion requested', 'success');
                      }
                    }
                  ]
                );
              }}
              style={styles.privacyButton}
            >
              <Text style={styles.privacyButtonText}>Delete My Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Verify Profile Modal */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ClayCard style={styles.verifyModal}>
            <Text style={styles.verifyModalTitle}>Verify Your Profile</Text>
            <Text style={styles.verifyModalText}>
              Get verified to increase trust and stand out! Upload a photo of your ID or student card.
            </Text>
            
            <View style={styles.verifyOptions}>
              <TouchableOpacity 
                style={styles.verifyOption}
                onPress={() => {
                  setShowVerifyModal(false);
                  Alert.alert('ID Upload', 'In a real app, this would open your camera or photo library to upload your ID.');
                }}
              >
                <ShieldCheck size={24} color={colors.lavender} />
                <Text style={styles.verifyOptionText}>Upload ID</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.verifyOption}
                onPress={() => {
                  setShowVerifyModal(false);
                  Alert.alert('Student Card', 'In a real app, this would open your camera or photo library to upload your student card.');
                }}
              >
                <ShieldCheck size={24} color={colors.mint} />
                <Text style={styles.verifyOptionText}>Upload Student Card</Text>
              </TouchableOpacity>
            </View>
            
            <ClayButton
              title="Cancel"
              onPress={() => setShowVerifyModal(false)}
              variant="secondary"
              style={styles.verifyModalButton}
            />
          </ClayCard>
        </View>
      </Modal>

      {/* Match Message Settings Modal */}
      <Modal
        visible={showMatchMessageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMatchMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ClayCard style={styles.verifyModal}>
            <Text style={styles.verifyModalTitle}>Match Message Settings</Text>
            <Text style={styles.verifyModalText}>
              Customize the automatic message sent when you match with someone.
            </Text>
            
            <View style={styles.matchMessageToggle}>
              <Text style={styles.matchMessageLabel}>Send automatic message</Text>
              <TouchableOpacity
                accessibilityRole="switch"
                accessibilityState={{ checked: sendAutoMessage }}
                onPress={() => setSendAutoMessage(!sendAutoMessage)}
                style={[styles.pauseSwitch, sendAutoMessage ? styles.pauseSwitchOn : styles.pauseSwitchOff]}
              >
                <View style={[styles.knob, sendAutoMessage ? styles.knobOn : styles.knobOff]} />
              </TouchableOpacity>
            </View>
            
            {sendAutoMessage && (
              <View>
                <Text style={styles.matchMessageLabel}>Your message:</Text>
                <TextInput
                  style={styles.matchMessageInput}
                  value={editedMatchMessage}
                  onChangeText={setEditedMatchMessage}
                  placeholder="Hi! Nice to meet you 👋"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  maxLength={200}
                />
                <Text style={styles.charCount}>{editedMatchMessage.length}/200</Text>
              </View>
            )}
            
            <View style={styles.matchMessageActions}>
              <ClayButton
                title="Cancel"
                onPress={() => setShowMatchMessageModal(false)}
                variant="secondary"
                style={styles.matchMessageButton}
              />
              <ClayButton
                title="Save"
                onPress={async () => {
                  if (!currentUser) return;
                  try {
                    const updated = await updateUser(currentUser.id, {
                      autoMatchMessage: editedMatchMessage.trim(),
                      sendAutoMatchMessage: sendAutoMessage
                    });
                    if (updated) {
                      updateCurrentUser(updated);
                      setShowMatchMessageModal(false);
                      showToast('Match message updated', 'success');
                    }
                  } catch (e) {
                    console.error('Failed to update match message', e);
                    Alert.alert('Error', 'Failed to update match message');
                  }
                }}
                variant="primary"
                style={styles.matchMessageButton}
              />
            </View>
          </ClayCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  headerCard: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 0,
  },
  headerInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  school: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  program: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  placeholderPhoto: {
    backgroundColor: colors.softLilac,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  editPhotosContainer: {
    width: '100%',
  },
  photosScroll: {
    marginVertical: spacing.sm,
  },
  editPhoto: {
    width: 80,
    height: 80,
    borderRadius: radius.medium,
    marginRight: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  primaryEditPhoto: {
    borderWidth: 2,
    borderColor: colors.lavender,
  },
  editPhotoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.softLilac,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.lavender,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  primaryBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'white',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: radius.medium,
    backgroundColor: colors.softLilac,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.softLilac,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.lavender,
  },
  generateButtonText: {
    fontSize: 12,
    color: colors.lavender,
    fontWeight: '600',
  },
  bioInput: {
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.xs,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bio: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dealbreakerChip: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dealbreakerText: {
    color: '#D63031',
  },
  mustHaveChip: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#00B894',
  },
  mustHaveText: {
    color: '#00A085',
  },
  subsection: {
    marginTop: spacing.md,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  preferenceItem: {
    flex: 1,
    minWidth: '45%',
  },
  additionalPrefs: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prefLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  prefValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  housingDetails: {
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  roomPhoto: {
    width: '100%',
    height: 200,
    borderRadius: radius.medium,
    marginBottom: spacing.sm,
  },
  roomPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roomType: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roomDescription: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  preferenceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  gdprButtons: {
    gap: spacing.sm,
  },
  gdprButton: {
    width: '100%',
  },
  logoutButton: {
    borderColor: '#EF4444',
  },
  pauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  pauseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pauseTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pauseSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  pauseSwitchOn: {
    backgroundColor: colors.lavender,
  },
  pauseSwitchOff: {
    backgroundColor: colors.softLilac,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    transform: [{ translateX: 0 }],
  },
  knobOn: {
    transform: [{ translateX: 20 }],
  },
  knobOff: {
    transform: [{ translateX: 0 }],
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.softLilac,
    marginTop: spacing.sm,
  },
  verifyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifyTitle: {
    fontSize: 16,
    color: colors.lavender,
    fontWeight: '600',
  },
  verifyArrow: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  privacySection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  privacySectionTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  privacyButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  privacyButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  privacyButtonText: {
    fontSize: 12,
    color: colors.lavender,
    textDecorationLine: 'underline',
  },
  privacySeparator: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  verifyModal: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  verifyModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  verifyModalText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  verifyOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  verifyOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    gap: spacing.sm,
  },
  verifyOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  verifyModalButton: {
    width: '100%',
  },
  matchMessageToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  matchMessageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  matchMessageInput: {
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: spacing.xs,
  },
  matchMessageActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  matchMessageButton: {
    flex: 1,
  },
});
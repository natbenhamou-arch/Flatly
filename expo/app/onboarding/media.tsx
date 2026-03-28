import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Image, TextInput, Alert, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, X, Sparkles, Instagram, Linkedin, Music, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { generateBio } from '@/services/ai';

// Placeholder images for demo
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
];

const PHOTO_SIZE = 100; // Fixed size for photos

export default function MediaScreen() {
  
  const { onboardingUser, updateOnboardingUser } = useAppStore();
  const [gender, setGender] = useState<string>(onboardingUser?.gender || '');
  const [photos, setPhotos] = useState<string[]>(onboardingUser?.photos || []);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0);
  const [bio, setBio] = useState<string>(onboardingUser?.shortBio || '');
  const [instagramUrl, setInstagramUrl] = useState<string>(onboardingUser?.igUrl ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(onboardingUser?.linkedinUrl ?? '');
  const [tiktokUrl, setTiktokUrl] = useState<string>(onboardingUser?.tiktokUrl ?? '');
  const [isGeneratingBio, setIsGeneratingBio] = useState<boolean>(false);

  useEffect(() => {
    updateOnboardingUser({ 
      gender: gender || undefined,
      photos, 
      shortBio: bio, 
      igUrl: instagramUrl.trim() || undefined, 
      linkedinUrl: linkedinUrl.trim() || undefined,
      tiktokUrl: tiktokUrl.trim() || undefined
    });
  }, [gender, photos, bio, instagramUrl, linkedinUrl, tiktokUrl, updateOnboardingUser]);

  const addPhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Maximum Photos', 'You can add up to 6 photos.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to add photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotoUri = result.assets[0].uri;
        setPhotos([...photos, newPhotoUri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      const availableImages = PLACEHOLDER_IMAGES.filter(img => !photos.includes(img));
      if (availableImages.length > 0) {
        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        setPhotos([...photos, randomImage]);
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    
    // Adjust primary photo index if needed
    if (primaryPhotoIndex >= newPhotos.length) {
      setPrimaryPhotoIndex(Math.max(0, newPhotos.length - 1));
    }
  };

  const setPrimaryPhoto = (index: number) => {
    setPrimaryPhotoIndex(index);
    // Move selected photo to front
    const newPhotos = [...photos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    setPhotos(newPhotos);
    setPrimaryPhotoIndex(0);
  };

  const generateAIBio = async () => {
    if (!onboardingUser) return;
    
    setIsGeneratingBio(true);
    try {
      const lifestyle = onboardingUser.lifestyle || {};
      const housing = onboardingUser.housing || {};
      const user = onboardingUser;
      
      const hobbies = lifestyle.hobbies || [];
      const sportsHobbies = lifestyle.sportsHobbies || [];
      const seriesFilms = lifestyle.seriesFilms || '';
      const university = user.university || 'university';
      const hasRoom = user.hasRoom;
      const cleanliness = lifestyle.cleanliness;
      const sleep = lifestyle.sleep;
      const religion = lifestyle.religion;
      const politicalView = lifestyle.politicalView;
      const foodPreference = lifestyle.foodPreference;
      const dietary = lifestyle.dietary || [];
      
      let bioText = `${user.firstName || 'Student'} at ${university}. `;
      
      if (hobbies.length > 0 || sportsHobbies.length > 0) {
        const allInterests = [...hobbies, ...sportsHobbies].slice(0, 3);
        bioText += `Passionate about ${allInterests.join(', ')}. `;
      }
      
      if (seriesFilms) {
        bioText += `Love watching ${seriesFilms}. `;
      }
      
      if (hasRoom) {
        bioText += `Have a great place looking for a compatible roommate! `;
      } else {
        bioText += `Searching for the perfect living space. `;
      }
      
      if (cleanliness) {
        const cleanDesc = cleanliness === 'meticulous' ? 'very organized and tidy' : 
                         cleanliness === 'chill' ? 'easy-going and relaxed' : 'balanced';
        bioText += `I'm ${cleanDesc}, `;
      }
      
      if (sleep) {
        const sleepDesc = sleep === 'early' ? 'an early bird' : 
                         sleep === 'night' ? 'a night owl' : 'flexible with my schedule';
        bioText += `${sleepDesc}. `;
      }
      
      if (foodPreference && foodPreference !== 'omnivore') {
        bioText += `${foodPreference.charAt(0).toUpperCase() + foodPreference.slice(1)} lifestyle. `;
      }
      
      if (religion && lifestyle.showReligion) {
        bioText += `${religion} background. `;
      }
      
      bioText += `Let's connect and see if we're a great match!`;
      
      if (bioText.length > 500) {
        bioText = bioText.substring(0, 497) + '...';
      }
      
      setBio(bioText);
    } catch (error) {
      console.error('Failed to generate bio:', error);
      Alert.alert('Error', 'Failed to generate bio. Please try again.');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const canContinue = gender.trim().length > 0 && photos.length >= 1 && bio.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      Alert.alert('Required Fields', 'Please select your gender, add at least one photo, and write a bio.');
      return;
    }
    
    updateOnboardingUser({ 
      gender: gender.trim(),
      photos, 
      shortBio: bio.trim(),
      igUrl: instagramUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      tiktokUrl: tiktokUrl.trim() || undefined
    });
    
    router.push('./review-create');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Photos & Bio</Text>
          <Text style={styles.subtitle}>
            Show your personality! Add 1-6 photos and tell us about yourself.
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <Text style={styles.sectionSubtitle}>Select your gender</Text>
            
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Non-binary', 'Other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderButton,
                    gender === option && styles.genderButtonSelected
                  ]}
                  onPress={() => setGender(option)}
                >
                  <User 
                    size={20} 
                    color={gender === option ? 'white' : theme.colors.text.secondary} 
                  />
                  <Text style={[
                    styles.genderButtonText,
                    gender === option && styles.genderButtonTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Photos Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({photos.length}/6)</Text>
            <Text style={styles.sectionSubtitle}>
              {photos.length === 0 ? 'Add at least 1 photo to continue' : 'Tap a photo to make it your primary'}
            </Text>
            
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.photoContainer,
                    index === primaryPhotoIndex && styles.primaryPhoto
                  ]}
                  onPress={() => setPrimaryPhoto(index)}
                >
                  <Image source={{ uri: photo }} style={styles.photo} />
                  {index === primaryPhotoIndex && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePhoto(index)}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              
              {photos.length < 6 && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
                  <Plus size={32} color={theme.colors.text.secondary} />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <View style={styles.bioHeader}>
              <Text style={styles.sectionTitle}>About You</Text>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateAIBio}
                disabled={isGeneratingBio}
              >
                <Sparkles size={16} color={theme.colors.primary} />
                <Text style={styles.generateButtonText}>
                  {isGeneratingBio ? 'Generating...' : 'AI Generate'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.bioInput}
              placeholder="Tell potential roommates about yourself! What are you studying? What do you love doing? What's your ideal living situation?"
              placeholderTextColor={theme.colors.text.secondary}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>

          {/* Social Links Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Links (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Help others get to know you better
            </Text>
            
            <View style={styles.socialInput}>
              <Instagram size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.socialTextInput}
                placeholder="Instagram profile URL (https://instagram.com/yourname)"
                placeholderTextColor={theme.colors.text.secondary}
                value={instagramUrl}
                onChangeText={setInstagramUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.socialInput}>
              <Linkedin size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.socialTextInput}
                placeholder="LinkedIn profile URL (https://linkedin.com/in/yourname)"
                placeholderTextColor={theme.colors.text.secondary}
                value={linkedinUrl}
                onChangeText={setLinkedinUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.socialInput}>
              <Music size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.socialTextInput}
                placeholder="TikTok profile URL (https://tiktok.com/@yourname)"
                placeholderTextColor={theme.colors.text.secondary}
                value={tiktokUrl}
                onChangeText={setTiktokUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={[
            styles.continueButtonText,
            !canContinue && styles.continueButtonTextDisabled
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
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
    fontWeight: 'bold' as const,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.card,
  },
  primaryPhoto: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500' as const,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius / 2,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  generateButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  bioInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
    ...theme.shadows.input,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'right',
    marginTop: 8,
  },
  socialInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 12,
    ...theme.shadows.input,
  },
  socialTextInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    ...theme.shadows.button,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  continueButtonTextDisabled: {
    color: theme.colors.text.secondary,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.input,
  },
  genderButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
  },
  genderButtonTextSelected: {
    color: 'white',
    fontWeight: '600' as const,
  },
});
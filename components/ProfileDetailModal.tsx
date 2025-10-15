import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedUser } from '@/types';
import { ClayCard } from './ClayCard';
import { ClayButton } from './ClayButton';
import { colors, radius, spacing } from '@/constants/theme';
import {
  X,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  Flag,
  Shield,
  ExternalLink,
  Instagram,
  Linkedin,
} from 'lucide-react-native';
import { displayName, safeNeighborhoodText } from '@/utils/format';
import { recordReport, blockUser } from '@/services/report';
import { useAppStore } from '@/store/app-store';

interface ProfileDetailModalProps {
  user: FeedUser | null;
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function ProfileDetailModal({
  user,
  visible,
  onClose,
}: ProfileDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isMatched, setIsMatched] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [showReportInput, setShowReportInput] = useState<boolean>(false);
  const { currentUser } = useAppStore();



  const handleReport = () => {
    setShowReportInput(true);
  };

  const submitReport = async () => {
    if (!currentUser || !user || !reportReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for reporting.');
      return;
    }

    try {
      await recordReport(currentUser.id, user.id, reportReason.trim());
      setShowReportInput(false);
      setReportReason('');
      Alert.alert('Report Submitted', 'Thank you for your report. We\'ll review it shortly.');
      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user? You won\'t see them again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser || !user) return;
            
            try {
              await blockUser(currentUser.id, user.id);
              Alert.alert('User Blocked', 'You won\'t see this user again.');
              onClose();
            } catch (error) {
              console.error('Failed to block user:', error);
              Alert.alert('Error', 'Failed to block user. Please try again.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!currentUser || !user) return;
        const { getMatchesByUser } = await import('@/services/data');
        const matches = await getMatchesByUser(currentUser.id);
        const matched = matches.some(m => m.users.includes(user.id));
        if (mounted) setIsMatched(matched);
      } catch (e) {
        console.log('Failed to check match status', e);
      }
    })();
    return () => { mounted = false; };
  }, [currentUser, user]);

  if (!user) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-full-profile">
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  const renderPhotoCarousel = () => {
    if (!user.photos || user.photos.length === 0) return null;

    return (
      <View style={styles.photoContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setCurrentPhotoIndex(index);
          }}
        >
          {user.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photo}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {user.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {user.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentPhotoIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
        
        {user.compatibility && (
          <View style={styles.compatibilityBadge}>
            <Text style={styles.compatibilityText}>
              {user.compatibility.score}% Match
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderBasicInfo = () => (
    <ClayCard style={styles.section}>
      <View style={styles.headerSection}>
        <Text style={styles.name}>{displayName(user.firstName, user.lastName)}, {user.age}</Text>
        <View style={styles.locationRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.location}>
            {user.city}{user.distance ? ` • ${user.distance}km away` : ''}
          </Text>
        </View>
        <Text style={styles.university}>{user.university}</Text>
      </View>
      
      {user.shortBio && (
        <Text style={styles.bio}>{user.shortBio}</Text>
      )}
      
      {user.badges && user.badges.length > 0 && (
        <View style={styles.badgesContainer}>
          {user.badges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <Shield size={12} color={colors.success} />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      )}
    </ClayCard>
  );

  const renderHousingInfo = () => {
    if (!user.housing) return null;

    return (
      <ClayCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <Home size={20} color={colors.textPrimary} />
          <Text style={styles.sectionTitle}>Housing</Text>
        </View>
        
        {user.hasRoom ? (
          <View>
            <View style={styles.housingRow}>
              <Text style={styles.housingLabel}>Has a room available</Text>
            </View>
            {user.housing.neighborhood && (
              <View style={styles.housingRow}>
                <Text style={styles.housingLabel}>Neighborhood:</Text>
                <Text style={styles.housingValue}>{safeNeighborhoodText(user.housing.neighborhood)}</Text>
              </View>
            )}
            {user.housing.bedrooms && (
              <View style={styles.housingRow}>
                <Text style={styles.housingLabel}>Bedrooms:</Text>
                <Text style={styles.housingValue}>{user.housing.bedrooms}</Text>
              </View>
            )}
            {user.housing.rent && (
              <View style={styles.housingRow}>
                <DollarSign size={16} color={colors.textSecondary} />
                <Text style={styles.housingValue}>
                  ${user.housing.rent}/month
                  {user.housing.billsIncluded ? ' (bills included)' : ''}
                </Text>
              </View>
            )}
            {user.housing.availableFrom && (
              <View style={styles.housingRow}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={styles.housingValue}>
                  Available from {new Date(user.housing.availableFrom).toLocaleDateString()}
                </Text>
              </View>
            )}
            {Array.isArray(user.housing.roomPhotos) && user.housing.roomPhotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomPhotosScroll}>
                {user.housing.roomPhotos.map((uri, idx) => (
                  <Image key={`room-${idx}`} source={{ uri }} style={styles.roomThumb} />
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.housingLabel}>Looking for a room</Text>
            {(user.housing.budgetMin || user.housing.budgetMax) && (
              <View style={styles.housingRow}>
                <DollarSign size={16} color={colors.textSecondary} />
                <Text style={styles.housingValue}>
                  Budget: ${user.housing.budgetMin ?? 0} - ${user.housing.budgetMax ?? '—'}{user.housing.currency ? ` ${user.housing.currency}` : ''}
                </Text>
              </View>
            )}
            {user.housing.targetNeighborhoods && user.housing.targetNeighborhoods.length > 0 && (
              <View style={styles.housingRow}>
                <Text style={styles.housingLabel}>Preferred areas:</Text>
                <Text style={styles.housingValue}>
                  {user.housing.targetNeighborhoods.map(n => safeNeighborhoodText(n)).join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}
      </ClayCard>
    );
  };

  const renderLifestyle = () => {
    if (!user.lifestyle) return null;

    return (
      <ClayCard style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        
        <View style={styles.lifestyleGrid}>
          <View style={styles.lifestyleItem}>
            <Text style={styles.lifestyleLabel}>Sleep Schedule</Text>
            <Text style={styles.lifestyleValue}>{user.lifestyle.sleep}</Text>
          </View>
          
          <View style={styles.lifestyleItem}>
            <Text style={styles.lifestyleLabel}>Cleanliness</Text>
            <Text style={styles.lifestyleValue}>{user.lifestyle.cleanliness}</Text>
          </View>
          
          <View style={styles.lifestyleItem}>
            <Text style={styles.lifestyleLabel}>Smoking</Text>
            <Text style={styles.lifestyleValue}>
              {user.lifestyle.smoker ? 'Smoker' : 'Non-smoker'}
            </Text>
          </View>
          
          <View style={styles.lifestyleItem}>
            <Text style={styles.lifestyleLabel}>Pets</Text>
            <Text style={styles.lifestyleValue}>
              {user.lifestyle.petsOk ? 'Pet-friendly' : 'No pets'}
            </Text>
          </View>
          
          <View style={styles.lifestyleItem}>
            <Text style={styles.lifestyleLabel}>Guests</Text>
            <Text style={styles.lifestyleValue}>{user.lifestyle.guests}</Text>
          </View>
          
          <View style={styles.lifestyleItem}>
            <Text style={styles.lifestyleLabel}>Noise Level</Text>
            <Text style={styles.lifestyleValue}>{user.lifestyle.noise}</Text>
          </View>

          {user.lifestyle.showReligion && (user.lifestyle.religiousChoice || user.lifestyle.religion) && (
            <View style={styles.lifestyleItem}>
              <Text style={styles.lifestyleLabel}>Religion</Text>
              <Text style={styles.lifestyleValue}>
                {user.lifestyle.religiousChoice === 'yes' ? 'Religious' : user.lifestyle.religiousChoice === 'no' ? 'Not religious' : 'Prefer not to say'}
                {user.lifestyle.religion ? ` • ${user.lifestyle.religion}` : ''}
              </Text>
            </View>
          )}

          {user.lifestyle.showPoliticalView && user.lifestyle.politicalView && (
            <View style={styles.lifestyleItem}>
              <Text style={styles.lifestyleLabel}>Politics</Text>
              <Text style={styles.lifestyleValue}>
                {user.lifestyle.politicalView === 'progressive' ? 'Progressive' : user.lifestyle.politicalView === 'centrist' ? 'Center' : user.lifestyle.politicalView === 'conservative' ? 'Conservative' : user.lifestyle.politicalView}
              </Text>
            </View>
          )}
        </View>
        
        {user.lifestyle.hobbies && user.lifestyle.hobbies.length > 0 && (
          <View style={styles.hobbiesSection}>
            <Text style={styles.hobbiesTitle}>Interests</Text>
            <View style={styles.hobbiesContainer}>
              {user.lifestyle.hobbies.map((hobby) => (
                <View key={hobby} style={styles.hobbyChip}>
                  <Text style={styles.hobbyText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ClayCard>
    );
  };

  const renderSocialLinks = () => {
    if (!user.igUrl && !user.linkedinUrl) return null;

    const lockedNote = '🔒 Social links unlock after a match.';

    return (
      <ClayCard style={styles.section}>
        <Text style={styles.sectionTitle}>Social</Text>
        <View style={styles.socialContainer}>
          {user.igUrl && (
            <TouchableOpacity
              disabled={!isMatched}
              style={[styles.socialLink, !isMatched ? styles.socialLinkLocked : null]}
              onPress={() => Linking.openURL(user.igUrl!)}
            >
              <Instagram size={20} color={!isMatched ? colors.textSecondary : colors.textPrimary} />
              <Text style={[styles.socialText, !isMatched ? styles.socialTextLocked : null]}>Instagram</Text>
              <ExternalLink size={16} color={!isMatched ? colors.textSecondary : colors.textSecondary} />
            </TouchableOpacity>
          )}
          {user.linkedinUrl && (
            <TouchableOpacity
              disabled={!isMatched}
              style={[styles.socialLink, !isMatched ? styles.socialLinkLocked : null]}
              onPress={() => Linking.openURL(user.linkedinUrl!)}
            >
              <Linkedin size={20} color={!isMatched ? colors.textSecondary : colors.textPrimary} />
              <Text style={[styles.socialText, !isMatched ? styles.socialTextLocked : null]}>LinkedIn</Text>
              <ExternalLink size={16} color={!isMatched ? colors.textSecondary : colors.textSecondary} />
            </TouchableOpacity>
          )}
          {!isMatched && (
            <Text style={styles.socialLockedNote}>{lockedNote}</Text>
          )}
        </View>
      </ClayCard>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-full-profile">
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderPhotoCarousel()}
          {renderBasicInfo()}
          {renderHousingInfo()}
          {renderLifestyle()}
          {/* Preferences highlights */}
          {user.currentPreferences && (
            <ClayCard style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences Highlights</Text>
              <View style={styles.housingRow}>
                <Text style={styles.housingLabel}>Age range:</Text>
                <Text style={styles.housingValue}>{user.currentPreferences.ageMin} - {user.currentPreferences.ageMax}</Text>
              </View>
              <View style={styles.housingRow}>
                <Text style={styles.housingLabel}>Search radius:</Text>
                <Text style={styles.housingValue}>{user.currentPreferences.maxDistanceKm} km</Text>
              </View>
              <View style={styles.housingRow}>
                <Text style={styles.housingLabel}>Looking for:</Text>
                <Text style={styles.housingValue}>{user.currentPreferences.lookingFor}</Text>
              </View>
            </ClayCard>
          )}
          {renderSocialLinks()}
          
          {showReportInput && (
            <ClayCard style={styles.reportInputCard}>
              <Text style={styles.reportInputTitle}>Why are you reporting this user?</Text>
              <TextInput
                style={styles.reportInput}
                value={reportReason}
                onChangeText={setReportReason}
                placeholder="Please describe the issue..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
              />
              <View style={styles.reportActions}>
                <ClayButton
                  title="Cancel"
                  onPress={() => {
                    setShowReportInput(false);
                    setReportReason('');
                  }}
                  variant="secondary"
                  style={styles.reportActionButton}
                />
                <ClayButton
                  title="Submit Report"
                  onPress={submitReport}
                  variant="danger"
                  style={styles.reportActionButton}
                />
              </View>
            </ClayCard>
          )}
          
          <View style={styles.actionButtons}>
            <ClayButton
              title="Report"
              onPress={handleReport}
              variant="secondary"
              style={styles.actionButton}
              testID="report-user"
            >
              <Flag size={16} color={colors.textPrimary} />
            </ClayButton>
            
            <ClayButton
              title="Block"
              onPress={handleBlock}
              variant="danger"
              style={styles.actionButton}
              testID="block-user"
            >
              <Shield size={16} color={colors.white} />
            </ClayButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.softLilac,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    height: 400,
  },
  photo: {
    width: screenWidth,
    height: 400,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: colors.white,
  },
  compatibilityBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.success,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  compatibilityText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  location: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  university: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  housingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  housingLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  housingValue: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  roomPhotosScroll: {
    marginTop: spacing.sm,
  },
  roomThumb: {
    width: 160,
    height: 100,
    borderRadius: radius.medium,
    marginRight: spacing.sm,
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  lifestyleItem: {
    width: '45%',
  },
  lifestyleLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  lifestyleValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  hobbiesSection: {
    marginTop: spacing.md,
  },
  hobbiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  hobbyChip: {
    backgroundColor: colors.mint,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  hobbyText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  socialContainer: {
    gap: spacing.sm,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.softLilac,
    borderRadius: radius.medium,
    gap: spacing.sm,
  },
  socialLinkLocked: {
    opacity: 0.6,
  },
  socialTextLocked: {
    color: colors.textSecondary,
  },
  socialLockedNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  socialText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  reportInputCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  reportInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: colors.softLilac,
    borderRadius: radius.medium,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  reportActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reportActionButton: {
    flex: 1,
  },
});
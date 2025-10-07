import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FeedUser } from '@/types';
import { ClayCard } from './ClayCard';
import { colors, radius, spacing, gradients } from '@/constants/theme';
import { Info, MapPin, GraduationCap } from 'lucide-react-native';
import { displayName } from '@/utils/format';

interface UserCardProps {
  user: FeedUser;
  showCompatibilityScore?: boolean;
  onCompatibilityPress?: () => void;
  onCardPress?: () => void;
}

export function UserCard({ user, showCompatibilityScore, onCompatibilityPress, onCardPress }: UserCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 32;
  const age = user.age;
  
  const getLifestyleChips = () => {
    const chips: string[] = [];
    if (user.lifestyle) {
      chips.push(user.lifestyle.sleep);
      chips.push(user.lifestyle.cleanliness);
      if (!user.lifestyle.smoker) chips.push('non-smoker');
      if (user.lifestyle.petsOk) chips.push('pet-friendly');
    }
    return chips.slice(0, 3);
  };

  return (
    <TouchableOpacity onPress={onCardPress} activeOpacity={0.95}>
      <ClayCard style={[styles.card, { width: cardWidth }]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: user.photos[0] }} style={styles.image} />
          
          {/* Gradient overlay for better text readability */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradientOverlay}
          />
          
          {showCompatibilityScore && user.compatibility && (
            <TouchableOpacity 
              style={styles.scoreBadge} 
              onPress={onCompatibilityPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.scoreBadgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.scoreText}>{user.compatibility.score}%</Text>
                <Info size={12} color={colors.white} style={styles.infoIcon} />
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {user.hasRoom && (
            <View style={styles.hasPlaceBadge}>
              <LinearGradient
                colors={gradients.sky}
                style={styles.hasPlaceBadgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.hasPlaceText}>🏠 Has a Room</Text>
              </LinearGradient>
            </View>
          )}
          
          {/* Bottom info overlay */}
          <View style={styles.bottomOverlay}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{displayName(user.firstName, user.lastName)}</Text>
              <Text style={styles.age}>{age}</Text>
            </View>
            
            <View style={styles.infoRow}>
              {user.university && (
                <View style={styles.infoItem}>
                  <GraduationCap size={14} color={colors.white} />
                  <Text style={styles.infoText}>{user.university}</Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <MapPin size={14} color={colors.white} />
                <Text style={styles.infoText}>
                  {user.city}{user.distance ? ` • ${user.distance}km` : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.chipsContainer}>
            {getLifestyleChips().slice(0, 3).map((chip, index) => (
              <View key={chip} style={[styles.chip, { backgroundColor: gradients.primary[index % 2] + '20' }]}>
                <Text style={[styles.chipText, { color: gradients.primary[index % 2] }]}>{chip}</Text>
              </View>
            ))}
          </View>
          
          {user.shortBio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.shortBio}
            </Text>
          )}
        </View>
      </ClayCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: radius.xxl,
  },
  imageContainer: {
    position: 'relative',
    height: 480,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  scoreBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    borderRadius: radius.round,
    overflow: 'hidden',
  },
  scoreBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  hasPlaceBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.round,
    overflow: 'hidden',
  },
  hasPlaceBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hasPlaceText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginRight: spacing.sm,
  },
  age: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.9,
  },
  infoRow: {
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
    opacity: 0.9,
  },
  content: {
    padding: spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.round,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bio: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    fontWeight: '400',
  },
  infoIcon: {
    marginLeft: 4,
  },
});
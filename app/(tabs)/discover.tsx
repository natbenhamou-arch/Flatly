import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  PanResponder, 
  Animated, 
  Text,
  useWindowDimensions,
  Modal,
  Pressable,
} from 'react-native';
import { Heart, X, Sparkles, Zap as Lightning, Users, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/app-store';

import { UserCard } from '@/components/UserCard';
import { ClayButton } from '@/components/ClayButton';
import { ProfileDetailModal } from '@/components/ProfileDetailModal';
import { CompatibilityModal } from '@/components/CompatibilityModal';
import { MatchAnimation } from '@/components/MatchAnimation';
import { BrandPattern } from '@/components/BrandPattern';
import { colors, spacing, radius } from '@/constants/theme';
import { FeedUser, User as UserType } from '@/types';

import { displayName } from '@/utils/format';


import { updateUser } from '@/services/data';
import { router } from 'expo-router';
import { useToast } from '@/components/Toast';

export default function DiscoverScreen() {
  // Note: This screen uses tabs layout which handles safe area automatically
  const { 
    feedUsers, 
    swipeUser, 
    refreshFeed, 
    showMatchAnimation, 
    matchedUserName, 
    hideMatchAnimation,
    hasCompletedOnboarding,
    currentUser
  } = useAppStore();
  const { width: screenWidth } = useWindowDimensions();
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const { showToast } = useToast();
  const [selectedUser, setSelectedUser] = useState<FeedUser | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [compatibilityData, setCompatibilityData] = useState<any>(null);
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(false);
  const [walkIndex, setWalkIndex] = useState<number>(0);

  useEffect(() => {
    if (hasCompletedOnboarding && currentUser) {
      refreshFeed();
      if (!currentUser.walkthroughSeen) {
        setShowWalkthrough(true);
      }
    }
  }, [refreshFeed, hasCompletedOnboarding, currentUser]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (currentUser && !hasCompletedOnboarding) {
      console.log('User has not completed onboarding, redirecting...');
      // This should not happen due to navigation logic, but just in case
    }
  }, [currentUser, hasCompletedOnboarding]);

  // Show loading if onboarding not completed
  const currentCard = feedUsers[0];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      const newOpacity = 1 - Math.abs(gestureState.dx) / (screenWidth * 0.7);
      opacity.setValue(Math.max(0.5, newOpacity));
    },
    onPanResponderRelease: (_, gestureState) => {
      const swipeThreshold = screenWidth * 0.3;
      
      if (Math.abs(gestureState.dx) > swipeThreshold) {
        const direction = gestureState.dx > 0 ? 'like' : 'pass';
        const toValue = gestureState.dx > 0 ? screenWidth : -screenWidth;
        
        // If paused and attempting to like, just snap back and toast
        if (currentUser?.paused && direction === 'like') {
          showToast('Profile paused', 'info');
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
          return;
        }
        
        Animated.parallel([
          Animated.timing(pan, {
            toValue: { x: toValue, y: gestureState.dy },
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start(() => {
          if (currentCard) {
            handleSwipe(currentCard, direction);
          }
          resetCard();
        });
      } else {
        // Snap back
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
    scale.setValue(1);
  };

  const handleSwipe = async (user: FeedUser, action: 'like' | 'pass' | 'superlike') => {
    try {
      if (currentUser?.paused && (action === 'like' || action === 'superlike')) {
        showToast('Profile paused', 'info');
        return;
      }
      await swipeUser(user, action);
      
      // Match animation is handled by the store when a match is created
    } catch (error) {
      console.error('Error swiping user:', error);
    }
  };

  const handleLike = () => {
    if (!currentCard) return;
    if (currentUser?.paused) {
      showToast('Profile paused', 'info');
      return;
    }
    
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: screenWidth, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      handleSwipe(currentCard, 'like');
      resetCard();
    });
  };

  const handlePass = () => {
    if (!currentCard) return;
    
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: -screenWidth, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      handleSwipe(currentCard, 'pass');
      resetCard();
    });
  };



  const handleCardPress = (user: FeedUser) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleCompatibilityPress = (user: FeedUser) => {
    setSelectedUser(user);
    setCompatibilityData(user.compatibility);
    setShowCompatibilityModal(true);
  };



  const cardTransform = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate: pan.x.interpolate({
        inputRange: [-screenWidth, 0, screenWidth],
        outputRange: ['-15deg', '0deg', '15deg'],
        extrapolate: 'clamp',
      }) },
      { scale },
    ],
    opacity,
  };

  // Walkthrough hooks & renderer are defined before any return to avoid hook order issues
  const walkthroughSlides = useMemo(() => ([
    {
      title: 'Swipe to decide',
      body: 'Swipe right to like, left to pass. Use the ⚡ lightning for a super like and enjoy the match animation.',
      icon: <Lightning color={colors.lavender} size={32} />,
    },
    {
      title: 'Open full profile',
      body: 'Tap a card to see all details: photos, About Me, Housing, Vibes, and clickable social links.',
      icon: <User color={colors.lavender} size={32} />,
    },
    {
      title: 'Create groups',
      body: 'Turn a match into a group chat and add more people to coordinate apartments together.',
      icon: <Users color={colors.lavender} size={32} />,
    },
    {
      title: 'Manage your profile',
      body: 'In Profile, edit info anytime or Pause your profile to hide from Discover.',
      icon: <Sparkles color={colors.lavender} size={32} />,
    },
  ]), []);

  const finishWalkthrough = useCallback(async () => {
    try {
      if (currentUser) {
        const updated = await updateUser(currentUser.id, { walkthroughSeen: true });
        if (updated) {
          useAppStore.getState().updateCurrentUser(updated as UserType);
        }
      }
    } catch (e) {
      console.log('Walkthrough state save failed', e);
    } finally {
      setShowWalkthrough(false);
    }
  }, [currentUser]);

  const renderWalkthrough = () => (
    <Modal visible={showWalkthrough} animationType="fade" transparent>
      <View style={styles.walkOverlay}>
        <View style={styles.walkCard}>
          <View style={styles.walkIcon}>{walkthroughSlides[walkIndex]?.icon}</View>
          <Text style={styles.walkTitle}>{walkthroughSlides[walkIndex]?.title}</Text>
          <Text style={styles.walkBody}>{walkthroughSlides[walkIndex]?.body}</Text>
          <View style={styles.walkControls}>
            <View style={styles.walkDotsContainer}>
              {walkthroughSlides.map((slide, i) => (
                <Text key={`dot-${slide.title}-${i}`} style={styles.walkDot}>
                  {i === walkIndex ? '●' : '○'}
                </Text>
              ))}
            </View>
            {walkIndex < walkthroughSlides.length - 1 ? (
              <ClayButton
                title="Next"
                onPress={() => setWalkIndex(i => i + 1)}
                variant="primary"
                testID="walkthrough-next"
              />
            ) : (
              <ClayButton
                title="Got it"
                onPress={finishWalkthrough}
                variant="primary"
                testID="walkthrough-done"
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  if (feedUsers.length === 0) {
    return (
      <View style={styles.container}>
        {currentUser?.paused ? (
          <View style={styles.pausedBanner} testID="paused-banner">
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.pausedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.pausedText}>⏸️ Profile paused — You are hidden from Discover</Text>
            </LinearGradient>
          </View>
        ) : null}
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No new roommates nearby</Text>
          <Text style={styles.emptySubtitle}>
            Expand your city or preferences to find more.
          </Text>
          <ClayButton
            title="Refresh"
            onPress={refreshFeed}
            style={styles.refreshButton}
          />
        </View>
        {renderWalkthrough()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BrandPattern variant="subtle" />
      {currentUser?.paused ? (
        <View style={styles.pausedBanner} testID="paused-banner">
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.pausedGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.pausedText}>⏸️ Profile paused — You are hidden from Discover</Text>
          </LinearGradient>
        </View>
      ) : null}
      <View style={styles.cardContainer}>
        {/* Next card (background) */}
        {feedUsers[1] && (
          <View style={[styles.card, styles.nextCard]}>
            <UserCard 
              user={feedUsers[1]} 
              showCompatibilityScore
              onCardPress={() => handleCardPress(feedUsers[1])}
              onCompatibilityPress={() => handleCompatibilityPress(feedUsers[1])}
            />
          </View>
        )}
        
        {/* Current card */}
        {currentCard && (
          <Animated.View
            style={[styles.card, cardTransform]}
            {...panResponder.panHandlers}
          >
            <UserCard 
              user={currentCard} 
              showCompatibilityScore
              onCardPress={() => handleCardPress(currentCard)}
              onCompatibilityPress={() => handleCompatibilityPress(currentCard)}
            />
          </Animated.View>
        )}
      </View>

      <View style={styles.actionButtons} testID="action-bar">
        <Pressable
          onPress={handlePass}
          testID="btn-pass"
          style={({ pressed }) => [
            styles.pillButton,
            styles.passPill,
            pressed ? styles.pillPressed : null,
          ]}
        >
          <LinearGradient
            colors={["#1B2432", "#121829"]}
            style={styles.pillGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <X color={colors.white} size={24} />
          </LinearGradient>
        </Pressable>
        
        <Pressable
          onPress={handleLike}
          testID="btn-like"
          disabled={!!currentUser?.paused}
          style={({ pressed }) => [
            styles.pillButton,
            styles.likePill,
            currentUser?.paused ? { opacity: 0.6 } : null,
            pressed ? styles.pillPressed : null,
          ]}
        >
          <LinearGradient
            colors={["#0F6BFF", "#0A3FF0"]}
            style={styles.pillGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Heart color={colors.white} size={24} fill={colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
      <ProfileDetailModal
        user={selectedUser}
        visible={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedUser(null);
        }}
      />
      
      <CompatibilityModal
        visible={showCompatibilityModal}
        onClose={() => {
          setShowCompatibilityModal(false);
          setCompatibilityData(null);
          setSelectedUser(null);
        }}
        compatibility={compatibilityData}
        userName={selectedUser ? displayName(selectedUser.firstName, selectedUser.lastName) : undefined}
      />
      
      <MatchAnimation
        visible={showMatchAnimation}
        onComplete={() => {
          hideMatchAnimation();
          try {
            const matchId = useAppStore.getState().consumeLastCreatedMatchId();
            if (matchId) {
              router.push(`/chat/${matchId}`);
              showToast('You matched! Say hi 👋', 'success');
            }
          } catch (e) {
            console.log('No new match to open', e);
          }
        }}
        matchedUserName={matchedUserName}
      />
      {renderWalkthrough()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  pausedBanner: {
    margin: spacing.md,
    borderRadius: radius.large,
    overflow: 'hidden',
  },
  pausedGradient: {
    borderRadius: radius.large,
    padding: spacing.md,
  },
  pausedText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '700',
  },
  walkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  walkCard: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  walkIcon: {
    marginBottom: spacing.sm,
  },
  walkTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  walkBody: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  walkControls: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  walkDotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  walkDot: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  card: {
    position: 'absolute',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  pillButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  pillGradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likePill: {
    minWidth: 140,
  },
  passPill: {
    minWidth: 140,
  },

  pillPressed: {
    transform: [{ scale: 0.98 }],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  refreshButton: {
    minWidth: 120,
  },
});
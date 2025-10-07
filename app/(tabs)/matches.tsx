import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
} from 'react-native';
import { MessageCircle, MoreHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/store/app-store';
import { ClayCard } from '@/components/ClayCard';
import { MatchAnimation } from '@/components/MatchAnimation';
import { colors, spacing } from '@/constants/theme';
import { getUserById, getMessagesByMatch } from '@/services/data';
import { User, Message } from '@/types';
import { displayName } from '@/utils/format';

interface MatchWithDetails {
  id: string;
  otherUser: User;
  lastMessage?: Message;
  createdAt: string;
  unreadCount: number;
  compatibility?: number;
}

export default function MatchesScreen() {
  const { matches: rawMatches, currentUser } = useAppStore();
  const [matchesWithDetails, setMatchesWithDetails] = useState<MatchWithDetails[]>([]);
  const [showMatchAnimation, setShowMatchAnimation] = useState<boolean>(false);
  const [matchedUserName, setMatchedUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  React.useEffect(() => {
    loadMatchesWithDetails();
  }, [rawMatches, currentUser]);

  const loadMatchesWithDetails = async () => {
    if (!currentUser || rawMatches.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const detailedMatches = await Promise.all(
        rawMatches.map(async (match) => {
          const otherUserId = match.users.find(id => id !== currentUser.id);
          if (!otherUserId) return null;

          const [otherUser, messages] = await Promise.all([
            getUserById(otherUserId),
            getMessagesByMatch(match.id)
          ]);

          if (!otherUser) return null;

          const lastMessage = messages[messages.length - 1];
          const unreadCount = messages.filter(
            msg => msg.senderId !== currentUser.id && !msg.readAt
          ).length;

          return {
            id: match.id,
            otherUser,
            lastMessage,
            createdAt: match.createdAt,
            unreadCount,
            compatibility: Math.floor(Math.random() * 30) + 70 // Demo compatibility
          };
        })
      );

      const validMatches = detailedMatches.filter(Boolean) as MatchWithDetails[];
      
      // Sort by last message time or match creation time
      validMatches.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setMatchesWithDetails(validMatches);
    } catch (error) {
      console.error('Failed to load matches with details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger match animation (called from discover screen)
  const triggerMatchAnimation = (userName: string) => {
    setMatchedUserName(userName);
    setShowMatchAnimation(true);
  };

  const handleMatchPress = (match: MatchWithDetails) => {
    router.push(`/chat/${match.id}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderMatch = ({ item }: { item: MatchWithDetails }) => {
    const { otherUser } = item;
    const age = new Date().getFullYear() - new Date(otherUser.birthdate).getFullYear();

    return (
      <TouchableOpacity onPress={() => handleMatchPress(item)}>
        <ClayCard style={styles.matchCard}>
          <View style={styles.matchContent}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: otherUser.photos[0] }} style={styles.avatar} />
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {item.unreadCount > 9 ? '9+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.matchInfo}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchName}>{displayName(otherUser.firstName, otherUser.lastName)}, {age}</Text>
                <View style={styles.rightSection}>
                  {item.compatibility && (
                    <View style={styles.compatibilityBadge}>
                      <Text style={styles.compatibilityText}>{item.compatibility}%</Text>
                    </View>
                  )}
                  <Text style={styles.matchTime}>
                    {item.lastMessage ? formatTime(item.lastMessage.createdAt) : formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.matchSchool} numberOfLines={1}>
                {otherUser.university}
              </Text>
              
              {item.lastMessage ? (
                <Text style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage
                ]} numberOfLines={2}>
                  {item.lastMessage.body}
                </Text>
              ) : (
                <Text style={styles.newMatch}>
                  🎉 It&apos;s a house-warming match! Say hello!
                </Text>
              )}
            </View>
            
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
        </ClayCard>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </View>
    );
  }

  if (matchesWithDetails.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MessageCircle color={colors.textSecondary} size={64} />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Keep swiping to find your perfect roommate match!
          </Text>
        </View>
        
        <MatchAnimation
          visible={showMatchAnimation}
          onComplete={() => setShowMatchAnimation(false)}
          matchedUserName={matchedUserName}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matchesWithDetails.length} match{matchesWithDetails.length !== 1 ? 'es' : ''}
          {matchesWithDetails.some(m => m.unreadCount > 0) && (
            <Text style={styles.unreadIndicator}> • New messages</Text>
          )}
        </Text>
      </View>
      
      <FlatList
        data={matchesWithDetails}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <MatchAnimation
        visible={showMatchAnimation}
        onComplete={() => setShowMatchAnimation(false)}
        matchedUserName={matchedUserName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  matchCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.lavender,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilityBadge: {
    backgroundColor: colors.mint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: spacing.xs,
  },
  compatibilityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  matchTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchSchool: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  unreadMessage: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  unreadIndicator: {
    color: colors.lavender,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  newMatch: {
    fontSize: 14,
    color: colors.lavender,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  moreButton: {
    padding: spacing.xs,
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
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
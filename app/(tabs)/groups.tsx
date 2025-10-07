import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Plus, Users, UserPlus, Calendar, X, Check } from 'lucide-react-native';
import { useAppStore } from '@/store/app-store';
import { ClayCard } from '@/components/ClayCard';
import { ClayButton } from '@/components/ClayButton';
import { colors, spacing } from '@/constants/theme';
import {
  getGroupMatches,
  createGroupMatch,
  getMatchesByUser,
  getUserById,
  createGroupInvitation,
  calculateGroupCompatibility,
  generateViewingTimes,
  createViewingProposal
} from '@/services/data';
import { GroupMatch, Match, User } from '@/types';
import { router } from 'expo-router';

interface GroupWithDetails extends GroupMatch {
  members: User[];
  compatibility: number;
}

interface MatchWithUser extends Match {
  otherUser: User;
}

export default function GroupsScreen() {
  const { currentUser } = useAppStore();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(null);
  const [availableMatches, setAvailableMatches] = useState<MatchWithUser[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  useEffect(() => {
    loadGroups();
  }, [currentUser]);

  const loadGroups = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const userGroups = await getGroupMatches(currentUser.id);
      
      const groupsWithDetails = await Promise.all(
        userGroups.map(async (group) => {
          const members = await Promise.all(
            group.users.map(userId => getUserById(userId))
          );
          
          const validMembers = members.filter(Boolean) as User[];
          const compatibility = await calculateGroupCompatibility(group.users);
          
          return {
            ...group,
            members: validMembers,
            compatibility
          };
        })
      );
      
      setGroups(groupsWithDetails);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMatches = async () => {
    if (!currentUser) return;
    
    try {
      const matches = await getMatchesByUser(currentUser.id);
      const regularMatches = matches.filter(m => m.users.length === 2);
      
      const matchesWithUsers = await Promise.all(
        regularMatches.map(async (match) => {
          const otherUserId = match.users.find(id => id !== currentUser.id);
          if (!otherUserId) return null;
          
          const otherUser = await getUserById(otherUserId);
          if (!otherUser) return null;
          
          return {
            ...match,
            otherUser
          };
        })
      );
      
      setAvailableMatches(matchesWithUsers.filter(Boolean) as MatchWithUser[]);
    } catch (error) {
      console.error('Failed to load available matches:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!currentUser || !newGroupName.trim() || selectedMatches.length === 0) {
      Alert.alert('Error', 'Please enter a group name and select at least one match.');
      return;
    }

    try {
      const selectedUserIds = selectedMatches.map(matchId => {
        const match = availableMatches.find(m => m.id === matchId);
        return match?.otherUser.id;
      }).filter(Boolean) as string[];
      
      const groupUsers = [currentUser.id, ...selectedUserIds];
      
      const newGroup = await createGroupMatch({
        users: groupUsers,
        groupName: newGroupName.trim(),
        createdBy: currentUser.id
      });
      
      // Send invitations to other users
      await Promise.all(
        selectedUserIds.map(userId => 
          createGroupInvitation({
            groupId: newGroup.id,
            inviterId: currentUser.id,
            inviteeId: userId,
            status: 'pending'
          })
        )
      );
      
      setShowCreateModal(false);
      setNewGroupName('');
      setSelectedMatches([]);
      loadGroups();
      
      Alert.alert('Success', 'Group created! Invitations sent to selected matches.');
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  const handleProposeViewingTimes = async (group: GroupWithDetails) => {
    if (!currentUser) return;
    
    try {
      const suggestedTimes = await generateViewingTimes(group.users);
      
      const proposedTimes = suggestedTimes.map(timeStr => ({
        datetime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'TBD',
        notes: timeStr
      }));
      
      await createViewingProposal({
        matchId: group.id,
        proposedBy: currentUser.id,
        proposedTimes
      });
      
      Alert.alert('Success', 'Viewing times proposed! Group members will be notified.');
    } catch (error) {
      console.error('Failed to propose viewing times:', error);
      Alert.alert('Error', 'Failed to propose viewing times.');
    }
  };

  const renderGroup = ({ item }: { item: GroupWithDetails }) => {
    return (
      <TouchableOpacity onPress={() => router.push(`/chat/${item.id}`)}>
        <ClayCard style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.groupName}</Text>
              <Text style={styles.groupMembers}>
                {item.memberCount} members • {item.compatibility}% compatibility
              </Text>
            </View>
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>{item.compatibility}%</Text>
            </View>
          </View>
          
          <View style={styles.membersRow}>
            {item.members.slice(0, 4).map((member, index) => (
              <Image
                key={member.id}
                source={{ uri: member.photos[0] }}
                style={[
                  styles.memberAvatar,
                  { marginLeft: index > 0 ? -8 : 0 }
                ]}
              />
            ))}
            {item.memberCount > 4 && (
              <View style={[styles.memberAvatar, styles.moreMembers]}>
                <Text style={styles.moreMembersText}>+{item.memberCount - 4}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.groupActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleProposeViewingTimes(item)}
            >
              <Calendar color={colors.lavender} size={16} />
              <Text style={styles.actionButtonText}>Propose Times</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedGroup(item);
                setShowInviteModal(true);
                loadAvailableMatches();
              }}
            >
              <UserPlus color={colors.lavender} size={16} />
              <Text style={styles.actionButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
        </ClayCard>
      </TouchableOpacity>
    );
  };

  const renderCreateGroupModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <X color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Group</Text>
          <TouchableOpacity onPress={handleCreateGroup}>
            <Check color={colors.lavender} size={24} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <TextInput
            style={styles.textInput}
            value={newGroupName}
            onChangeText={setNewGroupName}
            placeholder="Enter group name..."
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={styles.sectionTitle}>Select Matches to Invite</Text>
          {availableMatches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={[
                styles.matchItem,
                selectedMatches.includes(match.id) && styles.selectedMatchItem
              ]}
              onPress={() => {
                if (selectedMatches.includes(match.id)) {
                  setSelectedMatches(prev => prev.filter(id => id !== match.id));
                } else {
                  setSelectedMatches(prev => [...prev, match.id]);
                }
              }}
            >
              <Image source={{ uri: match.otherUser.photos[0] }} style={styles.matchAvatar} />
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.otherUser.firstName}</Text>
                <Text style={styles.matchUniversity}>{match.otherUser.university}</Text>
              </View>
              {selectedMatches.includes(match.id) && (
                <Check color={colors.lavender} size={20} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Group Matching</Text>
        <Text style={styles.headerSubtitle}>
          Find roommates together with 2-5 people
        </Text>
      </View>
      
      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Users color={colors.textSecondary} size={64} />
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a group with your matches to find housing together!
          </Text>
          
          <ClayButton
            title="Create Your First Group"
            onPress={() => {
              setShowCreateModal(true);
              loadAvailableMatches();
            }}
            style={styles.createButton}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={groups}
            renderItem={renderGroup}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setShowCreateModal(true);
              loadAvailableMatches();
            }}
          >
            <Plus color={colors.white} size={24} />
          </TouchableOpacity>
        </>
      )}
      
      {renderCreateGroupModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    paddingBottom: 100,
  },
  groupCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  compatibilityBadge: {
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
  },
  moreMembers: {
    backgroundColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.mint + '20',
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.lavender,
    marginLeft: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lavender,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    marginBottom: spacing.xl,
  },
  createButton: {
    paddingHorizontal: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.textSecondary + '30',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  selectedMatchItem: {
    backgroundColor: colors.mint + '20',
  },
  matchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  matchUniversity: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
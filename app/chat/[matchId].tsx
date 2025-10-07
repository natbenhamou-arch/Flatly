import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Modal,
  ToastAndroid,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Send, Image as ImageIcon, Lightbulb, MoreVertical, Calendar, Users, Flag, Shield, X, Check } from 'lucide-react-native';
import { useAppStore, useMessages } from '@/store/app-store';
import { ClayCard } from '@/components/ClayCard';
import { ClayButton } from '@/components/ClayButton';
import { colors, spacing, radius } from '@/constants/theme';
import { generateChatOpeners } from '@/services/ai';
import { 
  getUserById, 
  getLifestyleByUserId, 
  getMatches,
  generateViewingTimes,
  createViewingProposal,
  getUsers,
  createGroupMatch,
  getHousingByUserId,
} from '@/services/data';
import { recordReport, blockUser } from '@/services/report';
import { User, Lifestyle, Message, Match, GroupMatch, FeedUser } from '@/types';
import { displayName } from '@/utils/format';
import { ProfileDetailModal } from '@/components/ProfileDetailModal';
import { useToast } from '@/components/Toast';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { currentUser, sendMessage } = useAppStore();
  const { messages, loading } = useMessages(matchId || '');
  const { showToast } = useToast();
  
  const [inputText, setInputText] = useState<string>('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [matchData, setMatchData] = useState<Match | GroupMatch | null>(null);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [smartOpeners, setSmartOpeners] = useState<string[]>([]);
  const [showOpeners, setShowOpeners] = useState<boolean>(false);
  const [loadingOpeners, setLoadingOpeners] = useState<boolean>(false);
  const [proposingTimes, setProposingTimes] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [sendWarning, setSendWarning] = useState<string>('');
  const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false);
  const [groupCandidates, setGroupCandidates] = useState<FeedUser[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<FeedUser | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);
  const [profileUser, setProfileUser] = useState<FeedUser | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [showReportInput, setShowReportInput] = useState<boolean>(false);
  const [showSafetyBanner, setShowSafetyBanner] = useState<boolean>(true);
  const [optimistic, setOptimistic] = useState<Message[]>([]);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  useEffect(() => {
    if (messages.length === 0 && otherUser && currentUser) {
      setShowOpeners(true);
    }
  }, [messages, otherUser, currentUser]);

  const loadMatchData = async () => {
    if (!matchId || !currentUser) return;
    
    try {
      const matches = await getMatches();
      const match = matches.find(m => m.id === matchId);
      
      if (!match) {
        console.error('Match not found');
        return;
      }
      
      setMatchData(match);
      
      if (match.users.length === 2) {
        // Regular 1-on-1 match
        const otherUserId = match.users.find(id => id !== currentUser.id);
        if (otherUserId) {
          const user = await getUserById(otherUserId);
          if (user) {
            setOtherUser(user);
          }
        }
      } else {
        // Group match
        const members = await Promise.all(
          match.users
            .filter(id => id !== currentUser.id)
            .map(id => getUserById(id))
        );
        const validMembers = members.filter(Boolean) as User[];
        setGroupMembers(validMembers);
        
        // Set first member as "other user" for header display
        if (validMembers.length > 0) {
          setOtherUser(validMembers[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load match data:', error);
    }
  };

  const loadSmartOpeners = async () => {
    if (!currentUser || !otherUser) return;
    
    setLoadingOpeners(true);
    try {
      const [currentLifestyle, targetLifestyle] = await Promise.all([
        getLifestyleByUserId(currentUser.id),
        getLifestyleByUserId(otherUser.id)
      ]);
      
      const openers = await generateChatOpeners({
        currentUser,
        targetUser: otherUser,
        currentLifestyle: currentLifestyle || undefined,
        targetLifestyle: targetLifestyle || undefined
      });
      
      setSmartOpeners(openers);
    } catch (error) {
      console.error('Failed to load smart openers:', error);
      setSmartOpeners([
        'Hey! How\'s your day going?',
        'Hi there! What\'s your favorite thing about being a student?',
        'Hello! What are you looking for in a roommate?'
      ]);
    } finally {
      setLoadingOpeners(false);
    }
  };

  const handleSendMessage = async () => {
    if (!matchId) return;
    const text = inputText.trim();
    if (!text) {
      setSendWarning('Type something to send');
      if (Platform.OS === 'android') {
        ToastAndroid.show('Type a message first', ToastAndroid.SHORT);
      } else {
        showToast('Type a message first', 'error');
      }
      setTimeout(() => setSendWarning(''), 1500);
      return;
    }
    const temp: Message = {
      id: `local-${Date.now()}`,
      matchId: matchId,
      senderId: currentUser?.id || 'me',
      body: text,
      createdAt: new Date().toISOString(),
    } as Message;
    setOptimistic((prev) => [...prev, temp]);
    setInputText('');
    setShowOpeners(false);
    setSendWarning('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
    try {
      await sendMessage(matchId, text);
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Message failed to send', 'error');
    }
    
  };

  const handleOpenerSelect = (opener: string) => {
    setInputText(opener);
    setShowOpeners(false);
  };
  
  const handleProposeViewingTimes = async () => {
    if (!matchData || !currentUser) return;
    
    setProposingTimes(true);
    try {
      const suggestedTimes = await generateViewingTimes(matchData.users);
      
      const proposedTimes = suggestedTimes.map(timeStr => ({
        datetime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'TBD',
        notes: timeStr
      }));
      
      await createViewingProposal({
        matchId: matchData.id,
        proposedBy: currentUser.id,
        proposedTimes
      });
      
      // Send a system message about the proposal
      await sendMessage(matchId || '', `📅 Viewing times proposed: ${suggestedTimes.join(', ')}`);
      
      Alert.alert('Success', 'Viewing times proposed! Everyone will be notified.');
    } catch (error) {
      console.error('Failed to propose viewing times:', error);
      Alert.alert('Error', 'Failed to propose viewing times.');
    } finally {
      setProposingTimes(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReport = () => {
    setShowMenu(false);
    setShowReportInput(true);
  };

  const submitReport = async () => {
    if (!currentUser || !otherUser || !reportReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for reporting.');
      return;
    }

    try {
      await recordReport(currentUser.id, otherUser.id, reportReason.trim());
      setShowReportInput(false);
      setReportReason('');
      Alert.alert('Report Submitted', 'Thank you for your report. We\'ll review it shortly.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const handleBlock = () => {
    setShowMenu(false);
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user? You won\'t see them again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser || !otherUser) return;
            
            try {
              await blockUser(currentUser.id, otherUser.id);
              Alert.alert('User Blocked', 'You won\'t see this user again.');
              router.back();
            } catch (error) {
              console.error('Failed to block user:', error);
              Alert.alert('Error', 'Failed to block user. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUser?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <ClayCard style={[
          styles.messageCard,
          isCurrentUser ? styles.currentUserCard : styles.otherUserCard
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.body}
          </Text>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          )}
        </ClayCard>
        <Text style={styles.messageTime}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  const renderSafetyBanner = () => {
    if (!showSafetyBanner) return null;
    
    const isGroup = matchData?.users.length && matchData.users.length > 2;
    return (
      <View style={styles.safetyBannerContainer}>
        <ClayCard style={styles.safetyBanner}>
          <View style={styles.safetyBannerContent}>
            <Shield size={16} color={colors.mint} />
            <Text style={styles.safetyBannerText}>
              Safety tip: Never send money or deposits before viewing the place.
            </Text>
            <TouchableOpacity 
              onPress={() => setShowSafetyBanner(false)}
              style={styles.safetyBannerClose}
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {isGroup && (
            <View style={{ marginTop: spacing.xs }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Participants:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {groupMembers.map((m) => (
                  <View key={m.id} style={{ backgroundColor: colors.softLilac, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 12 }}>{displayName(m.firstName, m.lastName)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ClayCard>
      </View>
    );
  };

  const renderSmartOpeners = () => {
    if (!showOpeners) return null;
    
    return (
      <View style={styles.openersContainer}>
        <ClayCard style={styles.openersCard}>
          <View style={styles.openersHeader}>
            <Lightbulb color={colors.lavender} size={20} />
            <Text style={styles.openersTitle}>Smart Openers</Text>
            {smartOpeners.length === 0 && (
              <TouchableOpacity 
                onPress={loadSmartOpeners}
                disabled={loadingOpeners}
                style={styles.generateButton}
              >
                <Text style={styles.generateButtonText}>
                  {loadingOpeners ? 'Loading...' : 'Generate'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {smartOpeners.map((opener, index) => (
            <TouchableOpacity
              key={index}
              style={styles.openerItem}
              onPress={() => handleOpenerSelect(opener)}
            >
              <Text style={styles.openerText}>{opener}</Text>
            </TouchableOpacity>
          ))}
        </ClayCard>
      </View>
    );
  };

  const openHeaderProfile = async () => {
    try {
      if (!otherUser) return;
      const [housing, lifestyle] = await Promise.all([
        getHousingByUserId(otherUser.id),
        getLifestyleByUserId(otherUser.id)
      ]);
      const feedUser: FeedUser = {
        ...otherUser,
        housing: housing || undefined,
        lifestyle: lifestyle || undefined,
      } as FeedUser;
      setProfileUser(feedUser);
      setProfileModalVisible(true);
    } catch (e) {
      console.log('Failed to open profile', e);
    }
  };

  const prepareCreateGroup = async () => {
    try {
      if (!currentUser || !otherUser) return;
      const all = await getUsers();
      const pool = all.filter(u => u.id !== currentUser.id && u.id !== otherUser.id && u.city === otherUser.city && u.photos && u.photos.length > 0);
      const candidates: FeedUser[] = pool.map(u => ({ ...u } as FeedUser));
      setGroupCandidates(candidates);
      setSelectedCandidate(candidates[0] || null);
      setShowCreateGroup(true);
    } catch (e) {
      console.log('Failed to load candidates', e);
      Alert.alert('Error', 'Could not load candidates.');
    }
  };

  const confirmCreateGroup = async () => {
    try {
      if (!currentUser || !otherUser || !selectedCandidate) return;
      const group = await createGroupMatch({
        users: [currentUser.id, otherUser.id, selectedCandidate.id],
        groupName: `${displayName(currentUser.firstName, currentUser.lastName).split(' ')[0]}'s Group`,
        createdBy: currentUser.id,
      });
      await sendMessage(group.id, 'System: Group created');
      setShowCreateGroup(false);
      router.replace(`/chat/${group.id}`);
    } catch (e) {
      console.log('Create group failed', e);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  if (!matchData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }
  
  const isGroupChat = matchData.users.length > 2;
  const headerTitle = isGroupChat 
    ? (matchData as GroupMatch).groupName || `Group (${matchData.users.length})`
    : otherUser 
      ? `${displayName(otherUser.firstName, otherUser.lastName)}, ${new Date().getFullYear() - new Date(otherUser.birthdate).getFullYear()}`
      : 'Chat';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{
          title: headerTitle,
          headerTitle: () => (
            <TouchableOpacity onPress={openHeaderProfile} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {otherUser?.photos?.[0] ? (
                <Image source={{ uri: otherUser.photos[0] }} style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8 }} />
              ) : null}
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{headerTitle}</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              {isGroupChat && (
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleProposeViewingTimes}
                  disabled={proposingTimes}
                >
                  <Calendar color={proposingTimes ? colors.textSecondary : colors.lavender} size={20} />
                </TouchableOpacity>
              )}
              {!isGroupChat && (
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={prepareCreateGroup}
                >
                  <Users color={colors.textPrimary} size={22} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowMenu(true)}
              >
                <MoreVertical color={colors.textPrimary} size={24} />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      <FlatList
        ref={flatListRef}
        data={[...messages, ...optimistic]}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={renderSafetyBanner}
      />
      
      {renderSmartOpeners()}
      
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <ClayCard style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                <Flag size={20} color={colors.textPrimary} />
                <Text style={styles.menuItemText}>Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
                <Shield size={20} color={colors.danger} />
                <Text style={[styles.menuItemText, { color: colors.danger }]}>Block</Text>
              </TouchableOpacity>
            </ClayCard>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <Modal
        visible={showReportInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportInput(false)}
      >
        <View style={styles.reportModalOverlay}>
          <ClayCard style={styles.reportModal}>
            <Text style={styles.reportModalTitle}>Why are you reporting this user?</Text>
            <TextInput
              style={styles.reportInput}
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Please describe the issue..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
            />
            <View style={styles.reportModalActions}>
              <ClayButton
                title="Cancel"
                onPress={() => {
                  setShowReportInput(false);
                  setReportReason('');
                }}
                variant="secondary"
                style={styles.reportModalButton}
              />
              <ClayButton
                title="Submit Report"
                onPress={submitReport}
                variant="danger"
                style={styles.reportModalButton}
              />
            </View>
          </ClayCard>
        </View>
      </Modal>
      
      <View style={styles.inputContainer}>
        <ClayCard style={styles.inputCard}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.imageButton}>
              <ImageIcon color={colors.textSecondary} size={24} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              testID="chat-input"
            />
            
            {!showOpeners && smartOpeners.length === 0 && !isGroupChat && (
              <TouchableOpacity 
                style={styles.openersButton}
                onPress={() => {
                  setShowOpeners(true);
                  if (smartOpeners.length === 0) {
                    loadSmartOpeners();
                  }
                }}
                testID="openers-button"
              >
                <Lightbulb color={colors.lavender} size={20} />
              </TouchableOpacity>
            )}
            
            {isGroupChat && (
              <TouchableOpacity 
                style={styles.openersButton}
                onPress={handleProposeViewingTimes}
                disabled={proposingTimes}
                testID="propose-times"
              >
                <Calendar color={proposingTimes ? colors.textSecondary : colors.lavender} size={20} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSendMessage}
              testID="send-button"
            >
              <Send 
                color={inputText.trim() ? colors.white : colors.textSecondary} 
                size={20} 
              />
            </TouchableOpacity>
          </View>
          {sendWarning ? (
            <Text style={styles.sendWarning} testID="send-warning">{sendWarning}</Text>
          ) : null}
        </ClayCard>
      </View>
      <ProfileDetailModal
        user={profileUser}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      <Modal visible={showCreateGroup} transparent animationType="slide" onRequestClose={() => setShowCreateGroup(false)}>
        <View style={styles.groupOverlay}>
          <ClayCard style={styles.groupCard}>
            <Text style={styles.groupTitle}>Create a group</Text>
            <Text style={styles.groupSubtitle}>Pick someone to add</Text>
            <View style={{ maxHeight: 260 }}>
              <FlatList
                data={groupCandidates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setSelectedCandidate(item)} style={styles.candidateRow}>
                    <Image source={{ uri: item.photos[0] }} style={styles.candidateAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.candidateName}>{displayName(item.firstName, item.lastName)}, {item.age}</Text>
                      <Text style={styles.candidateMeta}>{item.city} • {item.university}</Text>
                    </View>
                    {selectedCandidate?.id === item.id && <Check size={20} color={colors.lavender} />}
                  </TouchableOpacity>
                )}
              />
            </View>
            <View style={styles.groupActions}>
              <ClayButton title="Cancel" variant="secondary" onPress={() => setShowCreateGroup(false)} style={{ flex: 1 }} />
              <ClayButton title="Create" variant="primary" onPress={confirmCreateGroup} style={{ flex: 1 }} testID="create-group" />
            </View>
          </ClayCard>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageContainer: {
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currentUserCard: {
    backgroundColor: colors.lavender,
  },
  otherUserCard: {
    backgroundColor: colors.white,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: colors.white,
  },
  otherUserText: {
    color: colors.textPrimary,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  openersContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  openersCard: {
    padding: spacing.md,
  },
  openersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  openersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  generateButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.lavender,
    borderRadius: 12,
  },
  generateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  openerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.mint + '20',
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  openerText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  inputCard: {
    padding: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imageButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  openersButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  sendButton: {
    padding: spacing.sm,
    borderRadius: 20,
    marginLeft: spacing.xs,
  },
  sendButtonActive: {
    backgroundColor: colors.lavender,
  },
  sendButtonInactive: {
    backgroundColor: colors.background,
  },
  sendWarning: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: spacing.sm,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: 100,
    marginRight: spacing.md,
  },
  menuCard: {
    padding: spacing.xs,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  reportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  reportModal: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  reportModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  reportInput: {
    borderWidth: 1,
    borderColor: colors.softLilac,
    borderRadius: radius.medium,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  reportModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reportModalButton: {
    flex: 1,
  },
  safetyBannerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  safetyBanner: {
    backgroundColor: colors.mint + '15',
    borderWidth: 1,
    borderColor: colors.mint + '30',
    padding: spacing.sm,
  },
  safetyBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  safetyBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  safetyBannerClose: {
    padding: spacing.xs,
  },
  groupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  groupCard: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.lg,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  groupSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  candidateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  candidateName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  candidateMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  groupActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
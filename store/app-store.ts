import React from 'react';
import { create } from 'zustand';
import { User, FeedUser, Match, Message, FeatureFlags, Swipe } from '@/types';
import { 
  getCurrentUser, setCurrentUserId, getFeedUsers, addSwipe, 
  getMatchesByUser, createMatch, getMessagesByMatch, sendMessage as sendMessageData,
  getFeatureFlags, seedData
} from '@/services/data';
import { restoreSession, signOut } from '@/services/auth';
import { setupDemoWorld } from '@/services/demo';
import { computeCompatibility } from '@/services/compatibility';


interface OnboardingPartialUser {
  firstName?: string;
  birthdate?: string;
  age?: number;
  phone?: string;
  email?: string;
  emailVerified?: boolean;
  gender?: string;
  university?: string;
  city?: string;
  country?: string;
  geo?: { lat: number; lng: number };
  job?: string;
  hasRoom?: boolean;
  shortBio?: string;
  photos?: string[];
  instagramUrl?: string;
  igUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  autoMatchMessage?: string;
  sendAutoMatchMessage?: boolean;
  lifestyle?: Partial<import('@/types').Lifestyle>;
  housing?: Partial<import('@/types').Housing>;
  preferences?: Partial<import('@/types').Preferences>;
  recommendationCode?: string;
  useRecommendationCode?: boolean;
}

interface AppState {
  // Core state
  currentUser: User | null;
  feedUsers: FeedUser[];
  matches: Match[];
  featureFlags: FeatureFlags;
  onboardingUser: OnboardingPartialUser | null;
  hasCompletedOnboarding: boolean;
  
  // Loading states
  isLoading: boolean;
  feedLoading: boolean;
  
  // Match animation state
  showMatchAnimation: boolean;
  matchedUserName: string;
  lastCreatedMatchId: string | null;
  
  // Actions
  initializeApp: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  signOut: () => Promise<void>;
  setUserOnboardingPartial: (data: OnboardingPartialUser) => void;
  updateOnboardingUser: (updates: OnboardingPartialUser) => void;
  clearOnboardingUser: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  swipeUser: (targetUser: FeedUser, action: 'like' | 'pass' | 'superlike') => Promise<Match | null>;
  refreshFeed: () => Promise<void>;
  loadMatches: () => Promise<void>;
  sendMessage: (matchId: string, body: string) => Promise<void>;
  blockMatch: (matchId: string) => void;
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  triggerMatchAnimation: (userName: string) => void;
  hideMatchAnimation: () => void;
  consumeLastCreatedMatchId: () => string | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  feedUsers: [],
  matches: [],
  featureFlags: {
    superLikesEnabled: true,
    boostsEnabled: true,
    groupMatchingEnabled: true,
    aiOpenerEnabled: true,
    cityGateLoose: false,
    demoMode: true
  },
  onboardingUser: null,
  hasCompletedOnboarding: false,
  isLoading: false,
  feedLoading: false,
  showMatchAnimation: false,
  matchedUserName: '',
  lastCreatedMatchId: null,

  // Initialize app with data
  initializeApp: async () => {
    set({ isLoading: true });
    try {
      console.log('Initializing FlatMatch app...');
      
      // Try to restore session first
      const sessionResult = await restoreSession();
      let currentUser = sessionResult.user || null;
      
      // If no session, try legacy current user method
      if (!currentUser) {
        currentUser = await getCurrentUser();
      }
      
      // Check if user has completed onboarding
      let hasCompletedOnboarding = false;
      if (currentUser) {
        // Check if user has preferences set (indicates completed onboarding)
        try {
          const { getPreferencesByUserId } = await import('@/services/data');
          const preferences = await getPreferencesByUserId(currentUser.id);
          hasCompletedOnboarding = !!preferences;
        } catch (error) {
          console.log('Could not check preferences, assuming onboarding not completed');
        }
      }
      
      // Seed data if needed
      await seedData();
      
      // Load feature flags
      const featureFlags = await getFeatureFlags();
      
      set({ 
        currentUser, 
        featureFlags,
        hasCompletedOnboarding,
        isLoading: false 
      });
      
      // Prepare demo world and load initial data if user exists and has completed onboarding
      if (currentUser && hasCompletedOnboarding) {
        try {
          await setupDemoWorld(currentUser.id);
        } catch (e) {
          console.log('Demo setup error during init', e);
        }
        await Promise.all([
          get().refreshFeed(),
          get().loadMatches()
        ]);
      }
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ isLoading: false });
    }
  },

  setCurrentUser: async (user) => {
    set({ currentUser: user });
    await setCurrentUserId(user.id);
    
    const { hasCompletedOnboarding } = get();
    if (hasCompletedOnboarding) {
      try {
        await setupDemoWorld(user.id);
      } catch (e) {
        console.log('Demo setup error after login', e);
      }
      await Promise.all([
        get().refreshFeed(),
        get().loadMatches()
      ]);
    }
  },

  updateCurrentUser: (updates) => {
    const { currentUser } = get();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      set({ currentUser: updatedUser });
    }
  },

  swipeUser: async (targetUser, action) => {
    const { currentUser, feedUsers } = get();
    if (!currentUser) return null;

    try {
      const swipe: Swipe = {
        swiperId: currentUser.id,
        targetId: targetUser.id,
        action,
        createdAt: new Date().toISOString()
      };
      await addSwipe(swipe);

      set({ feedUsers: feedUsers.filter(u => u.id !== targetUser.id) });

      if (action === 'like' || action === 'superlike') {
        const shouldMatch = Math.random() > 0.7;
        if (shouldMatch) {
          const match = await createMatch({ users: [currentUser.id, targetUser.id], blocked: false });
          set({ lastCreatedMatchId: match.id });
          get().triggerMatchAnimation(targetUser.firstName);
          
          if (currentUser.sendAutoMatchMessage !== false) {
            try {
              const message = currentUser.autoMatchMessage || 'Hi! Nice to meet you 👋';
              await sendMessageData({
                matchId: match.id,
                senderId: currentUser.id,
                body: message
              });
            } catch (e) {
              console.log('Auto-greeting failed', e);
            }
          }
          
          await get().loadMatches();
          console.log('New match created!', match.id);
          return match;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to swipe user:', error);
      return null;
    }
  },

  refreshFeed: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    set({ feedLoading: true });
    try {
      const feedUsers = await getFeedUsers(currentUser.id, 20);
      let visibleUsers = feedUsers;
      // Filter banned users if feature store is available
      try {
        const { useFeatureStore } = await import('./useAppStore');
        const featureStore = useFeatureStore.getState();
        if (featureStore && typeof featureStore.isBanned === 'function') {
          visibleUsers = feedUsers.filter((u) => !featureStore.isBanned(u.id));
        }
      } catch (e) {
        console.log('Banned user filter unavailable, proceeding without it');
      }
      
      // Add compatibility scores
      const feedWithCompatibility = await Promise.all(
        visibleUsers.map(async (user) => {
          const compatibility = computeCompatibility({
            currentUser,
            targetUser: user,
            currentLifestyle: user.lifestyle,
            targetLifestyle: user.lifestyle,
            currentHousing: user.housing,
            targetHousing: user.housing
          });
          
          return {
            ...user,
            compatibility
          };
        })
      );
      
      // Sort by compatibility score
      feedWithCompatibility.sort((a, b) => 
        (b.compatibility?.score || 0) - (a.compatibility?.score || 0)
      );
      
      set({ 
        feedUsers: feedWithCompatibility,
        feedLoading: false 
      });
      
    } catch (error) {
      console.error('Failed to refresh feed:', error);
      set({ feedLoading: false });
    }
  },

  loadMatches: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    try {
      const matches = await getMatchesByUser(currentUser.id);
      set({ matches });
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  },

  sendMessage: async (matchId, body) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    try {
      await sendMessageData({
        matchId,
        senderId: currentUser.id,
        body
      });
      
      // Reload matches to update last message
      await get().loadMatches();
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  blockMatch: (matchId) => {
    set({
      matches: get().matches.map(m => 
        m.id === matchId ? { ...m, blocked: true } : m
      )
    });
  },

  updateFeatureFlags: (flags) => {
    set({ 
      featureFlags: { ...get().featureFlags, ...flags } 
    });
  },

  setUserOnboardingPartial: (data) => {
    console.log('Setting onboarding user data:', data);
    set({ onboardingUser: data });
  },

  updateOnboardingUser: (updates) => {
    const { onboardingUser } = get();
    set({ 
      onboardingUser: { ...onboardingUser, ...updates } 
    });
  },

  clearOnboardingUser: () => {
    set({ onboardingUser: null });
  },

  triggerMatchAnimation: (userName: string) => {
    set({ 
      showMatchAnimation: true, 
      matchedUserName: userName 
    });
  },

  hideMatchAnimation: () => {
    set({ 
      showMatchAnimation: false, 
      matchedUserName: '' 
    });
  },

  consumeLastCreatedMatchId: () => {
    const id = get().lastCreatedMatchId;
    set({ lastCreatedMatchId: null });
    return id || null;
  },

  setOnboardingCompleted: (completed: boolean) => {
    set({ hasCompletedOnboarding: completed });
    if (completed) {
      const { currentUser, refreshFeed, loadMatches } = get();
      if (currentUser) {
        (async () => {
          try {
            await setupDemoWorld(currentUser.id);
          } catch (e) {
            console.log('Demo setup error after onboarding', e);
          }
          await Promise.all([
            refreshFeed(),
            loadMatches()
          ]);
        })();
      }
    }
  },

  signOut: async () => {
    try {
      await signOut();
      set({ 
        currentUser: null,
        feedUsers: [],
        matches: [],
        onboardingUser: null,
        hasCompletedOnboarding: false
      });
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
}));

// Helper hook for getting messages for a specific match
export const useMessages = (matchId: string) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const matchMessages = await getMessagesByMatch(matchId);
        setMessages(matchMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (matchId) {
      loadMessages();
    }
  }, [matchId]);
  
  return { messages, loading };
};


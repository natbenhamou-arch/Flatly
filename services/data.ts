import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User, Lifestyle, Housing, Preferences, Swipe, Match, Message,
  Report, FeatureFlags, FeedUser, GroupMatch, GroupInvitation,
  ViewingProposal, Availability
} from '@/types';
import { computeCompatibility } from '@/services/compatibility';
import { getReports as getInMemoryReports } from '@/services/report';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'flatmatch_users',
  LIFESTYLES: 'flatmatch_lifestyles',
  HOUSING: 'flatmatch_housing',
  PREFERENCES: 'flatmatch_preferences',
  SWIPES: 'flatmatch_swipes',
  MATCHES: 'flatmatch_matches',
  MESSAGES: 'flatmatch_messages',
  REPORTS: 'flatmatch_reports',
  AVAILABILITY: 'flatmatch_availability',
  GROUP_INVITATIONS: 'flatmatch_group_invitations',
  VIEWING_PROPOSALS: 'flatmatch_viewing_proposals',
  FEATURE_FLAGS: 'flatmatch_feature_flags',
  ANALYTICS: 'flatmatch_analytics',
  ADMIN_NOTES: 'flatmatch_admin_notes',
  SAVED_SEARCHES: 'flatmatch_saved_searches',
  NOTIFICATIONS: 'flatmatch_notifications',
  CURRENT_USER_ID: 'flatmatch_current_user_id'
} as const;

// In-memory cache for performance
class DataCache {
  private cache = new Map<string, any>();
  private lastUpdated = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, data);
    this.lastUpdated.set(key, Date.now());
  }

  get(key: string): any | null {
    const lastUpdate = this.lastUpdated.get(key);
    if (!lastUpdate || Date.now() - lastUpdate > this.CACHE_TTL) {
      this.cache.delete(key);
      this.lastUpdated.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  clear(): void {
    this.cache.clear();
    this.lastUpdated.clear();
  }
}

const cache = new DataCache();

// Generic storage helpers
async function getStorageData<T>(key: string): Promise<T[]> {
  try {
    const cached = cache.get(key);
    if (cached) return cached;

    const data = await AsyncStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : [];
    cache.set(key, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return [];
  }
}

async function setStorageData<T>(key: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    cache.set(key, data);
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
  }
}

// User Management
export async function getUsers(): Promise<User[]> {
  return getStorageData<User>(STORAGE_KEYS.USERS);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

function normalizeInstagram(input?: string): string | undefined {
  if (!input) return undefined;
  let handle = input.trim();
  if (!handle) return undefined;
  if (handle.startsWith('http')) {
    try { return new URL(handle).toString(); } catch { /* noop */ }
  }
  handle = handle.replace(/^@+/, '');
  handle = handle.replace(/^instagram\.com\//i, '');
  handle = handle.replace(/^www\.instagram\.com\//i, '');
  return `https://instagram.com/${handle}`;
}

function normalizeLinkedIn(input?: string): string | undefined {
  if (!input) return undefined;
  let v = input.trim();
  if (!v) return undefined;
  if (v.startsWith('http')) {
    try { return new URL(v).toString(); } catch { /* noop */ }
  }
  v = v.replace(/^@+/, '');
  v = v.replace(/^linkedin\.com\//i, '');
  v = v.replace(/^www\.linkedin\.com\//i, '');
  // Assume it's an /in/ profile if just a handle
  if (!v.startsWith('in/') && !v.startsWith('company/') && !v.startsWith('school/')) {
    v = `in/${v}`;
  }
  return `https://www.linkedin.com/${v}`;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const users = await getUsers();
  const newUser: User = {
    ...user,
    igUrl: normalizeInstagram(user.igUrl),
    linkedinUrl: normalizeLinkedIn(user.linkedinUrl),
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  await setStorageData(STORAGE_KEYS.USERS, [...users, newUser]);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  const normalized: Partial<User> = { ...updates };
  if (Object.prototype.hasOwnProperty.call(updates, 'igUrl')) {
    normalized.igUrl = normalizeInstagram(updates.igUrl);
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'linkedinUrl')) {
    normalized.linkedinUrl = normalizeLinkedIn(updates.linkedinUrl);
  }
  const updatedUser = { ...users[index], ...normalized } as User;
  users[index] = updatedUser;
  
  await setStorageData(STORAGE_KEYS.USERS, users);
  return updatedUser;
}

// Lifestyle Management
export async function getLifestyles(): Promise<Lifestyle[]> {
  return getStorageData<Lifestyle>(STORAGE_KEYS.LIFESTYLES);
}

export async function getLifestyleByUserId(userId: string): Promise<Lifestyle | null> {
  const lifestyles = await getLifestyles();
  return lifestyles.find(l => l.userId === userId) || null;
}

export async function setLifestyle(lifestyle: Lifestyle): Promise<void> {
  const lifestyles = await getLifestyles();
  const index = lifestyles.findIndex(l => l.userId === lifestyle.userId);
  
  if (index >= 0) {
    lifestyles[index] = lifestyle;
  } else {
    lifestyles.push(lifestyle);
  }
  
  await setStorageData(STORAGE_KEYS.LIFESTYLES, lifestyles);
}

// Housing Management
export async function getHousing(): Promise<Housing[]> {
  return getStorageData<Housing>(STORAGE_KEYS.HOUSING);
}

export async function getHousingByUserId(userId: string): Promise<Housing | null> {
  const housing = await getHousing();
  return housing.find(h => h.userId === userId) || null;
}

export async function setHousing(housing: Housing): Promise<void> {
  const housings = await getHousing();
  const index = housings.findIndex(h => h.userId === housing.userId);
  
  if (index >= 0) {
    housings[index] = housing;
  } else {
    housings.push(housing);
  }
  
  await setStorageData(STORAGE_KEYS.HOUSING, housings);
}

// Preferences Management
export async function getPreferences(): Promise<Preferences[]> {
  return getStorageData<Preferences>(STORAGE_KEYS.PREFERENCES);
}

export async function getPreferencesByUserId(userId: string): Promise<Preferences | null> {
  const preferences = await getPreferences();
  return preferences.find(p => p.userId === userId) || null;
}

export async function setPreferences(preferences: Preferences): Promise<void> {
  const prefs = await getPreferences();
  const index = prefs.findIndex(p => p.userId === preferences.userId);
  
  if (index >= 0) {
    prefs[index] = preferences;
  } else {
    prefs.push(preferences);
  }
  
  await setStorageData(STORAGE_KEYS.PREFERENCES, prefs);
}

// Swipe Management
export async function getSwipes(): Promise<Swipe[]> {
  return getStorageData<Swipe>(STORAGE_KEYS.SWIPES);
}

export async function addSwipe(swipe: Swipe): Promise<void> {
  const swipes = await getSwipes();
  swipes.push(swipe);
  await setStorageData(STORAGE_KEYS.SWIPES, swipes);
}

export async function getSwipesByUser(userId: string): Promise<Swipe[]> {
  const swipes = await getSwipes();
  return swipes.filter(s => s.swiperId === userId);
}

// Convenience methods for swiping
export async function likeUser(swiperId: string, targetId: string): Promise<Match | null> {
  // Check if either user has 2+ reports before allowing match
  if (getReportCount(swiperId) >= 2 || getReportCount(targetId) >= 2) {
    console.log('Match blocked: One or both users have too many reports');
    throw new Error('Unable to create match at this time. Please try again later.');
  }

  const swipe: Swipe = {
    swiperId,
    targetId,
    action: 'like',
    createdAt: new Date().toISOString()
  };
  
  await addSwipe(swipe);
  
  // Check if target user already liked this user
  const swipes = await getSwipes();
  const mutualLike = swipes.find(s => 
    s.swiperId === targetId && 
    s.targetId === swiperId && 
    (s.action === 'like' || s.action === 'superlike')
  );
  
  if (mutualLike) {
    // Double-check report count before creating match
    if (getReportCount(swiperId) >= 2 || getReportCount(targetId) >= 2) {
      console.log('Match creation blocked: One or both users have too many reports');
      throw new Error('Unable to create match at this time. Please try again later.');
    }
    
    // Create match
    return await createMatch({
      users: [swiperId, targetId],
      blocked: false
    });
  }
  
  return null;
}

export async function passUser(swiperId: string, targetId: string): Promise<void> {
  const swipe: Swipe = {
    swiperId,
    targetId,
    action: 'pass',
    createdAt: new Date().toISOString()
  };
  
  await addSwipe(swipe);
}

export async function superLikeUser(swiperId: string, targetId: string): Promise<Match | null> {
  // Check if either user has 2+ reports before allowing match
  if (getReportCount(swiperId) >= 2 || getReportCount(targetId) >= 2) {
    console.log('Super like blocked: One or both users have too many reports');
    throw new Error('Unable to create match at this time. Please try again later.');
  }

  const swipe: Swipe = {
    swiperId,
    targetId,
    action: 'superlike',
    createdAt: new Date().toISOString()
  };
  
  await addSwipe(swipe);
  
  // Check if target user already liked this user
  const swipes = await getSwipes();
  const mutualLike = swipes.find(s => 
    s.swiperId === targetId && 
    s.targetId === swiperId && 
    (s.action === 'like' || s.action === 'superlike')
  );
  
  if (mutualLike) {
    // Double-check report count before creating match
    if (getReportCount(swiperId) >= 2 || getReportCount(targetId) >= 2) {
      console.log('Super like match creation blocked: One or both users have too many reports');
      throw new Error('Unable to create match at this time. Please try again later.');
    }
    
    // Create match
    return await createMatch({
      users: [swiperId, targetId],
      blocked: false
    });
  }
  
  return null;
}

// Match Management
export async function getMatches(): Promise<Match[]> {
  return getStorageData<Match>(STORAGE_KEYS.MATCHES);
}

export async function createMatch(match: Omit<Match, 'id' | 'createdAt'>): Promise<Match> {
  const matches = await getMatches();
  const newMatch: Match = {
    ...match,
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  await setStorageData(STORAGE_KEYS.MATCHES, [...matches, newMatch]);
  return newMatch;
}

export async function getMatchesByUser(userId: string): Promise<Match[]> {
  const matches = await getMatches();
  return matches.filter(m => m.users.includes(userId) && !m.blocked);
}

export async function blockMatch(matchId: string): Promise<void> {
  const matches = await getMatches();
  const index = matches.findIndex(m => m.id === matchId);
  
  if (index >= 0) {
    matches[index].blocked = true;
    await setStorageData(STORAGE_KEYS.MATCHES, matches);
  }
}

// Message Management
export async function getMessages(): Promise<Message[]> {
  return getStorageData<Message>(STORAGE_KEYS.MESSAGES);
}

export async function getMessagesByMatch(matchId: string): Promise<Message[]> {
  const messages = await getMessages();
  return messages
    .filter(m => m.matchId === matchId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function sendMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
  const messages = await getMessages();
  const newMessage: Message = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  await setStorageData(STORAGE_KEYS.MESSAGES, [...messages, newMessage]);
  return newMessage;
}

// Report Management
export async function getReports(): Promise<Report[]> {
  return getStorageData<Report>(STORAGE_KEYS.REPORTS);
}

export async function createReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> {
  const reports = await getReports();
  const newReport: Report = {
    ...report,
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  await setStorageData(STORAGE_KEYS.REPORTS, [...reports, newReport]);
  return newReport;
}

// Feature Flags
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const flags = await getStorageData<FeatureFlags>(STORAGE_KEYS.FEATURE_FLAGS);
  return flags[0] || {
    superLikesEnabled: true,
    boostsEnabled: true,
    groupMatchingEnabled: true,
    aiOpenerEnabled: true,
    cityGateLoose: false,
    demoMode: true
  };
}

export async function setFeatureFlags(flags: FeatureFlags): Promise<void> {
  await setStorageData(STORAGE_KEYS.FEATURE_FLAGS, [flags]);
}

// Current User Management
export async function getCurrentUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

export async function setCurrentUserId(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  } catch (error) {
    console.error('Error setting current user ID:', error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getCurrentUserId();
  return userId ? getUserById(userId) : null;
}

// Feed Generation
export async function getFeedUsers(currentUserId: string, limit: number = 20): Promise<FeedUser[]> {
  const [users, swipes, currentUser, preferences] = await Promise.all([
    getUsers(),
    getSwipesByUser(currentUserId),
    getUserById(currentUserId),
    getPreferencesByUserId(currentUserId)
  ]);

  if (!currentUser || !preferences) return [];

  const swipedUserIds = swipes.map(s => s.targetId);
  
  // Filter users based on preferences and gating
  const eligibleUsers = users.filter(user => {
    if (user.id === currentUserId) return false;
    if (swipedUserIds.includes(user.id)) return false;
    if (user.age < preferences.ageMin || user.age > preferences.ageMax) return false;

    // Hide paused profiles from discovery
    if (user.paused === true) return false;

    // CITY GATE: respect user preferences.cityOnly when available
    if (preferences.cityOnly && user.city !== currentUser.city) return false;
    
    // University filter (optional but recommended)
    if (preferences.universityFilter && user.university !== currentUser.university) return false;
    
    if (!user.photos || user.photos.length === 0) return false;
    
    // REPORT FILTER: Hide users with 2+ reports
    if (getReportCount(user.id) >= 2) return false;
    
    return true;
  });

  // Add compatibility and distance data
  const feedUsersWithData: FeedUser[] = await Promise.all(
    eligibleUsers.map(async (user) => {
      const [lifestyle, housing, currentLifestyle, currentHousing, currentPreferences] = await Promise.all([
        getLifestyleByUserId(user.id),
        getHousingByUserId(user.id),
        getLifestyleByUserId(currentUserId),
        getHousingByUserId(currentUserId),
        getPreferencesByUserId(currentUserId)
      ]);

      // Calculate distance (simplified)
      const distance = calculateDistance(currentUser.geo, user.geo);

      return {
        ...user,
        distance,
        lifestyle: lifestyle || undefined,
        housing: housing || undefined,
        currentLifestyle: currentLifestyle || undefined,
        currentHousing: currentHousing || undefined,
        currentPreferences: currentPreferences || undefined
      };
    })
  );

  // Apply radius filter clearly using preferences.maxDistanceKm
  const radiusFiltered = feedUsersWithData.filter(u => {
    if (typeof u.distance !== 'number') return true;
    return u.distance <= preferences.maxDistanceKm;
  });

  
  // Sort by compatibility score (university match gets top priority)
  const feedWithCompatibility = radiusFiltered.map(user => {
    const compatibility = computeCompatibility({
      currentUser,
      targetUser: user,
      currentLifestyle: user.currentLifestyle,
      targetLifestyle: user.lifestyle,
      currentHousing: user.currentHousing,
      targetHousing: user.housing,
      currentPreferences: user.currentPreferences
    });
    
    return {
      ...user,
      compatibility
    };
  });
  
  // Sort by compatibility score (highest first)
  feedWithCompatibility.sort((a, b) => 
    (b.compatibility?.score || 0) - (a.compatibility?.score || 0)
  );
  
  const feedUsers = feedWithCompatibility.slice(0, limit);

  return feedUsers;
}

// Utility Functions
function calculateDistance(geo1: { lat: number; lng: number }, geo2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = (geo2.lat - geo1.lat) * Math.PI / 180;
  const dLng = (geo2.lng - geo1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(geo1.lat * Math.PI / 180) * Math.cos(geo2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

// Seed Data
export async function seedData(): Promise<void> {
  console.log('Seeding FlatMatch data...');
  
  // Check if data already exists
  const existingUsers = await getUsers();
  if (existingUsers.length > 0) {
    console.log('Data already seeded');
    return;
  }

  // Seed demo users
  const demoUsers: User[] = [
    {
      id: 'demo_1',
      email: 'alice@university.edu',
      firstName: 'Alice',
      lastName: 'Johnson',
      birthdate: '2001-03-15',
      age: 23,
      gender: 'Female',
      university: 'University of California, Berkeley',
      city: 'Berkeley',
      geo: { lat: 37.8719, lng: -122.2585 },
      hasRoom: true,
      shortBio: 'CS major looking for a clean, quiet roommate. Love hiking and cooking!',
      photos: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'
      ],
      createdAt: new Date().toISOString(),
      badges: ['Verified Student', 'Early Bird'],
      isDemo: true
    },
    {
      id: 'demo_2',
      email: 'bob@university.edu',
      firstName: 'Bob',
      lastName: 'Smith',
      birthdate: '2000-07-22',
      age: 24,
      university: 'University of California, Berkeley',
      city: 'Berkeley',
      geo: { lat: 37.8719, lng: -122.2585 },
      hasRoom: false,
      shortBio: 'Engineering student, love gaming and music. Looking for a chill place near campus.',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
      ],
      createdAt: new Date().toISOString(),
      badges: ['Verified Student', 'Pet Lover'],
      isDemo: true
    },
    {
      id: 'demo_3',
      email: 'charlie@university.edu',
      firstName: 'Charlie',
      lastName: 'Davis',
      birthdate: '2001-11-08',
      age: 22,
      gender: 'Non-binary',
      university: 'University of California, Berkeley',
      city: 'Berkeley',
      geo: { lat: 37.8719, lng: -122.2585 },
      hasRoom: false,
      shortBio: 'Art major who loves coffee and late-night study sessions. Looking for creative roommates!',
      photos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
      ],
      createdAt: new Date().toISOString(),
      badges: ['Verified Student', 'Creative'],
      isDemo: true
    }
  ];

  // Seed lifestyles
  const demoLifestyles: Lifestyle[] = [
    {
      userId: 'demo_1',
      hobbies: ['hiking', 'cooking', 'books', 'yoga'],
      cleanliness: 'meticulous',
      sleep: 'early',
      smoker: false,
      petsHave: [],
      petsOk: true,
      guests: 'sometimes',
      noise: 'low',
      showReligion: false,
      dietary: ['vegetarian'],
      studyProgramYear: 'Senior',
      jobOrInternship: 'Software Engineering Intern',
      showGender: true
    },
    {
      userId: 'demo_2',
      hobbies: ['gaming', 'music', 'tech', 'films'],
      cleanliness: 'avg',
      sleep: 'night',
      smoker: false,
      petsHave: ['cat'],
      petsOk: true,
      guests: 'often',
      noise: 'med',
      showReligion: false,
      dietary: [],
      studyProgramYear: 'Graduate',
      jobOrInternship: 'Research Assistant',
      showGender: true
    }
  ];

  // Seed housing
  const demoHousing: Housing[] = [
    {
      userId: 'demo_1',
      hasRoom: true,
      neighborhood: 'North Berkeley',
      bedrooms: 2,
      bathrooms: 1,
      rent: 1200,
      billsIncluded: false,
      availableFrom: '2024-09-01',
      targetNeighborhoods: []
    },
    {
      userId: 'demo_2',
      hasRoom: false,
      budgetMin: 800,
      budgetMax: 1400,
      targetNeighborhoods: ['North Berkeley', 'Downtown Berkeley', 'Southside'],
      preferencesText: 'Looking for a place within walking distance of campus'
    }
  ];

  // Seed preferences
  const demoPreferences: Preferences[] = [
    {
      userId: 'demo_1',
      ageMin: 20,
      ageMax: 26,
      cityOnly: true,
      universityFilter: true,
      maxDistanceKm: 10,
      lookingFor: 'roommate',
      dealbreakers: ['smoker'],
      mustHaves: ['clean', 'quiet'],
      quizAnswers: {
        morningPerson: true,
        partyTolerance: 'low',
        cleaningFrequency: 'weekly'
      }
    },
    {
      userId: 'demo_2',
      ageMin: 19,
      ageMax: 25,
      cityOnly: true,
      universityFilter: false,
      maxDistanceKm: 15,
      lookingFor: 'room',
      dealbreakers: ['no pets'],
      mustHaves: ['pet friendly'],
      quizAnswers: {
        morningPerson: false,
        partyTolerance: 'medium',
        cleaningFrequency: 'biweekly'
      }
    }
  ];

  // Seed demo lifestyles for new user
  const demoLifestyle3: Lifestyle = {
    userId: 'demo_3',
    hobbies: ['art', 'coffee', 'books', 'photography', 'music'],
    cleanliness: 'avg',
    sleep: 'night',
    smoker: false,
    petsHave: [],
    petsOk: true,
    guests: 'sometimes',
    noise: 'med',
    showReligion: false,
    dietary: ['vegan'],
    studyProgramYear: 'Junior',
    jobOrInternship: 'Gallery Assistant',
    showGender: true
  };

  // Seed demo housing for new user
  const demoHousing3: Housing = {
    userId: 'demo_3',
    hasRoom: false,
    budgetMin: 900,
    budgetMax: 1300,
    targetNeighborhoods: ['North Berkeley', 'Downtown Berkeley'],
    preferencesText: 'Looking for a creative space with good natural light'
  };

  // Seed demo preferences for new user
  const demoPreferences3: Preferences = {
    userId: 'demo_3',
    ageMin: 20,
    ageMax: 25,
    cityOnly: true,
    universityFilter: false,
    maxDistanceKm: 12,
    lookingFor: 'room',
    dealbreakers: ['smoker', 'no pets'],
    mustHaves: ['creative space', 'good lighting'],
    quizAnswers: {
      morningPerson: false,
      partyTolerance: 'medium',
      cleaningFrequency: 'weekly'
    }
  };

  // Create some demo matches
  const demoMatches: Match[] = [
    {
      id: 'match_1',
      users: ['demo_1', 'demo_2'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      blocked: false
    },
    {
      id: 'match_2',
      users: ['demo_1', 'demo_3'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      blocked: false
    }
  ];

  // Create a demo group match
  const demoGroupMatch: GroupMatch = {
    id: 'group_1',
    users: ['demo_1', 'demo_2', 'demo_3'],
    groupName: 'Berkeley Study Squad',
    createdBy: 'demo_1',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    blocked: false,
    averageCompatibility: 85,
    memberCount: 3,
    inviteCode: 'STUDY123'
  };

  // Demo availability data
  const demoAvailability: Availability[] = [
    {
      userId: 'demo_1',
      weeklySchedule: {
        monday: { available: true, timeSlots: [{ start: '14:00', end: '17:00' }] },
        tuesday: { available: false, timeSlots: [] },
        wednesday: { available: true, timeSlots: [{ start: '10:00', end: '12:00' }] },
        thursday: { available: true, timeSlots: [{ start: '15:00', end: '18:00' }] },
        friday: { available: false, timeSlots: [] },
        saturday: { available: true, timeSlots: [{ start: '10:00', end: '16:00' }] },
        sunday: { available: true, timeSlots: [{ start: '11:00', end: '15:00' }] }
      },
      timezone: 'America/Los_Angeles',
      preferredViewingTimes: ['Weekend mornings', 'Weekday afternoons']
    },
    {
      userId: 'demo_2',
      weeklySchedule: {
        monday: { available: true, timeSlots: [{ start: '16:00', end: '19:00' }] },
        tuesday: { available: true, timeSlots: [{ start: '14:00', end: '17:00' }] },
        wednesday: { available: false, timeSlots: [] },
        thursday: { available: true, timeSlots: [{ start: '15:00', end: '18:00' }] },
        friday: { available: true, timeSlots: [{ start: '17:00', end: '20:00' }] },
        saturday: { available: true, timeSlots: [{ start: '12:00', end: '18:00' }] },
        sunday: { available: false, timeSlots: [] }
      },
      timezone: 'America/Los_Angeles',
      preferredViewingTimes: ['After 5 PM weekdays', 'Saturday afternoons']
    }
  ];

  // Save all seed data
  await Promise.all([
    setStorageData(STORAGE_KEYS.USERS, demoUsers),
    setStorageData(STORAGE_KEYS.LIFESTYLES, [...demoLifestyles, demoLifestyle3]),
    setStorageData(STORAGE_KEYS.HOUSING, [...demoHousing, demoHousing3]),
    setStorageData(STORAGE_KEYS.PREFERENCES, [...demoPreferences, demoPreferences3]),
    setStorageData(STORAGE_KEYS.MATCHES, [...demoMatches, demoGroupMatch]),
    setStorageData(STORAGE_KEYS.AVAILABILITY, demoAvailability)
  ]);

  console.log('Demo data seeded successfully');
}

// Demo seeding utilities for Paris & London
export async function seedDemoUsers({ parisCount = 14, londonCount = 14 }: { parisCount?: number; londonCount?: number } = {}): Promise<void> {
  console.log('Seeding demo users for Paris and London...', { parisCount, londonCount });
  const existing = await getUsers();
  const existingLifestyles = await getLifestyles();
  const existingHousing = await getHousing();
  const existingPreferences = await getPreferences();

  function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
  
  function makeUser(index: number, city: 'Paris' | 'London'): User {
    const firstNames = ['Alex','Sam','Taylor','Jordan','Morgan','Casey','Jamie','Riley','Avery','Quinn','Charlie','Drew','Elliot','Harper','Rowan','Blake','Skylar','Sage','River','Phoenix'];
    const lastNames = ['Lee','Smith','Brown','Wilson','Martin','Dubois','Taylor','Anderson','White','Clark','Lopez','Young','Garcia','Martinez','Davis'];
    const unisParis = ['Sorbonne University', 'Paris-Saclay University', 'Sciences Po', 'École Polytechnique', 'HEC Paris'];
    const unisLondon = ['UCL', "King's College London", 'Imperial College London', 'LSE', 'University of Oxford', 'University of Cambridge'];
    const cityMeta = city === 'Paris'
      ? { geo: { lat: 48.8566 + (Math.random() - 0.5) * 0.1, lng: 2.3522 + (Math.random() - 0.5) * 0.1 }, uni: randomFrom(unisParis) }
      : { geo: { lat: 51.5074 + (Math.random() - 0.5) * 0.1, lng: -0.1278 + (Math.random() - 0.5) * 0.1 }, uni: randomFrom(unisLondon) };
    const age = 20 + Math.floor(Math.random() * 8);
    const id = `demo_${city.toLowerCase()}_${Date.now()}_${index}_${Math.random().toString(36).slice(2,8)}`;
    const hasRoom = Math.random() > 0.5;
    const photoSeeds = [
      'photo-1494790108755-2616b612b786',
      'photo-1507003211169-0a1dd7228f2d',
      'photo-1527980965255-d3b416303d12',
      'photo-1519340241574-2cec6aef0c01',
      'photo-1544005313-94ddf0286df2',
      'photo-1520813792240-56fc4a3765a7',
      'photo-1539571696357-5a69c17a67c6',
      'photo-1524504388940-b1c1722653e1',
      'photo-1517841905240-472988babdf9',
      'photo-1488426862026-3ee34a7d66df'
    ];
    const photos = [
      `https://images.unsplash.com/${randomFrom(photoSeeds)}?w=600&auto=format&fit=crop`,
      `https://images.unsplash.com/${randomFrom(photoSeeds)}?w=600&auto=format&fit=crop`,
      `https://images.unsplash.com/${randomFrom(photoSeeds)}?w=600&auto=format&fit=crop`
    ];

    const bios = [
      'Love cooking and exploring new cafes. Looking for a tidy flatmate who enjoys good conversations!',
      'Student by day, musician by night. Need a chill place to call home.',
      'Fitness enthusiast and early riser. Seeking a clean, quiet space to study and relax.',
      'Bookworm and coffee addict. Looking for someone who respects quiet hours.',
      'Aspiring chef who loves hosting dinner parties. Let\'s share a kitchen!',
      'Outdoor adventurer seeking a home base. Clean, respectful, and friendly.',
      'Art student looking for creative vibes and good energy in a shared space.',
      'Tech geek and gamer. Need fast wifi and a chill roommate.',
      'Yoga instructor seeking zen living space. Plant lover and morning person.',
      'Film buff and night owl. Looking for a relaxed, creative living situation.'
    ];

    return {
      id,
      email: `${id}@example.com`,
      firstName: randomFrom(firstNames),
      lastName: randomFrom(lastNames),
      birthdate: `${2005 - age}-0${1 + (index % 9)}-1${index % 9}`,
      age,
      gender: randomFrom(['Female','Male','Non-binary','Other']),
      university: cityMeta.uni,
      city,
      geo: cityMeta.geo,
      hasRoom,
      shortBio: randomFrom(bios),
      photos,
      createdAt: new Date().toISOString(),
      badges: ['Verified Student'],
      isDemo: true
    };
  }

  function makeLifestyle(userId: string): Lifestyle {
    return {
      userId,
      hobbies: randomFrom([
        ['reading', 'cooking'],
        ['gaming', 'music'],
        ['fitness', 'hiking'],
        ['photography', 'films'],
        ['travel', 'books']
      ]),
      cleanliness: randomFrom(['chill', 'avg', 'meticulous']),
      sleep: randomFrom(['early', 'flex', 'night']),
      smoker: randomFrom([true, false]),
      petsHave: randomFrom([[], ['cat'], ['dog']]),
      petsOk: randomFrom([true, false]),
      guests: randomFrom(['never', 'sometimes', 'often']),
      noise: randomFrom(['low', 'med', 'high']),
      showReligion: false,
      dietary: randomFrom([[], ['vegetarian'], ['vegan'], ['halal']]),
      studyProgramYear: randomFrom(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
      jobOrInternship: randomFrom(['Student', 'Part-time', 'Intern', 'Full-time']),
      showGender: true
    };
  }

  function makeHousing(userId: string, hasRoom: boolean): Housing {
    if (hasRoom) {
      return {
        userId,
        hasRoom: true,
        neighborhood: randomFrom(['City Center', 'Near Campus', 'Quiet Neighborhood', 'Near Transit']),
        bedrooms: randomFrom([1, 2, 3]),
        bathrooms: randomFrom([1, 2]),
        rent: Math.floor(Math.random() * 500) + 600,
        billsIncluded: randomFrom([true, false]),
        availableFrom: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetNeighborhoods: []
      };
    } else {
      return {
        userId,
        hasRoom: false,
        budgetMin: Math.floor(Math.random() * 200) + 500,
        budgetMax: Math.floor(Math.random() * 400) + 900,
        currency: 'EUR',
        targetNeighborhoods: randomFrom([
          ['City Center', 'Near Campus'],
          ['Quiet Neighborhood', 'Near Transit'],
          ['City Center']
        ]),
        preferencesText: randomFrom([
          'Looking for a quiet place near campus',
          'Need a place with good transport links',
          'Prefer a lively neighborhood with cafes'
        ])
      };
    }
  }

  function makePreferences(userId: string): Preferences {
    return {
      userId,
      ageMin: 18,
      ageMax: 35,
      maxDistanceKm: randomFrom([5, 10, 15, 20]),
      cityOnly: true,
      universityFilter: false,
      lookingFor: randomFrom(['roommate', 'room', 'either']),
      mustHaves: randomFrom([
        ['non-smoker', 'clean'],
        ['quiet', 'respectful'],
        ['friendly', 'social'],
        ['pet-friendly', 'flexible']
      ]),
      dealbreakers: randomFrom([
        ['smoking', 'loud parties'],
        ['messy', 'unreliable'],
        ['pets', 'late nights'],
        ['drama', 'disrespectful']
      ]),
      quizAnswers: {
        morningPerson: randomFrom([true, false]),
        partyTolerance: randomFrom(['low', 'medium', 'high']),
        cleaningFrequency: randomFrom(['daily', 'weekly', 'biweekly'])
      }
    };
  }

  const newParis = Array.from({ length: parisCount }).map((_, i) => makeUser(i, 'Paris'));
  const newLondon = Array.from({ length: londonCount }).map((_, i) => makeUser(i, 'London'));
  const allNewUsers = [...newParis, ...newLondon];

  const newLifestyles = allNewUsers.map(user => makeLifestyle(user.id));
  const newHousing = allNewUsers.map(user => makeHousing(user.id, user.hasRoom || false));
  const newPreferences = allNewUsers.map(user => makePreferences(user.id));

  await Promise.all([
    setStorageData(STORAGE_KEYS.USERS, [...existing, ...allNewUsers]),
    setStorageData(STORAGE_KEYS.LIFESTYLES, [...existingLifestyles, ...newLifestyles]),
    setStorageData(STORAGE_KEYS.HOUSING, [...existingHousing, ...newHousing]),
    setStorageData(STORAGE_KEYS.PREFERENCES, [...existingPreferences, ...newPreferences])
  ]);
  
  console.log('Seeded demo users with complete profiles:', { added: allNewUsers.length });
}

export async function clearDemoUsers(): Promise<void> {
  console.log('Clearing demo users and related data...');
  const [users, lifestyles, housing, preferences, swipes, matches, messages, availability, invites, proposals] = await Promise.all([
    getUsers(),
    getLifestyles(),
    getHousing(),
    getPreferences(),
    getSwipes(),
    getMatches(),
    getMessages(),
    getAvailability(),
    getGroupInvitations(),
    getViewingProposals()
  ]);

  const demoIds = new Set(users.filter(u => u.isDemo).map(u => u.id));

  await Promise.all([
    setStorageData(STORAGE_KEYS.USERS, users.filter(u => !demoIds.has(u.id))),
    setStorageData(STORAGE_KEYS.LIFESTYLES, lifestyles.filter(l => !demoIds.has(l.userId))),
    setStorageData(STORAGE_KEYS.HOUSING, housing.filter(h => !demoIds.has(h.userId))),
    setStorageData(STORAGE_KEYS.PREFERENCES, preferences.filter(p => !demoIds.has(p.userId))),
    setStorageData(STORAGE_KEYS.SWIPES, swipes.filter(s => !demoIds.has(s.swiperId) && !demoIds.has(s.targetId))),
    setStorageData(STORAGE_KEYS.MATCHES, matches.filter(m => !m.users.some(id => demoIds.has(id)))),
    setStorageData(STORAGE_KEYS.MESSAGES, messages.filter(m => !demoIds.has(m.senderId))),
    setStorageData(STORAGE_KEYS.AVAILABILITY, availability.filter(a => !demoIds.has(a.userId))),
    setStorageData(STORAGE_KEYS.GROUP_INVITATIONS, invites.filter(i => !demoIds.has(i.inviterId) && !demoIds.has(i.inviteeId))),
    setStorageData(STORAGE_KEYS.VIEWING_PROPOSALS, proposals.filter(p => !p.proposedBy || !demoIds.has(p.proposedBy)))
  ]);

  console.log('Demo users cleared.');
}

// Availability Management
export async function getAvailability(): Promise<Availability[]> {
  return getStorageData<Availability>(STORAGE_KEYS.AVAILABILITY);
}

export async function getAvailabilityByUserId(userId: string): Promise<Availability | null> {
  const availability = await getAvailability();
  return availability.find(a => a.userId === userId) || null;
}

export async function setAvailability(availability: Availability): Promise<void> {
  const availabilities = await getAvailability();
  const index = availabilities.findIndex(a => a.userId === availability.userId);
  
  if (index >= 0) {
    availabilities[index] = availability;
  } else {
    availabilities.push(availability);
  }
  
  await setStorageData(STORAGE_KEYS.AVAILABILITY, availabilities);
}

// Group Management
export async function createGroupMatch(groupData: {
  users: string[];
  groupName: string;
  createdBy: string;
}): Promise<GroupMatch> {
  const matches = await getMatches();
  const groupMatch: GroupMatch = {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    users: groupData.users,
    groupName: groupData.groupName,
    createdBy: groupData.createdBy,
    createdAt: new Date().toISOString(),
    blocked: false,
    averageCompatibility: 0, // Will be calculated
    memberCount: groupData.users.length,
    inviteCode: Math.random().toString(36).substr(2, 8).toUpperCase()
  };
  
  await setStorageData(STORAGE_KEYS.MATCHES, [...matches, groupMatch]);
  return groupMatch;
}

export async function getGroupMatches(userId: string): Promise<GroupMatch[]> {
  const matches = await getMatches();
  return matches.filter(m => 
    m.users.includes(userId) && 
    m.users.length > 2 && 
    !m.blocked &&
    'groupName' in m
  ) as GroupMatch[];
}

export async function addUserToGroup(groupId: string, userId: string): Promise<GroupMatch | null> {
  const matches = await getMatches();
  const groupIndex = matches.findIndex(m => m.id === groupId);
  
  if (groupIndex === -1) return null;
  
  const group = matches[groupIndex] as GroupMatch;
  if (group.users.length >= 5) return null; // Max 5 users
  if (group.users.includes(userId)) return group; // Already in group
  
  const updatedGroup: GroupMatch = {
    ...group,
    users: [...group.users, userId],
    memberCount: group.users.length + 1
  };
  
  matches[groupIndex] = updatedGroup;
  await setStorageData(STORAGE_KEYS.MATCHES, matches);
  return updatedGroup;
}

// Group Invitations
export async function getGroupInvitations(): Promise<GroupInvitation[]> {
  return getStorageData<GroupInvitation>(STORAGE_KEYS.GROUP_INVITATIONS);
}

export async function createGroupInvitation(invitation: Omit<GroupInvitation, 'id' | 'createdAt' | 'expiresAt'>): Promise<GroupInvitation> {
  const invitations = await getGroupInvitations();
  const newInvitation: GroupInvitation = {
    ...invitation,
    id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
  
  await setStorageData(STORAGE_KEYS.GROUP_INVITATIONS, [...invitations, newInvitation]);
  return newInvitation;
}

export async function getInvitationsForUser(userId: string): Promise<GroupInvitation[]> {
  const invitations = await getGroupInvitations();
  return invitations.filter(i => i.inviteeId === userId && i.status === 'pending');
}

export async function respondToGroupInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<GroupInvitation | null> {
  const invitations = await getGroupInvitations();
  const index = invitations.findIndex(i => i.id === invitationId);
  
  if (index === -1) return null;
  
  const updatedInvitation = { ...invitations[index], status: response };
  invitations[index] = updatedInvitation;
  
  await setStorageData(STORAGE_KEYS.GROUP_INVITATIONS, invitations);
  
  // If accepted, add user to group
  if (response === 'accepted') {
    await addUserToGroup(updatedInvitation.groupId, updatedInvitation.inviteeId);
  }
  
  return updatedInvitation;
}

// Viewing Proposals
export async function getViewingProposals(): Promise<ViewingProposal[]> {
  return getStorageData<ViewingProposal>(STORAGE_KEYS.VIEWING_PROPOSALS);
}

export async function createViewingProposal(proposal: Omit<ViewingProposal, 'id' | 'createdAt' | 'responses' | 'status'>): Promise<ViewingProposal> {
  const proposals = await getViewingProposals();
  const newProposal: ViewingProposal = {
    ...proposal,
    id: `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    responses: [],
    status: 'pending'
  };
  
  await setStorageData(STORAGE_KEYS.VIEWING_PROPOSALS, [...proposals, newProposal]);
  return newProposal;
}

export async function getProposalsForMatch(matchId: string): Promise<ViewingProposal[]> {
  const proposals = await getViewingProposals();
  return proposals.filter(p => p.matchId === matchId);
}

export async function respondToViewingProposal(
  proposalId: string, 
  userId: string, 
  response: 'available' | 'unavailable' | 'maybe',
  selectedTimeIndex?: number,
  notes?: string
): Promise<ViewingProposal | null> {
  const proposals = await getViewingProposals();
  const index = proposals.findIndex(p => p.id === proposalId);
  
  if (index === -1) return null;
  
  const proposal = proposals[index];
  const existingResponseIndex = proposal.responses.findIndex(r => r.userId === userId);
  
  const newResponse = {
    userId,
    response,
    selectedTimeIndex,
    notes
  };
  
  if (existingResponseIndex >= 0) {
    proposal.responses[existingResponseIndex] = newResponse;
  } else {
    proposal.responses.push(newResponse);
  }
  
  proposals[index] = proposal;
  await setStorageData(STORAGE_KEYS.VIEWING_PROPOSALS, proposals);
  return proposal;
}

// Generate overlapping viewing times based on availability
export async function generateViewingTimes(userIds: string[]): Promise<string[]> {
  const availabilities = await Promise.all(
    userIds.map(id => getAvailabilityByUserId(id))
  );
  
  // Simple algorithm to find common available times
  const commonTimes: string[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (const day of days) {
    const dayAvailabilities = availabilities
      .filter(Boolean)
      .map(a => a!.weeklySchedule[day])
      .filter(Boolean);
    
    if (dayAvailabilities.length === userIds.length) {
      // All users have availability data for this day
      const allAvailable = dayAvailabilities.every(d => d.available);
      
      if (allAvailable && dayAvailabilities.every(d => d.timeSlots.length > 0)) {
        // Find overlapping time slots (simplified)
        const firstSlot = dayAvailabilities[0].timeSlots[0];
        commonTimes.push(`${day.charAt(0).toUpperCase() + day.slice(1)} ${firstSlot.start}`);
      }
    }
  }
  
  // Add some default suggestions if no common times found
  if (commonTimes.length === 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    return [
      `Tomorrow at 2:00 PM`,
      `${dayAfter.toLocaleDateString()} at 10:00 AM`,
      `This weekend at 11:00 AM`
    ];
  }
  
  return commonTimes.slice(0, 3); // Return top 3 suggestions
}

// Calculate group compatibility (average of pairwise + overlap factors)
export async function calculateGroupCompatibility(userIds: string[]): Promise<number> {
  if (userIds.length < 2) return 0;
  
  const users = await Promise.all(userIds.map(id => getUserById(id)));
  const lifestyles = await Promise.all(userIds.map(id => getLifestyleByUserId(id)));
  const housings = await Promise.all(userIds.map(id => getHousingByUserId(id)));
  
  let totalScore = 0;
  let pairCount = 0;
  
  // Calculate pairwise compatibility
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1 = users[i];
      const user2 = users[j];
      
      if (user1 && user2) {
        const compatibility = computeCompatibility({
          currentUser: user1,
          targetUser: user2,
          currentLifestyle: lifestyles[i] || undefined,
          targetLifestyle: lifestyles[j] || undefined,
          currentHousing: housings[i] || undefined,
          targetHousing: housings[j] || undefined
        });
        
        totalScore += compatibility.score;
        pairCount++;
      }
    }
  }
  
  const averageScore = pairCount > 0 ? totalScore / pairCount : 0;
  
  // Add bonus for budget overlap and move-in timing
  let bonusScore = 0;
  const hasRoomUsers = housings.filter(h => h?.hasRoom).length;
  const needsRoomUsers = housings.filter(h => h && !h.hasRoom).length;
  
  if (hasRoomUsers > 0 && needsRoomUsers > 0) {
    bonusScore += 10; // Bonus for complementary housing needs
  }
  
  return Math.min(100, Math.round(averageScore + bonusScore));
}

// Report-based filtering
export function getReportCount(userId: string): number {
  const reports = getInMemoryReports();
  return reports.filter(report => report.reportedUserId === userId).length;
}

// Clear all data (for development/testing)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    cache.clear();
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}
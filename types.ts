// Core User & Identity Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  age: number;
  gender?: string;
  university: string;
  city: string;
  country?: string;
  geo: { lat: number; lng: number };
  hasRoom: boolean;
  shortBio: string;
  photos: string[]; // 1-6 photos
  videoIntroUrl?: string;
  voiceIntroUrl?: string;
  igUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  createdAt: string;
  badges: string[];
  isDemo?: boolean;
  paused?: boolean; // When true, user is hidden from discovery
  walkthroughSeen?: boolean;
  autoMatchMessage?: string; // Custom message sent on match
  sendAutoMatchMessage?: boolean; // Whether to send auto message on match (default true)
}

// Lifestyle & Preferences
export interface Lifestyle {
  userId: string;
  hobbies: string[];
  cleanliness: 'chill' | 'avg' | 'meticulous';
  sleep: 'early' | 'flex' | 'night';
  smoker: boolean;
  petsHave: string[];
  petsOk: boolean;
  guests: 'never' | 'sometimes' | 'often';
  noise: 'low' | 'med' | 'high';
  // Numeric sliders (0-10). 0 = low/early/never, 10 = high/night/often
  cleanlinessScore?: number;
  noiseLevelScore?: number;
  sleepRhythmScore?: number;
  guestsScore?: number;
  religion?: string;
  showReligion: boolean;
  dietary: string[];
  studyProgramYear: string;
  jobOrInternship: string;
  showGender: boolean;
  // New richer vibe fields
  politicalView?: 'conservative' | 'progressive' | 'centrist' | 'ecological' | 'apolitical';
  religiousChoice?: 'yes' | 'no' | 'prefer_not';
  moneyStyle?: 'meticulous' | 'balanced' | 'loose';
  foodPreference?: 'omnivore' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'other';
  foodOther?: string;
  sportsHobbies?: string[];
  seriesFilms?: string;
  // New language & nationality fields
  languages?: string[];
  nationalities?: string[];
}

// Housing & Room Details
export interface Housing {
  userId: string;
  hasRoom: boolean;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  rent?: number;
  billsIncluded?: boolean;
  availableFrom?: string;
  availableTo?: string;
  isOwner?: boolean;
  apartmentDescription?: string;
  roomPhotos?: string[];
  // If needs room:
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  targetNeighborhoods: string[];
  preferencesText?: string;
  wantedFrom?: string;
  wantedTo?: string;
}

// User Preferences & Filters
export interface Preferences {
  userId: string;
  ageMin: number;
  ageMax: number;
  cityOnly: boolean;
  universityFilter: boolean;
  maxDistanceKm: number;
  lookingFor: 'roommate' | 'room' | 'either';
  dealbreakers: string[];
  mustHaves: string[];
  quizAnswers: Record<string, any>;
  languageMatchOnly: boolean;
}

// Swipe & Match System
export interface Swipe {
  swiperId: string;
  targetId: string;
  action: 'like' | 'pass' | 'superlike';
  createdAt: string;
}

export interface Match {
  id: string;
  users: string[]; // 2-5 user IDs for group matching
  createdAt: string;
  blocked: boolean;
  groupName?: string;
}

// Messaging
export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  readAt?: string;
}

// Safety & Moderation
export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

// Scheduling & Availability
export interface Availability {
  userId: string;
  weeklySchedule: {
    [day: string]: { // 'monday', 'tuesday', etc.
      available: boolean;
      timeSlots: {
        start: string; // HH:MM format
        end: string; // HH:MM format
      }[];
    };
  };
  timezone: string;
  preferredViewingTimes: string[]; // Array of preferred time descriptions
}

// App Configuration
export interface FeatureFlags {
  superLikesEnabled: boolean;
  boostsEnabled: boolean;
  groupMatchingEnabled: boolean;
  aiOpenerEnabled: boolean;
  cityGateLoose: boolean;
  demoMode: boolean;
}

// Compatibility & Matching
export interface CompatibilityResult {
  score: number; // 0-100
  reasons: string[];
}

// Analytics (stub)
export interface Analytics {
  dailyActiveUsers: number;
  matchesPerDay: number;
  reportRate: number;
  [key: string]: any;
}

// Admin
export interface AdminNotes {
  userId: string;
  notes: string;
  createdAt: string;
}

// Vibe Quiz Questions
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  weight: number;
}

// University Directory
export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  domain?: string; // for email verification
  top500?: boolean;
}

// City & Location
export interface City {
  id: string;
  name: string;
  country: string;
  geo: { lat: number; lng: number };
  neighborhoods: string[];
}

// Saved Searches
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: Partial<Preferences>;
  createdAt: string;
  alertsEnabled: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'match' | 'message' | 'verification' | 'alert';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Feed & Discovery
export interface FeedUser extends User {
  distance?: number;
  compatibility?: CompatibilityResult;
  lifestyle?: Lifestyle;
  housing?: Housing;
  // Temporary fields for compatibility calculation
  currentLifestyle?: Lifestyle;
  currentHousing?: Housing;
  currentPreferences?: Preferences;
}

// Group Matching
export interface GroupMatch extends Match {
  groupName: string;
  averageCompatibility: number;
  memberCount: number;
  createdBy: string; // User ID who created the group
  inviteCode?: string; // Optional invite code for joining
}

// Group Invitation
export interface GroupInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

// Viewing Time Proposal
export interface ViewingProposal {
  id: string;
  matchId: string; // Can be regular match or group match
  proposedBy: string;
  proposedTimes: {
    datetime: string; // ISO string
    location?: string;
    notes?: string;
  }[];
  responses: {
    userId: string;
    response: 'available' | 'unavailable' | 'maybe';
    selectedTimeIndex?: number; // Index of preferred time
    notes?: string;
  }[];
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// Smart Opener
export interface SmartOpener {
  text: string;
  category: 'hobby' | 'lifestyle' | 'housing' | 'general';
}

// Boost & Monetization
export interface Boost {
  userId: string;
  type: 'profile' | 'listing';
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface SuperLike {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  used: boolean;
}

// Common Enums as const objects for better TypeScript support
export const CleanlinessLevel = {
  CHILL: 'chill',
  AVG: 'avg',
  METICULOUS: 'meticulous'
} as const;

export const SleepSchedule = {
  EARLY: 'early',
  FLEX: 'flex',
  NIGHT: 'night'
} as const;

export const GuestFrequency = {
  NEVER: 'never',
  SOMETIMES: 'sometimes',
  OFTEN: 'often'
} as const;

export const NoiseTolerance = {
  LOW: 'low',
  MED: 'med',
  HIGH: 'high'
} as const;

export const LookingFor = {
  ROOMMATE: 'roommate',
  ROOM: 'room',
  EITHER: 'either'
} as const;

export const SwipeAction = {
  LIKE: 'like',
  PASS: 'pass',
  SUPERLIKE: 'superlike'
} as const;

// Common hobby categories
export const HOBBY_CATEGORIES = [
  'music', 'fitness', 'cooking', 'gaming', 'books', 'films',
  'photography', 'cars', 'cycling', 'hiking', 'yoga', 'fashion',
  'tech', 'startups', 'volunteering', 'travel', 'languages',
  'pets', 'plants', 'board games'
] as const;

// Badge types
export const BADGE_TYPES = [
  'Verified Student', 'ID Verified', 'Early Bird', 'Pet Lover',
  'Non-smoker', 'Quiet Hours', 'Clean Freak', 'Social Butterfly'
] as const;

export type HobbyCategory = typeof HOBBY_CATEGORIES[number];
export type BadgeType = typeof BADGE_TYPES[number];
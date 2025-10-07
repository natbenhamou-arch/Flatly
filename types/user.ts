export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender?: string;
  universitySchool: string;
  studentEmailVerified: boolean;
  hasPlace: boolean;
  city: string;
  geoLocation?: { lat: number; lng: number };
  preferredNeighborhoods: string[];
  budgetMin: number;
  budgetMax: number;
  currency: string;
  moveInDate: string;
  leaseLengthMonths: number;
  shortBio: string;
  photos: string[];
  lifestyle: LifestylePreferences;
  preferences: PreferencesControls;
  roomListing?: RoomListing;
}

export interface LifestylePreferences {
  hobbies: string[];
  cleanlinessLevel: 'chill' | 'average' | 'meticulous';
  sleepSchedule: 'early bird' | 'flexible' | 'night owl';
  smoker: boolean;
  alcohol: 'never' | 'sometimes' | 'often';
  petsHave: string[];
  petsOk: boolean;
  cookingAtHome: 'never' | 'sometimes' | 'often';
  guestsFrequency: 'never' | 'rarely' | 'sometimes' | 'often';
  noiseTolerance: 'low' | 'medium' | 'high';
  religion?: string;
  dietary?: string;
  studyProgramYear: string;
  jobOrInternship: string;
  showReligion: boolean;
  showGender: boolean;
}

export interface PreferencesControls {
  targetCity: string;
  maxDistanceKm: number;
  budgetTarget: number;
  lookingFor: 'roommate' | 'room' | 'either';
  dealbreakers: string[];
  mustHaves: string[];
  niceToHaves: string[];
  showMe: 'everyone' | 'similar students' | 'verified only';
  ageRangeMin: number;
  ageRangeMax: number;
}

export interface RoomListing {
  userId: string;
  addressLine: string;
  city: string;
  geoLocation: { lat: number; lng: number };
  roomPrice: number;
  billsIncluded: boolean;
  roomType: 'single' | 'ensuite' | 'shared';
  availableFrom: string;
  photos: string[];
  description: string;
}

export interface SwipeAction {
  swiperId: string;
  targetId: string;
  action: 'like' | 'pass';
  createdAt: string;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  isBlocked: boolean;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  readAt?: string;
}
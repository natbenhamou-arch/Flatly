import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

const DEMO_USER_KEY = '@flatly_demo_user';
const DEMO_MODE_KEY = '@flatly_demo_mode';

export async function enableDemoMode(): Promise<void> {
  await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
}

export async function disableDemoMode(): Promise<void> {
  await AsyncStorage.removeItem(DEMO_MODE_KEY);
}

export async function isDemoMode(): Promise<boolean> {
  const mode = await AsyncStorage.getItem(DEMO_MODE_KEY);
  return mode === 'true';
}

export async function createDemoUser(email: string, userData: {
  firstName?: string;
  lastName?: string;
  birthdate: string;
  age: number;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const demoUser: User = {
      id: `demo_${Date.now()}`,
      email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      birthdate: userData.birthdate,
      age: userData.age,
      gender: undefined,
      university: '',
      city: '',
      country: undefined,
      geo: { lat: 0, lng: 0 },
      hasRoom: false,
      shortBio: '',
      photos: [],
      videoIntroUrl: undefined,
      voiceIntroUrl: undefined,
      igUrl: undefined,
      linkedinUrl: undefined,
      tiktokUrl: undefined,
      createdAt: new Date().toISOString(),
      badges: [],
      isDemo: true,
      paused: false,
      walkthroughSeen: false,
      autoMatchMessage: undefined,
      sendAutoMatchMessage: true,
      recommendationCode: undefined,
    };

    await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    
    return { success: true, user: demoUser };
  } catch (error) {
    console.error('Demo user creation error:', error);
    return { success: false, error: 'Failed to create demo user' };
  }
}

export async function getDemoUser(): Promise<User | null> {
  try {
    const userData = await AsyncStorage.getItem(DEMO_USER_KEY);
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Get demo user error:', error);
    return null;
  }
}

export async function updateDemoUser(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const currentUser = await getDemoUser();
    if (!currentUser) {
      return { success: false, error: 'No demo user found' };
    }

    const updatedUser = { ...currentUser, ...updates };
    await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Update demo user error:', error);
    return { success: false, error: 'Failed to update demo user' };
  }
}

export async function clearDemoUser(): Promise<void> {
  await AsyncStorage.removeItem(DEMO_USER_KEY);
}

export async function signInDemo(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const demoUser = await getDemoUser();
  if (demoUser && demoUser.email === email) {
    return { success: true, user: demoUser };
  }
  return { success: false, error: 'Demo user not found. Please create a new demo account.' };
}

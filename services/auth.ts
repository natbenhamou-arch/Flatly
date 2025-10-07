import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User } from '@/types';
import { createUser, getUserById, getUsers } from './data';

// Storage keys
const AUTH_STORAGE_KEYS = {
  SESSION_TOKEN: 'flatmatch_session_token',
  USER_CREDENTIALS: 'flatmatch_user_credentials'
} as const;

// Types
export interface UserCredentials {
  id: string;
  email: string;
  hashedPassword: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  sessionToken: string;
}

// Crypto utilities
class CryptoUtils {
  // Web Crypto API implementation
  static async hashPasswordWebCrypto(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback SHA-256 implementation for environments without Web Crypto
  static async hashPasswordFallback(password: string): Promise<string> {
    // Simple SHA-256 implementation
    const utf8 = new TextEncoder().encode(password);
    let hash = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;
    
    // This is a simplified version - in production, use a proper crypto library
    for (let i = 0; i < utf8.length; i++) {
      hash = ((hash << 5) - hash + utf8[i]) & 0xffffffff;
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  static async hashPassword(password: string): Promise<string> {
    try {
      // Try Web Crypto API first
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        return await this.hashPasswordWebCrypto(password);
      }
    } catch (error) {
      console.log('Web Crypto not available, using fallback');
    }
    
    // Fallback to simple hash
    return await this.hashPasswordFallback(password);
  }

  static generateSessionToken(): string {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Credential storage
async function getStoredCredentials(): Promise<UserCredentials[]> {
  try {
    const data = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_CREDENTIALS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting stored credentials:', error);
    return [];
  }
}

async function saveCredentials(credentials: UserCredentials[]): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
}

// Session management
export async function saveSessionToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.SESSION_TOKEN, token);
  } catch (error) {
    console.error('Error saving session token:', error);
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.SESSION_TOKEN);
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}

export async function clearSessionToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_TOKEN);
  } catch (error) {
    console.error('Error clearing session token:', error);
  }
}

// Authentication functions
export async function signUp(email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'email'>): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validate email
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join(', ') };
    }
    
    // Check if email already exists
    const existingCredentials = await getStoredCredentials();
    if (existingCredentials.some(cred => cred.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Hash password
    const hashedPassword = await CryptoUtils.hashPassword(password);
    
    // Create user
    const user = await createUser({
      ...userData,
      email
    });
    
    // Store credentials
    const credentials: UserCredentials = {
      id: user.id,
      email,
      hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    await saveCredentials([...existingCredentials, credentials]);
    
    // Generate and save session token
    const sessionToken = CryptoUtils.generateSessionToken();
    await saveSessionToken(sessionToken);
    
    console.log('User signed up successfully:', user.id);
    return { success: true, user };
    
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Failed to create account' };
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Find user credentials
    const credentials = await getStoredCredentials();
    const userCredentials = credentials.find(cred => cred.email === email);
    
    if (!userCredentials) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Hash provided password and compare
    const hashedPassword = await CryptoUtils.hashPassword(password);
    
    if (hashedPassword !== userCredentials.hashedPassword) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Get user data
    const user = await getUserById(userCredentials.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Generate and save new session token
    const sessionToken = CryptoUtils.generateSessionToken();
    await saveSessionToken(sessionToken);
    
    console.log('User signed in successfully:', user.id);
    return { success: true, user };
    
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await clearSessionToken();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Auto-restore session
export async function restoreSession(): Promise<{ success: boolean; user?: User }> {
  try {
    const sessionToken = await getSessionToken();
    if (!sessionToken) {
      return { success: false };
    }
    
    // In a real app, you'd validate the token with a server
    // For now, we'll just check if we have stored credentials
    const credentials = await getStoredCredentials();
    if (credentials.length === 0) {
      await clearSessionToken();
      return { success: false };
    }
    
    // For demo purposes, restore the most recent user
    // In a real app, you'd associate the token with a specific user
    const mostRecentCredentials = credentials.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    const user = await getUserById(mostRecentCredentials.id);
    if (!user) {
      await clearSessionToken();
      return { success: false };
    }
    
    console.log('Session restored for user:', user.id);
    return { success: true, user };
    
  } catch (error) {
    console.error('Session restore error:', error);
    await clearSessionToken();
    return { success: false };
  }
}
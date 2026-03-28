import { supabase } from '@/lib/supabase';

export type AuthProvider = 'apple' | 'google';

export interface AuthUser {
  id: string;
  email: string;
}

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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function signUp(
  email: string,
  password: string,
  userData: { birthdate: string; age: number; firstName?: string; lastName?: string }
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    console.log('Starting Supabase sign up for:', email);

    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join(', ') };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    console.log('Auth user created:', authData.user.id);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        birthdate: userData.birthdate,
        age: userData.age,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      console.error('Profile error details:', JSON.stringify(profileError, null, 2));
      const errorMessage = profileError.message || profileError.hint || 'Failed to create profile';
      return { success: false, error: `Profile creation failed: ${errorMessage}` };
    }

    console.log('Profile created successfully:', profileData.id);

    return {
      success: true,
      user: {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        birthdate: profileData.birthdate,
        age: profileData.age,
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Failed to create account' };
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    console.log('Starting Supabase sign in for:', email);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase sign in error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to sign in' };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      console.error('Profile fetch error:', profileError);
      console.error('Profile fetch error details:', JSON.stringify(profileError, null, 2));
      const errorMessage = profileError?.message || profileError?.hint || 'Failed to fetch profile';
      return { success: false, error: `Failed to fetch profile: ${errorMessage}` };
    }

    console.log('User signed in successfully:', profileData.id);

    await supabase.from('activity_logs').insert({
      user_id: profileData.id,
      event: 'sign_in',
      metadata: { email },
    });

    return {
      success: true,
      user: {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        birthdate: profileData.birthdate,
        age: profileData.age,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

export async function signInWithProvider(
  provider: AuthProvider
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    console.log('OAuth sign-in not yet implemented for:', provider);
    return { success: false, error: 'OAuth coming soon' };
  } catch (error) {
    console.error('Provider sign-in error:', error);
    return { success: false, error: 'Unable to sign in with provider' };
  }
}

export async function restoreSession(): Promise<{ success: boolean; user?: any }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.log('No active session found');
      return { success: false };
    }

    console.log('Active session found, fetching profile for user:', session.user.id);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      console.error('Profile fetch error details:', JSON.stringify(profileError, null, 2));
      return { success: false };
    }

    if (!profileData) {
      console.error('No profile data found');
      return { success: false };
    }

    console.log('Session restored for user:', profileData.id, {
      hasUniversity: !!profileData.university,
      hasCity: !!profileData.city,
      hasPhotos: !!profileData.photos?.length,
      hasBio: !!profileData.short_bio,
    });

    // Map database fields to User object
    const user = {
      id: profileData.id,
      email: profileData.email || session.user.email || '',
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      birthdate: profileData.birthdate || '',
      age: profileData.age || 0,
      gender: profileData.gender || undefined,
      university: profileData.university || '',
      city: profileData.city || '',
      country: profileData.country || undefined,
      geo: profileData.geo || { lat: 0, lng: 0 },
      hasRoom: profileData.has_room || false,
      shortBio: profileData.short_bio || '',
      photos: profileData.photos || [],
      videoIntroUrl: profileData.video_intro_url || undefined,
      voiceIntroUrl: profileData.voice_intro_url || undefined,
      igUrl: profileData.ig_url || undefined,
      linkedinUrl: profileData.linkedin_url || undefined,
      tiktokUrl: profileData.tiktok_url || undefined,
      createdAt: profileData.created_at || new Date().toISOString(),
      badges: profileData.badges || [],
      isDemo: profileData.is_demo || false,
      paused: profileData.paused || false,
      walkthroughSeen: profileData.walkthrough_seen || false,
      autoMatchMessage: profileData.auto_match_message || undefined,
      sendAutoMatchMessage: profileData.send_auto_match_message !== false,
      recommendationCode: profileData.recommendation_code || undefined,
    };

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Session restore error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return { success: false };
  }
}

export async function logActivity(
  userId: string,
  event: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      event,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
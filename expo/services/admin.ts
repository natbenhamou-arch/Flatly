import { useFeatureStore, FeatureFlagsLite } from '@/store/useAppStore';
import { seedDemoUsers, clearDemoUsers } from '@/services/data';

export type FeatureFlagKey = 'boosts' | 'superLikes' | 'loosenCityGate';

export function setFeatureFlag(key: FeatureFlagKey, value: boolean): void {
  try {
    const current = useFeatureStore.getState().featureFlags;
    if (current[key] === value) return;
    const updated: FeatureFlagsLite = { ...current, [key]: value } as FeatureFlagsLite;
    useFeatureStore.setState({ featureFlags: updated });
    console.log('Feature flag updated', { key, value });
  } catch (e) {
    console.error('setFeatureFlag error', e);
  }
}

export function getFeatureFlags(): FeatureFlagsLite {
  try {
    return useFeatureStore.getState().featureFlags;
  } catch (e) {
    console.error('getFeatureFlags error', e);
    return { boosts: true, superLikes: true, loosenCityGate: false };
  }
}

export function banUser(userId: string): void {
  try {
    const { banUser } = useFeatureStore.getState();
    banUser(userId);
    console.log('User banned', { userId });
    
    // Note: Feed refresh will happen automatically on next load due to banned user filter
  } catch (e) {
    console.error('banUser error', e);
  }
}

export function unbanUser(userId: string): void {
  try {
    const { unbanUser } = useFeatureStore.getState();
    unbanUser(userId);
    console.log('User unbanned', { userId });
  } catch (e) {
    console.error('unbanUser error', e);
  }
}

export async function seedDemoUsersProxy(): Promise<void> {
  try {
    await seedDemoUsers();
    console.log('seedDemoUsersProxy done');
  } catch (e) {
    console.error('seedDemoUsersProxy error', e);
  }
}

export async function clearDemoUsersProxy(): Promise<void> {
  try {
    await clearDemoUsers();
    console.log('clearDemoUsersProxy done');
  } catch (e) {
    console.error('clearDemoUsersProxy error', e);
  }
}

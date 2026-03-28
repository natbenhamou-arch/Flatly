import { create } from 'zustand';

export interface FeatureFlagsLite {
  boosts: boolean;
  superLikes: boolean;
  loosenCityGate: boolean;
}

interface AppFeatureState {
  featureFlags: FeatureFlagsLite;
  bannedUserIds: Set<string>;
  toggleFlag: (key: keyof FeatureFlagsLite) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  isBanned: (userId: string) => boolean;
}

export const useFeatureStore = create<AppFeatureState>((set, get) => ({
  featureFlags: {
    boosts: true,
    superLikes: true,
    loosenCityGate: false,
  },
  bannedUserIds: new Set<string>(),
  toggleFlag: (key) => {
    set((state) => ({
      featureFlags: { ...state.featureFlags, [key]: !state.featureFlags[key] },
    }));
  },
  banUser: (userId) => {
    const current = new Set<string>(get().bannedUserIds);
    current.add(userId);
    set({ bannedUserIds: current });
  },
  unbanUser: (userId) => {
    const current = new Set<string>(get().bannedUserIds);
    current.delete(userId);
    set({ bannedUserIds: current });
  },
  isBanned: (userId) => get().bannedUserIds.has(userId),
}));

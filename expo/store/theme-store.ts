import { useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const THEME_STORAGE_KEY = '@flatly:theme';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
        setThemeMode(stored as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    saveTheme(newMode);
  }, [themeMode, saveTheme]);

  const isDark = useMemo(() => {
    return themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
  }, [themeMode, systemColorScheme]);

  return useMemo(() => ({
    themeMode,
    setThemeMode: saveTheme,
    toggleTheme,
    isDark,
    isLoading,
  }), [themeMode, saveTheme, toggleTheme, isDark, isLoading]);
});

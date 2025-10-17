import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Bell, Moon, SunMedium, Shield, Crown, Settings } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';
import { router, usePathname } from 'expo-router';
import { useAppStore } from '@/store/app-store';

interface TopBarProps {
  testID?: string;
}

export function TopBar({ testID }: TopBarProps) {
  const systemScheme = useColorScheme();
  const { featureFlags } = useAppStore();
  const [isDark, setIsDark] = React.useState<boolean>(systemScheme === 'dark');
  const [notifCount, setNotifCount] = React.useState<number>(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setNotifCount((c) => c); // placeholder for future store-synced count
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const go = (path: string) => {
    try { router.push(path as any); } catch (e) { console.log('Nav error', e); }
  };

  return (
    <View style={styles.container} testID={testID ?? 'top-bar'}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setIsDark((v) => !v)}
        style={styles.iconBtn}
        testID="toggle-dark"
      >
        {isDark ? (
          <SunMedium color={colors.textPrimary} size={20} />
        ) : (
          <Moon color={colors.textPrimary} size={20} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => go('/privacy')}
        style={styles.iconBtn}
        testID="privacy"
      >
        <Shield color={colors.textPrimary} size={20} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => go('/store')}
        style={styles.iconBtn}
        testID="store"
      >
        <Crown color={colors.textPrimary} size={20} />
      </TouchableOpacity>

      <View style={styles.badgeWrap}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => go('/activity')}
          style={styles.iconBtn}
          testID="notifications"
        >
          <Bell color={colors.textPrimary} size={20} />
        </TouchableOpacity>
        {notifCount > 0 ? (
          <View style={styles.badge} testID="notif-badge">
            <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => go('/settings')}
        style={styles.iconBtn}
        testID="settings"
      >
        <Settings color={colors.textPrimary} size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    borderRadius: radius.small,
  },
  badgeWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing, radius } from '@/constants/theme';
import { Shield, Bell, BookOpen } from 'lucide-react-native';

export default function SettingsHome() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ClayCard style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/settings/notifications' as any)}>
          <Bell color={colors.textPrimary} size={18} />
          <Text style={styles.text}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/settings/support' as any)}>
          <BookOpen color={colors.textPrimary} size={18} />
          <Text style={styles.text}>Student Support Hub</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/privacy' as any)}>
          <Shield color={colors.textPrimary} size={18} />
          <Text style={styles.text}>Privacy & Safety</Text>
        </TouchableOpacity>
      </ClayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  card: { },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  text: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing, radius } from '@/constants/theme';

export default function NotificationSettings() {
  const [toggles, setToggles] = useState({ matches: true, messages: true, likes: true, promos: false });
  const toggle = (k: keyof typeof toggles) => setToggles((t) => ({ ...t, [k]: !t[k] }));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ClayCard style={styles.card}>
        {(
          [
            { k: 'matches', label: 'New Matches' },
            { k: 'messages', label: 'New Messages' },
            { k: 'likes', label: 'Likes' },
            { k: 'promos', label: 'Promotions' },
          ] as const
        ).map((row) => (
          <View key={row.k} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <TouchableOpacity onPress={() => toggle(row.k)} style={[styles.switch, toggles[row.k] ? styles.on : styles.off]}>
              <View style={[styles.knob, toggles[row.k] ? styles.knobOn : styles.knobOff]} />
            </TouchableOpacity>
          </View>
        ))}
      </ClayCard>
      <Text style={styles.hint}>Your preferences are saved instantly on this device.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  card: { },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  label: { color: colors.textPrimary, fontWeight: '600' },
  switch: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' },
  on: { backgroundColor: colors.lavender },
  off: { backgroundColor: colors.softLilac },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white, transform: [{ translateX: 0 }] },
  knobOn: { transform: [{ translateX: 20 }] },
  knobOff: { transform: [{ translateX: 0 }] },
  hint: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: 12 },
});

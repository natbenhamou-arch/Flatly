import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing } from '@/constants/theme';

export default function PrivacySafety() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy & Safety' }} />
      <ClayCard style={styles.card}>
        <Text style={styles.title}>Controls</Text>
        <Text style={styles.item}>• Hide sensitive fields (politics, religion) in Profile</Text>
        <Text style={styles.item}>• Pause profile from Discover</Text>
        <Text style={styles.item}>• Report and block users from Chat</Text>
      </ClayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  card: { },
  title: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm },
  item: { color: colors.textSecondary, marginBottom: 6 },
});

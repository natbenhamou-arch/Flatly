import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing } from '@/constants/theme';

export default function StoreScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Premium' }} />
      <ClayCard style={styles.card}>
        <Text style={styles.title}>Premium Coming Soon</Text>
        <Text style={styles.item}>Boosts, Super Likes, and more.</Text>
      </ClayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  card: { },
  title: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm },
  item: { color: colors.textSecondary },
});

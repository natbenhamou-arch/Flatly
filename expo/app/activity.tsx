import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing } from '@/constants/theme';

interface ActivityItem { id: string; type: 'match' | 'message' | 'like' | 'promo' | 'verify'; text: string; createdAt: string; read?: boolean }

const demo: ActivityItem[] = [
  { id: 'a1', type: 'match', text: "It's a Match with Alice", createdAt: new Date().toISOString() },
  { id: 'a2', type: 'message', text: 'New message from Bob', createdAt: new Date().toISOString() },
];

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Activity' }} />
      <FlatList
        data={demo}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ClayCard style={styles.row}>
            <Text style={styles.text}>{item.text}</Text>
            <Text style={styles.time}>Just now</Text>
          </ClayCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  row: { marginBottom: spacing.sm, paddingVertical: spacing.sm },
  text: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  time: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
});

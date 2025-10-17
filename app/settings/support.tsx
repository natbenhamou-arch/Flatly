import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ClayCard } from '@/components/ClayCard';
import { colors, spacing } from '@/constants/theme';
import { ExternalLink } from 'lucide-react-native';

function CardRow({ title, desc, onPress }: { title: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.resourceRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <ExternalLink size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function SupportHub() {
  const open = (url: string) => { Linking.openURL(url).catch(() => {}); };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Student Support Hub' }} />
      <ClayCard style={styles.card}>
        <Text style={styles.groupTitle}>Move-in Checklists</Text>
        <CardRow title="Before Moving" desc="Essentials to prepare and inspect" onPress={() => open('https://www.apartmentlist.com/renter-life/moving-checklist')} />
        <CardRow title="After Moving" desc="Setup utilities, roommate routines" onPress={() => open('https://www.move.org/moving-checklist/')} />
      </ClayCard>

      <ClayCard style={styles.card}>
        <Text style={styles.groupTitle}>Finance & Budget Templates</Text>
        <CardRow title="Shared Budget" desc="Track rent, bills, chores" onPress={() => open('https://www.notion.so/templates/budget')} />
        <CardRow title="Student Budget" desc="Monthly planner" onPress={() => open('https://templates.office.com/en-us/student-budget-template-tm04039556')} />
      </ClayCard>

      <ClayCard style={styles.card}>
        <Text style={styles.groupTitle}>Roommate Agreements & House Rules</Text>
        <CardRow title="Roommate Agreement" desc="Template (editable)" onPress={() => open('https://www.lawdepot.com/contracts/roommate-agreement/')} />
      </ClayCard>

      <ClayCard style={styles.card}>
        <Text style={styles.groupTitle}>University Services & Mental Health</Text>
        <CardRow title="Find Services" desc="Counseling, support, campus help" onPress={() => open('https://jedfoundation.org/resource-library/college-students/')} />
      </ClayCard>

      <ClayCard style={styles.card}>
        <Text style={styles.groupTitle}>Local Housing Help & Tenants’ Rights</Text>
        <CardRow title="Know Your Rights" desc="Guides by city/state" onPress={() => open('https://www.tenantstogether.org/resources')} />
      </ClayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  card: { marginBottom: spacing.md, paddingVertical: spacing.sm },
  groupTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  resourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  title: { color: colors.textPrimary, fontWeight: '600' },
  desc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});

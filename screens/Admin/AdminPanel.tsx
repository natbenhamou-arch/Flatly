import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, FlatList, TouchableOpacity, Platform } from 'react-native';
import { ClayCard } from '@/components/ClayCard';
import { ClayButton } from '@/components/ClayButton';
import { setFeatureFlag, getFeatureFlags, seedDemoUsersProxy, clearDemoUsersProxy, banUser, FeatureFlagKey } from '@/services/admin';
import { getReports } from '@/services/report';

interface ReportRow {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
}

class AdminPanelErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: (error as Error)?.message ?? 'Unknown error' };
  }
  componentDidCatch(error: unknown) {
    console.error('AdminPanel crashed', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorWrap} testID="admin-error">
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMsg}>{this.state.message ?? 'Unexpected error'}</Text>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text accessibilityRole={Platform.OS === 'web' ? 'header' : undefined} style={styles.sectionTitle} testID={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</Text>
  );
}

function FlagSwitch({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID: string }) {
  return (
    <View style={styles.switchRow} testID={testID}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? '#fff' : '#fff'}
        trackColor={{ false: '#d1d5db', true: '#34d399' }}
      />
    </View>
  );
}

const ReportItem = React.memo(function ReportItem({ item, onBan }: { item: ReportRow; onBan: (userId: string) => void }) {
  return (
    <ClayCard style={styles.reportCard} testID={`report-${item.reporterId}-${item.reportedUserId}`}>
      <View style={styles.reportRow}>
        <View style={styles.flex1}>
          <Text style={styles.reportText}>Reporter: <Text style={styles.mono}>{item.reporterId}</Text></Text>
          <Text style={styles.reportText}>Reported: <Text style={styles.mono}>{item.reportedUserId}</Text></Text>
          <Text style={styles.reportReason}>Reason: {item.reason}</Text>
          <Text style={styles.reportDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <TouchableOpacity onPress={() => onBan(item.reportedUserId)} style={styles.banBtn} testID={`ban-${item.reportedUserId}`}>
          <Text style={styles.banBtnText}>Ban user</Text>
        </TouchableOpacity>
      </View>
    </ClayCard>
  );
});

export function AdminPanel(): React.ReactElement {
  const [flags, setFlags] = useState<{ boosts: boolean; superLikes: boolean; loosenCityGate: boolean }>({ boosts: true, superLikes: true, loosenCityGate: false });
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loadingSeed, setLoadingSeed] = useState<boolean>(false);
  const [loadingClear, setLoadingClear] = useState<boolean>(false);

  const refreshFlags = useCallback(() => {
    try {
      const f = getFeatureFlags();
      console.log('AdminPanel refreshFlags', f);
      setFlags({ boosts: !!f.boosts, superLikes: !!f.superLikes, loosenCityGate: !!f.loosenCityGate });
    } catch (e) {
      console.error('refreshFlags error', e);
    }
  }, []);

  const refreshReports = useCallback(() => {
    try {
      const list = getReports();
      console.log('AdminPanel refreshReports count', list.length);
      setReports(list);
    } catch (e) {
      console.error('refreshReports error', e);
      setReports([]);
    }
  }, []);

  useEffect(() => {
    refreshFlags();
    refreshReports();
  }, [refreshFlags, refreshReports]);

  const onToggle = useCallback((key: FeatureFlagKey, value: boolean) => {
    try {
      setFeatureFlag(key, value);
      setFlags(prev => ({ ...prev, [key]: value }));
    } catch (e) {
      console.error('setFeatureFlag UI error', e);
      Alert.alert('Error', 'Failed to update flag');
    }
  }, []);

  const handleSeed = useCallback(async () => {
    try {
      setLoadingSeed(true);
      await seedDemoUsersProxy();
      Alert.alert('Done', 'Demo users generated');
    } catch (e) {
      console.error('seed error', e);
      Alert.alert('Error', 'Failed to seed users');
    } finally {
      setLoadingSeed(false);
    }
  }, []);

  const handleClear = useCallback(async () => {
    try {
      setLoadingClear(true);
      await clearDemoUsersProxy();
      Alert.alert('Done', 'Demo users cleared');
    } catch (e) {
      console.error('clear error', e);
      Alert.alert('Error', 'Failed to clear demo users');
    } finally {
      setLoadingClear(false);
    }
  }, []);

  const onBan = useCallback((userId: string) => {
    try {
      banUser(userId);
      Alert.alert('Banned', `User ${userId} has been banned`);
    } catch (e) {
      console.error('ban user error', e);
      Alert.alert('Error', 'Failed to ban user');
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: ReportRow }) => (
    <ReportItem item={item} onBan={onBan} />
  ), [onBan]);

  const keyExtractor = useCallback((r: ReportRow, index: number) => `${r.reporterId}-${r.reportedUserId}-${index}`, []);

  const flagsMemo = useMemo(() => flags, [flags]);

  return (
    <AdminPanelErrorBoundary>
      <View style={styles.container} testID="admin-panel">
        <SectionHeader title="Feature Flags" />
        <ClayCard style={styles.card} testID="flags-card">
          <FlagSwitch label="Boosts" value={flagsMemo.boosts} onValueChange={(v) => onToggle('boosts', v)} testID="flag-boosts" />
          <FlagSwitch label="Super Likes" value={flagsMemo.superLikes} onValueChange={(v) => onToggle('superLikes', v)} testID="flag-superLikes" />
          <FlagSwitch label="Loosen City Gate" value={flagsMemo.loosenCityGate} onValueChange={(v) => onToggle('loosenCityGate', v)} testID="flag-loosenCityGate" />
        </ClayCard>

        <SectionHeader title="Seeding" />
        <ClayCard style={styles.card} testID="seeding-card">
          <View style={styles.row}>
            <ClayButton onPress={handleSeed} disabled={loadingSeed} testID="seed-btn" title={loadingSeed ? 'Seeding...' : 'Generate Demo Users'} />
          </View>
          <View style={styles.row}>
            <ClayButton onPress={handleClear} disabled={loadingClear} testID="clear-btn" title={loadingClear ? 'Clearing...' : 'Clear Demo Users'} />
          </View>
        </ClayCard>

        <View style={styles.reportsHeaderRow}>
          <SectionHeader title="Reports" />
          <TouchableOpacity onPress={refreshReports} style={styles.refreshBtn} testID="refresh-reports">
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <ClayCard style={[styles.card, styles.zeroPad]} testID="reports-card">
          {reports.length === 0 ? (
            <View style={styles.emptyWrap} testID="reports-empty"><Text style={styles.emptyText}>No reports</Text></View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ClayCard>
      </View>
    </AdminPanelErrorBoundary>
  );
}

export default AdminPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7fb',
  },
  card: {
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  reportsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  refreshText: {
    color: '#111827',
    fontWeight: '500',
  },
  reportCard: {
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reportText: {
    fontSize: 14,
    color: '#111827',
  },
  reportReason: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  reportDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  mono: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
  },
  banBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  banBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMsg: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyWrap: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
  listContent: {
    paddingBottom: 12,
  },
  zeroPad: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  flex1: {
    flex: 1,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Clock, Plus, Trash2, Save } from 'lucide-react-native';
import { useAppStore } from '@/store/app-store';
import { ClayCard } from '@/components/ClayCard';
import { ClayButton } from '@/components/ClayButton';
import { colors, spacing } from '@/constants/theme';
import { getAvailabilityByUserId, setAvailability } from '@/services/data';
import { Availability } from '@/types';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  available: boolean;
  timeSlots: TimeSlot[];
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const TIME_OPTIONS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function AvailabilityScreen() {
  const { currentUser } = useAppStore();
  const [schedule, setSchedule] = useState<{ [key: string]: DaySchedule }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadAvailability();
  }, [currentUser]);

  const loadAvailability = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const availability = await getAvailabilityByUserId(currentUser.id);
      
      if (availability) {
        setSchedule(availability.weeklySchedule);
      } else {
        // Initialize with default schedule
        const defaultSchedule: { [key: string]: DaySchedule } = {};
        DAYS.forEach(day => {
          defaultSchedule[day.key] = {
            available: false,
            timeSlots: []
          };
        });
        setSchedule(defaultSchedule);
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayKey: string, available: boolean) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        available,
        timeSlots: available ? prev[dayKey]?.timeSlots || [] : []
      }
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: [
          ...(prev[dayKey]?.timeSlots || []),
          { start: '10:00', end: '12:00' }
        ]
      }
    }));
  };

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const removeTimeSlot = (dayKey: string, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const availability: Availability = {
        userId: currentUser.id,
        weeklySchedule: schedule,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredViewingTimes: [
          'Weekday afternoons',
          'Weekend mornings',
          'After 5 PM on weekdays'
        ]
      };

      await setAvailability(availability);
      Alert.alert('Success', 'Your availability has been saved!');
    } catch (error) {
      console.error('Failed to save availability:', error);
      Alert.alert('Error', 'Failed to save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderTimeSlot = (dayKey: string, slot: TimeSlot, index: number) => (
    <View key={index} style={styles.timeSlotContainer}>
      <View style={styles.timePickerRow}>
        <TouchableOpacity style={styles.timePicker}>
          <Text style={styles.timeText}>{slot.start}</Text>
        </TouchableOpacity>
        <Text style={styles.timeToText}>to</Text>
        <TouchableOpacity style={styles.timePicker}>
          <Text style={styles.timeText}>{slot.end}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeTimeSlot(dayKey, index)}
        >
          <Trash2 color={colors.textSecondary} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDay = (day: { key: string; label: string }) => {
    const daySchedule = schedule[day.key] || { available: false, timeSlots: [] };

    return (
      <ClayCard key={day.key} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>{day.label}</Text>
          <Switch
            value={daySchedule.available}
            onValueChange={(value) => handleDayToggle(day.key, value)}
            trackColor={{ false: colors.textSecondary + '30', true: colors.lavender + '50' }}
            thumbColor={daySchedule.available ? colors.lavender : colors.textSecondary}
          />
        </View>

        {daySchedule.available && (
          <View style={styles.timeSlotsContainer}>
            {daySchedule.timeSlots.map((slot, index) => 
              renderTimeSlot(day.key, slot, index)
            )}
            
            <TouchableOpacity
              style={styles.addTimeSlotButton}
              onPress={() => addTimeSlot(day.key)}
            >
              <Plus color={colors.lavender} size={16} />
              <Text style={styles.addTimeSlotText}>Add time slot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ClayCard>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading availability...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Availability',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Save color={saving ? colors.textSecondary : colors.lavender} size={24} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Clock color={colors.lavender} size={32} />
          <Text style={styles.headerTitle}>Set Your Availability</Text>
          <Text style={styles.headerSubtitle}>
            Let others know when you're available for apartment viewings
          </Text>
        </View>

        <View style={styles.daysContainer}>
          {DAYS.map(renderDay)}
        </View>

        <View style={styles.tipContainer}>
          <ClayCard style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Pro Tip</Text>
            <Text style={styles.tipText}>
              Setting your availability helps us suggest the best viewing times when you're in a group. 
              The more flexible you are, the easier it is to coordinate with others!
            </Text>
          </ClayCard>
        </View>

        <ClayButton
          title={saving ? 'Saving...' : 'Save Availability'}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  daysContainer: {
    paddingHorizontal: spacing.md,
  },
  dayCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeSlotsContainer: {
    marginTop: spacing.sm,
  },
  timeSlotContainer: {
    marginBottom: spacing.sm,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timePicker: {
    backgroundColor: colors.mint + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  timeToText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addTimeSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lavender + '50',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addTimeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.lavender,
    marginLeft: spacing.xs,
  },
  tipContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tipCard: {
    padding: spacing.md,
    backgroundColor: colors.mint + '10',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  saveButton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
});
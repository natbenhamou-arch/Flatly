import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { colors, spacing } from '@/constants/theme';

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export function OnboardingProgressBar({ currentStep, totalSteps, stepTitles }: OnboardingProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  const currentTitle = stepTitles?.[currentStep - 1] || 'Onboarding';
  const pathname = usePathname();
  
  const handleBack = () => {
    const steps = [
      'full-name',
      'school-city',
      'housing',
      'interests',
      'lifestyle',
      'vibe',
      'preferences',
      'media',
      'review-create',
    ];

    const parts = pathname.split('/');
    const last = parts[parts.length - 1] || '';
    const idx = steps.indexOf(last);

    if (idx <= 0) {
      router.push('/onboarding/');
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      const prev = steps[idx - 1];
      router.push(`/onboarding/${prev}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.stepTitle}>{currentTitle}</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  stepTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
    minWidth: 8,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
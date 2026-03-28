import React from 'react';
import { Stack, usePathname } from 'expo-router';
import { theme } from '@/constants/theme';
import { OnboardingProgressBar } from '@/components/OnboardingProgressBar';

const ONBOARDING_STEPS = [
  'full-name',
  'school-city',
  'housing', 
  'interests',
  'lifestyle',
  'vibe',
  'preferences',
  'media',
  'review-create'
];

const STEP_TITLES = [
  'Full Name',
  'School & City',
  'Housing Details',
  'Interests',
  'Lifestyle', 
  'Vibe Questionnaire',
  'Matching Preferences',
  'Photos & Media',
  'Create Account'
];

function OnboardingHeader() {
  const pathname = usePathname();
  const currentRoute = pathname.split('/').pop();
  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentRoute || '');
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
  
  return (
    <OnboardingProgressBar 
      currentStep={currentStep}
      totalSteps={ONBOARDING_STEPS.length}
      stepTitles={STEP_TITLES}
    />
  );
}

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => <OnboardingHeader />,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="full-name" />
      <Stack.Screen name="school-city" />
      <Stack.Screen name="housing" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen name="vibe" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="media" />
      <Stack.Screen name="review-create" />
    </Stack>
  );
}

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FlatlyLogo } from '@/components/FlatlyLogo';

export default function OnboardingWelcome() {
  const insets = useSafeAreaInsets();
  
  const handleStartJourney = () => {
    router.push('./school-city');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} testID="onboarding-welcome">
      <LinearGradient
        colors={['#0B1220', '#0E1B3A', '#0B1220']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <FlatlyLogo size={120} withText={true} testID="welcome-logo" />
          </View>

          <View style={styles.centerContent}>
            <Text style={styles.tagline}>
              Find your perfect roommate
            </Text>
          </View>

          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartJourney}
              activeOpacity={0.8}
              testID="get-started-button"
            >
              <Text style={styles.startButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  ctaSection: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});

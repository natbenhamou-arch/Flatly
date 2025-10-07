import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';


export default function OnboardingWelcome() {
  const insets = useSafeAreaInsets();
  
  const handleStartJourney = () => {
    router.push('./school-city');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#2563EB', '#1E40AF', '#1E3A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Thunder Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/344pj7718gxg1qvcgbgp1' }}
              style={styles.thunderLogo}
              resizeMode="contain"
            />
          </View>

          {/* Minimalistic Center Content */}
          <View style={styles.centerContent}>
            {/* App Name */}
            <Text style={styles.appName}>flatly</Text>
            
            {/* Simple Tagline */}
            <Text style={styles.tagline}>
              Find your perfect roommate
            </Text>
          </View>

          {/* Simple CTA */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartJourney}
              activeOpacity={0.8}
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
    marginTop: 20,
  },
  thunderLogo: {
    width: 80,
    height: 80,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '300',
  },
  ctaSection: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
});
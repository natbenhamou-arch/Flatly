import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { theme, colors, gradients } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { Apple, Facebook } from 'lucide-react-native';

export default function IndexScreen() {
  const { currentUser, initializeApp, isLoading, hasCompletedOnboarding } = useAppStore();
  const styles = getStyles();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Handle navigation when user is signed in
  useEffect(() => {
    if (!isLoading && currentUser) {
      console.log('User detected, redirecting to app...');
      // Use setTimeout to avoid state update during render
      const timeoutId = setTimeout(() => {
        if (hasCompletedOnboarding) {
          router.replace('/(tabs)/discover');
        } else {
          router.replace('/onboarding');
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, isLoading, hasCompletedOnboarding]);

  const handleGetStarted = () => {
    console.log('Navigate to sign up...');
    router.push('/signup');
  };

  const handleSignIn = () => {
    console.log('Navigate to sign in...');
    router.push('/signin');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Flatly...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render anything if user is signed in (navigation will happen)
  if (currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.navy}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/344pj7718gxg1qvcgbgp1' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title} testID="brand-wordmark">FLATLY</Text>
              <Text style={styles.subtitle}>
                Find your perfect roommate.
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGetStarted}
                testID="apple-signin-button"
              >
                <Apple size={20} color="#000" />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGetStarted}
                testID="google-signin-button"
              >
                <View style={styles.googleIcon}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGetStarted}
                testID="facebook-signin-button"
              >
                <Facebook size={20} color="#1877F2" fill="#1877F2" />
                <Text style={styles.socialButtonText}>Continue with Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSignIn}
                testID="sign-in-button"
              >
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme?.colors?.text?.secondary || '#4C5768',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: 'white',
    textAlign: 'center' as const,
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    lineHeight: 26,
    fontWeight: '400' as const,
    fontFamily: 'Montserrat-Regular',
  },
  featureCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  feature: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    flex: 1,
    fontWeight: '600' as const,
  },
  actions: {
    gap: 12,
    paddingBottom: 32,
  },
  socialButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.secondary,
    fontFamily: 'Montserrat-SemiBold',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  googleG: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
    fontFamily: 'Montserrat-SemiBold',
  },
});
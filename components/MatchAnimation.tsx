import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '@/constants/theme';

interface MatchAnimationProps {
  visible: boolean;
  onComplete: () => void;
  matchedUserName?: string;
}

const { width, height } = Dimensions.get('window');

export function MatchAnimation({ visible, onComplete }: MatchAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [visible]);

  const startAnimation = () => {
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        console.log('Haptics not available');
      }
    }

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        ...confettiAnims.map((anim, index) => {
          const angle = (index / confettiAnims.length) * 2 * Math.PI;
          const distance = 150 + Math.random() * 100;
          return Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: Math.sin(angle) * distance - 200,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: Math.random() * 720,
              duration: 800,
              useNativeDriver: true,
            }),
          ]);
        }),
      ]),
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        ...confettiAnims.map(anim =>
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ),
      ]),
    ]).start(() => {
      resetAnimation();
      onComplete();
    });
  };

  const resetAnimation = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.3);
    glowAnim.setValue(0);
    confettiAnims.forEach(anim => {
      anim.translateX.setValue(0);
      anim.translateY.setValue(0);
      anim.rotate.setValue(0);
      anim.opacity.setValue(0);
    });
  };

  if (!visible) return null;

  const confettiColors = [colors.lavender, colors.mint, colors.babyBlue, colors.peach];

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />

      <View style={styles.centerContainer}>
        {/* Custom bolt built from views (no external image) */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.boltContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.boltTop} />
          <View style={styles.boltBottom} />
        </Animated.View>
      </View>

      {confettiAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiParticle,
            {
              backgroundColor: confettiColors[index % confettiColors.length],
              opacity: anim.opacity,
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                { rotate: anim.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
            },
          ]}
        />
      ))}

      {confettiAnims.slice(0, 6).map((anim, index) => (
        <Animated.View
          key={`spark-${index}`}
          style={[
            styles.sparkleParticle,
            {
              opacity: anim.opacity,
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                { scale: 0.7 + Math.random() * 0.3 },
              ],
            },
          ]}
        >
          <Sparkles
            color={confettiColors[index % confettiColors.length]}
            size={18}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primary,
    opacity: 0.4,
    filter: undefined,
  },
  boltContainer: {
    width: 140,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltTop: {
    width: 100,
    height: 90,
    backgroundColor: colors.white,
    transform: [{ skewY: '-20deg' as any }, { rotate: '-25deg' }],
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  boltBottom: {
    width: 90,
    height: 110,
    marginTop: -20,
    backgroundColor: colors.white,
    transform: [{ skewY: '-20deg' as any }, { rotate: '-25deg' }],
    borderBottomRightRadius: 12,
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: height / 2,
    left: width / 2,
  },
  sparkleParticle: {
    position: 'absolute',
    top: height / 2,
    left: width / 2,
  },
});
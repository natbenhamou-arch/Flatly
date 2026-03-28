import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';
import { FlatlyLogo } from './FlatlyLogo';

interface BrandPatternProps {
  variant?: 'subtle' | 'header' | 'footer';
  style?: ViewStyle;
}

export function BrandPattern({ variant = 'subtle', style }: BrandPatternProps) {
  if (variant === 'header') {
    return (
      <View style={[styles.headerPattern, style]}>
        <View style={styles.headerAccent} />
        <View style={[styles.headerAccent, styles.headerAccent2]} />
      </View>
    );
  }

  if (variant === 'footer') {
    return (
      <View style={[styles.footerPattern, style]}>
        <View style={styles.watermarkContainer}>
          <FlatlyLogo size={80} tintColor={colors.primary + '08'} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.subtlePattern, style]}>
      <View style={styles.dot} />
      <View style={[styles.dot, styles.dot2]} />
      <View style={[styles.dot, styles.dot3]} />
      <View style={[styles.dot, styles.dot4]} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  headerAccent: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 4,
  },
  headerAccent2: {
    backgroundColor: colors.accentDark,
    flex: 2,
  },
  footerPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermarkContainer: {
    opacity: 1,
    marginBottom: 20,
  },
  subtlePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  dot: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '04',
  },
  dot2: {
    top: '20%',
    right: '-30%',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  dot3: {
    bottom: '10%',
    left: '-20%',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  dot4: {
    top: '60%',
    right: '5%',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});

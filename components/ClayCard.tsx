import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, radius, gradients } from '@/constants/theme';

export interface ClayCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'soft' | 'pressed' | 'gradient';
  gradientType?: 'primary' | 'secondary' | 'navy' | 'sky' | 'deep' | 'soft';
  testID?: string;
}

export function ClayCard({ children, style, variant = 'default', gradientType = 'primary', testID }: ClayCardProps) {
  const cardStyle = [
    styles.card,
    variant === 'soft' && styles.softCard,
    variant === 'pressed' && styles.pressedCard,
    variant === 'gradient' && styles.gradientCard,
    style,
  ];

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={gradients[gradientType]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyle}
        testID={testID}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={cardStyle} testID={testID}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 20,
    ...shadows.card,
  },
  softCard: {
    backgroundColor: colors.softLilac,
    ...shadows.soft,
  },
  pressedCard: {
    ...shadows.clayInner,
    transform: [{ scale: 0.98 }],
  },
  gradientCard: {
    backgroundColor: 'transparent',
    borderRadius: radius.xl,
    padding: 20,
    ...shadows.floating,
  },
});
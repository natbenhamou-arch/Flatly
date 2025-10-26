import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, radius, gradients } from '@/constants/theme';

export interface ClayButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'gradient';
  gradientType?: 'primary' | 'secondary' | 'navy' | 'sky' | 'deep' | 'soft';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  children?: React.ReactNode;
  testID?: string;
}

export function ClayButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  gradientType = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
  children,
  testID,
}: ClayButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[size],
    variant !== 'gradient' && styles[variant],
    variant === 'gradient' && styles.gradientButton,
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles],
    variant !== 'gradient' && styles[`${variant}Text` as keyof typeof styles],
    variant === 'gradient' && styles.gradientText,
    disabled && styles.disabledText,
    textStyle,
  ];

  if (variant === 'gradient' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        testID={testID}
      >
        <LinearGradient
          colors={gradients[gradientType]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyle}
        >
          {children || <Text style={buttonTextStyle}>{title}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
    >
      {children || <Text style={buttonTextStyle}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  small: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    minHeight: 56,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  gradientButton: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: colors.borderLight,
    ...shadows.soft,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat-SemiBold',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },
  warningText: {
    color: colors.textPrimary,
  },
  gradientText: {
    color: colors.white,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});
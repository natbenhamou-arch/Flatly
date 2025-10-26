import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { FlatlyLogo } from './FlatlyLogo';

export function BrandHeader() {
  return (
    <View style={styles.container} testID="brand-header">
      <FlatlyLogo size={32} tintColor={colors.primary} />
      <Text style={styles.brandText}>flatly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primary,
    marginLeft: 8,
  },
});

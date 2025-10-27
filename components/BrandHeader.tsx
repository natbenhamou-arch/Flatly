import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlatlyLogo } from './FlatlyLogo';

export function BrandHeader() {
  return (
    <View style={styles.container} testID="brand-header">
      <FlatlyLogo size={32} withText={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

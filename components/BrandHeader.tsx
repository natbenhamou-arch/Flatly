import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

export function BrandHeader() {
  return (
    <View style={styles.container} testID="brand-header">
      <Image 
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/344pj7718gxg1qvcgbgp1' }} 
        style={styles.logo} 
        resizeMode="contain" 
      />
      <Text style={styles.brandText}>FLATLY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 32,
    marginRight: 8,
  },
  brandText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.secondary,
  },
});

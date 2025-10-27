import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface FlatlyLogoProps {
  size?: number;
  withText?: boolean;
  testID?: string;
}

export function FlatlyLogo({ size = 32, withText = false, testID }: FlatlyLogoProps) {
  const iconSource = { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/k85le14jv39gqc1gdeveb' };
  const fullLogoSource = { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lww37ptutpiksu46epkra' };

  if (withText) {
    return (
      <View style={styles.wrapper} testID={testID ?? 'flatly-logo-full'}>
        <Image
          source={fullLogoSource}
          style={[styles.logo, { height: size * 1.5, width: size * 2.5 }]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.wrapper} testID={testID ?? 'flatly-logo'}>
      <Image
        source={iconSource}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface FlatlyLogoProps {
  size?: number;
  tintColor?: string;
  testID?: string;
}

export function FlatlyLogo({ size = 32, tintColor, testID }: FlatlyLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]} testID={testID}>
      <Image
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ax194qfjnn5hgqz1khapo' }}
        style={[
          styles.logo,
          { width: size, height: size },
          tintColor && { tintColor }
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

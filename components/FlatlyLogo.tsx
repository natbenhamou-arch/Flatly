import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FlatlyLogoProps {
  size?: number;
  tintColor?: string;
  testID?: string;
  seamless?: boolean;
}

export function FlatlyLogo({ size = 32, tintColor, testID, seamless = true }: FlatlyLogoProps) {
  const ringSize = Math.round(size * 1.35);
  return (
    <View style={[styles.wrapper, { width: ringSize, height: ringSize }]} testID={testID ?? 'flatly-logo'}>
      {seamless && (
        <LinearGradient
          colors={[`${'#2563EB'}15`, `${'#1E40AF'}10`, 'transparent']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
        />
      )}
      <Image
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/zdt6a3b5ypmu899lecir2' }}
        style={[
          styles.logo,
          { width: size, height: size },
          tintColor ? { tintColor } : undefined
        ]}
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
  ring: {
    position: 'absolute',
    opacity: 1,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

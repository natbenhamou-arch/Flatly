import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { colors, radius, spacing } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastAPI {
  showToast: (message: string, type?: ToastType) => void;
}

export const [ToastProvider, useToast] = createContextHook<ToastAPI>(() => {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    const timeout = Platform.select({ web: 2200, default: 1800 });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  };

  return { showToast };
});

export function ToastHost() {
  const [items, setItems] = useState<ToastState[]>([]);
  const opacity = useMemo(() => new Animated.Value(0), []);

  const Bridge = () => {
    const api = useToast();
    const [_, setTick] = useState<number>(0);
    useEffect(() => {
      const orig = (api as any).showToast as (message: string, type?: ToastType) => void;
      (api as any).showToast = (message: string, type?: ToastType) => {
        const id = Date.now();
        setItems((prev) => [...prev, { id, message, type: (type ?? 'info') }]);
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: false }).start();
        const timeout = Platform.select({ web: 2200, default: 1800 });
        setTimeout(() => {
          setItems((prev) => prev.filter((t) => t.id !== id));
          if (items.length <= 1) {
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();
          }
        }, timeout);
        if (orig) orig(message, type);
        setTick((v) => v + 1);
      };
    }, [api]);
    return null;
  };

  const last = items[items.length - 1];
  if (!last) return <Bridge />;

  const bg = last.type === 'success' ? '#16a34a' : last.type === 'error' ? '#ef4444' : colors.textPrimary;

  return (
    <>
      <Bridge />
      <Animated.View style={[styles.container, { opacity } ]} pointerEvents="none" testID="toast-host">
        <View style={[styles.toast, { backgroundColor: bg } ]}>
          <Text style={styles.text}>{last.message}</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.large ?? 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

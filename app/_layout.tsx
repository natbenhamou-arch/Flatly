import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider, ToastHost } from "@/components/Toast";
import { trpc, trpcClient } from "@/lib/trpc";
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { ThemeProvider } from "@/store/theme-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back", headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-account" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="signin" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="chat"
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="availability"
        options={{ 
          title: "Availability",
        }} 
      />
      <Stack.Screen 
        name="activity"
        options={{ 
          title: "Activity",
        }} 
      />
      <Stack.Screen 
        name="settings"
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="privacy"
        options={{ 
          title: "Privacy & Terms",
        }} 
      />
      <Stack.Screen 
        name="store"
        options={{ 
          title: "Flatly Premium",
        }} 
      />
      <Stack.Screen 
        name="admin" 
        options={{ 
          title: "Admin Panel",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <ThemeProvider>
            <ToastProvider>
              <View style={styles.navContainer}>
                <RootLayoutNav />
                <ToastHost />
              </View>
            </ToastProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navContainer: {
    flex: 1,
  },
});
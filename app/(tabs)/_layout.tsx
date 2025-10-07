import { Tabs } from "expo-router";
import { Heart, User, MessageCircle, Users } from "lucide-react-native";
import React from "react";
import { colors } from "@/constants/theme";
import { View, Text, Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: colors.secondary,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
          letterSpacing: 0.5,
          fontFamily: 'Montserrat-SemiBold',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 28,
          fontWeight: '800',
          color: colors.textPrimary,
          letterSpacing: -0.5,
          fontFamily: 'Montserrat-SemiBold',
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "",
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }} testID="brand-header">
              <Image source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/344pj7718gxg1qvcgbgp1' }} style={{ width: 28, height: 32, marginRight: 8 }} resizeMode="contain" />
              <Text style={{ fontFamily: 'Montserrat-SemiBold', marginLeft: 0, fontSize: 20, fontWeight: '800', letterSpacing: 2, color: colors.secondary }}>FLATLY</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Heart 
              color={focused ? colors.primary : color} 
              size={focused ? size + 2 : size}
              fill={focused ? colors.primary : 'transparent'}
            />
          ),
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
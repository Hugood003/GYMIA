import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, RADIUS } from '../tokens';
import { useApp } from '../context/AppContext';

import LoginScreen      from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen       from '../screens/HomeScreen';
import PlanScreen       from '../screens/PlanScreen';
import SessionScreen    from '../screens/SessionScreen';
import AIScreen         from '../screens/AIScreen';
import ProgressScreen   from '../screens/ProgressScreen';
import ProfileScreen    from '../screens/ProfileScreen';

import { IconHome, IconPlan, IconSpark, IconChart, IconUser } from '../components/Icons';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function MainTabs({ T, dark, setDark }) {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, descriptors, navigation }) => (
        <View style={{
          position: 'absolute', left: 12, right: 12, bottom: 20,
          backgroundColor: T.surface, borderRadius: 28, paddingVertical: 10, paddingHorizontal: 8,
          borderWidth: 1, borderColor: T.hairline,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 15,
        }}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const isPrimary = route.name === 'AI';
            const icons = {
              Home:     <IconHome  size={22} color={focused ? T.ink : T.ink3} />,
              Plan:     <IconPlan  size={22} color={focused ? T.ink : T.ink3} />,
              AI:       <IconSpark size={26} color={T.accentInk} />,
              Progress: <IconChart size={22} color={focused ? T.ink : T.ink3} />,
              Profile:  <IconUser  size={22} color={focused ? T.ink : T.ink3} />,
            };
            const labels = { Home: 'Home', Plan: 'Plan', AI: 'IA', Progress: 'Progreso', Profile: 'Perfil' };

            if (isPrimary) {
              return (
                <TouchableOpacity key={route.name} onPress={() => navigation.navigate(route.name)}
                  style={{ width: 54, height: 54, borderRadius: 20, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center', marginTop: -22,
                    shadowColor: T.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 }}>
                  {icons[route.name]}
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity key={route.name} onPress={() => navigation.navigate(route.name)}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 6, gap: 4 }}>
                {icons[route.name]}
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', fontWeight: focused ? '600' : '400', color: focused ? T.ink : T.ink3 }}>
                  {labels[route.name]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="Home">{(props) => <HomeScreen {...props} T={T} dark={dark} />}</Tab.Screen>
      <Tab.Screen name="Plan">{(props) => <PlanScreen {...props} T={T} dark={dark} />}</Tab.Screen>
      <Tab.Screen name="AI">{(props) => <AIScreen {...props} T={T} dark={dark} />}</Tab.Screen>
      <Tab.Screen name="Progress">{(props) => <ProgressScreen {...props} T={T} dark={dark} />}</Tab.Screen>
      <Tab.Screen name="Profile">{(props) => <ProfileScreen {...props} T={T} dark={dark} setDark={setDark} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loaded, state: appState } = useApp();
  const [dark, setDark] = useState(false);
  const T = { ...COLORS[dark ? 'dark' : 'light'], accent: '#C9FF3C', accentInk: '#0B0C0E', accentSoft: dark ? 'rgba(201,255,60,0.16)' : '#E9FAB8' };

  // Show blank splash while AsyncStorage loads
  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: T.bg }} />;
  }

  const initialRoute = appState.user ? 'Main' : 'Login';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} T={T} dark={dark} />}
        </Stack.Screen>
        <Stack.Screen name="Onboarding">
          {(props) => <OnboardingScreen {...props} T={T} dark={dark} />}
        </Stack.Screen>
        <Stack.Screen name="Main">
          {(props) => <MainTabs {...props} T={T} dark={dark} setDark={setDark} />}
        </Stack.Screen>
        <Stack.Screen name="Session" options={{ presentation: 'fullScreenModal' }}>
          {(props) => <SessionScreen {...props} T={T} dark={dark} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

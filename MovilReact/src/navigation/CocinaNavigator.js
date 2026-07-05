import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import CocinaDashboard from '../screens/cocina/CocinaDashboard';
import PerfilScreen from '../screens/shared/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function CocinaNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === 'Cocina') iconName = focused ? 'apps' : 'apps-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          
          return (
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                backgroundColor: focused ? 'rgba(144, 105, 74, 0.15)' : 'transparent',
                borderRadius: 20,
              }}>
                <Ionicons name={iconName} size={24} color={focused ? colors.coffee : 'rgba(53, 39, 40, 0.4)'} />
              </View>
            </View>
          );
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 15,
          height: 60,
          paddingBottom: 0,
          paddingTop: 0,
          borderRadius: 30,
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
        }
      })}
    >
      <Tab.Screen name="Cocina" component={CocinaDashboard} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

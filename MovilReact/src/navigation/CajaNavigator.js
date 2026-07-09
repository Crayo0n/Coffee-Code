import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import CajaDashboard from '../screens/caja/CajaDashboard';
import PosScreen from '../screens/caja/PosScreen';
import HistorialScreen from '../screens/caja/HistorialScreen';
import TicketScreen from '../screens/caja/TicketScreen';
import PerfilScreen from '../screens/shared/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TurnoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Historial" component={HistorialScreen} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
    </Stack.Navigator>
  );
}

function CajaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={CajaDashboard} />
      <Stack.Screen name="Pos" component={PosScreen} />
    </Stack.Navigator>
  );
}


export default function CajaNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === 'Caja') iconName = focused ? 'cash' : 'cash-outline';
          else if (route.name === 'Turno') iconName = focused ? 'receipt' : 'receipt-outline';
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
      <Tab.Screen name="Caja" component={CajaStack} />
      <Tab.Screen name="Turno" component={TurnoStack} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

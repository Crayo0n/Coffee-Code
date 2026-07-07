import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import MeseroDashboard from '../screens/mesero/MeseroDashboard';
import MesasScreen from '../screens/mesero/MesasScreen';
import CrearPedidoScreen from '../screens/mesero/CrearPedidoScreen';
import DetallePedidoScreen from '../screens/mesero/DetallePedidoScreen';
import PerfilScreen from '../screens/shared/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Un stack para el flujo de crear pedido / detalle
function PedidosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CrearPedido" component={CrearPedidoScreen} />
      <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
    </Stack.Navigator>
  );
}

export default function MeseroNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Mesas') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Pedidos') iconName = focused ? 'add' : 'add-outline';
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
      <Tab.Screen name="Inicio" component={MeseroDashboard} />
      <Tab.Screen name="Mesas" component={MesasScreen} />
      <Tab.Screen name="Pedidos" component={PedidosStack} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

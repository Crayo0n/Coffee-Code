import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';

import MeseroNavigator from './MeseroNavigator';
import CocinaNavigator from './CocinaNavigator';
import CajaNavigator from './CajaNavigator';

export default function AppNavigator() {
  const { isLoading, userToken, userInfo } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Asegurar que el SplashScreen sea visible al menos 3 segundos para que se vea la animación
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {userToken == null ? (
        <LoginScreen />
      ) : (
        <>
          {userInfo?.rol === 'mesero' && <MeseroNavigator />}
          {userInfo?.rol === 'cocina' && <CocinaNavigator />}
          {userInfo?.rol === 'caja' && <CajaNavigator />}
          {userInfo?.rol === 'admin' && <MeseroNavigator />} 
        </>
      )}
    </NavigationContainer>
  );
}

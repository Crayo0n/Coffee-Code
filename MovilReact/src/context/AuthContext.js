import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (token, user) => {
    setIsLoading(true);
    try {
      setUserToken(token);
      setUserInfo(user);
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
    } catch (e) {
      console.log('Error setting auth data', e);
    }
    // Retardo intencional de 3 segundos para mostrar la animación de Splash (Ej. "MESERO", "CAJA")
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUserToken(null);
      setUserInfo(null);
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userInfo');
    } catch (e) {
      console.log('Error clearing auth data', e);
    }
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await SecureStore.getItemAsync('userToken');
      let user = await SecureStore.getItemAsync('userInfo');
      if (token && user) {
        setUserToken(token);
        setUserInfo(JSON.parse(user));
      }
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

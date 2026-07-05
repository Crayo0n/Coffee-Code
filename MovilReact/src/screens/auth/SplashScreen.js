import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Image, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen() {
  const { userInfo } = useContext(AuthContext);
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  
  // Animaciones continuas
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Determinar el título basado en el rol del usuario
  let title = "COFFEE CODE";
  let isRole = false;
  if (userInfo?.rol) {
    title = userInfo.rol.toUpperCase();
    isRole = true;
  }
  
  const letters = title.split('');
  const letterAnims = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // 1. Animación de entrada inicial (Logo Pop)
    const logoAnim = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      })
    ]);

    // 2. Animación de letras escalonada con salto (Bounce)
    const textAnims = letters.map((_, index) => {
      return Animated.spring(letterAnims[index], {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      });
    });

    Animated.sequence([
      Animated.delay(200),
      logoAnim,
      Animated.stagger(80, textAnims) 
    ]).start();

    // 3. Animaciones continuas de fondo (Rotación y Pulso)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000, // Rotación muy suave y lenta
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

  }, [title]);

  // Interpolaciones para rotación
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinReverse = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Decorativo Animado */}
      <Animated.View style={[styles.bgCircle, styles.circle1, { transform: [{ rotate: spin }] }]} />
      <Animated.View style={[styles.bgCircle, styles.circle2, { transform: [{ rotate: spinReverse }] }]} />
      
      {/* Glow detrás del logo */}
      <Animated.View style={[styles.glow, { opacity: logoOpacity, transform: [{ scale: pulseAnim }] }]} />

      <Animated.View style={[
        styles.logoWrapper, 
        { 
          opacity: logoOpacity, 
          transform: [{ scale: logoScale }, { translateY: pulseAnim.interpolate({ inputRange: [1, 1.05], outputRange: [0, -5] }) }] 
        }
      ]}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/LOGOCOFFECODE.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        {/* Destellos Premium */}
        <Animated.View style={[styles.sparkle, { top: -10, right: -10, transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name="star-four-points" size={24} color={colors.coffee} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, { bottom: 10, left: -20, transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name="star-four-points-outline" size={16} color={colors.coffee} />
        </Animated.View>
      </Animated.View>
      
      <View style={styles.titleContainer}>
        {letters.map((char, index) => {
          // Bote desde abajo hacia arriba
          const translateY = letterAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0]
          });
          
          return (
            <Animated.Text 
              key={`${char}-${index}`} 
              style={[
                styles.titleChar, 
                isRole && styles.roleChar,
                { 
                  opacity: letterAnims[index],
                  transform: [{ translateY }]
                }
              ]}
            >
              {char === ' ' ? ' ' : char}
            </Animated.Text>
          );
        })}
      </View>

      <Animated.View style={[styles.loaderContainer, { opacity: logoOpacity }]}>
        <ActivityIndicator size="large" color={colors.coffee} />
        <Text style={styles.loaderText}>Cargando sistema...</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF7FB', // Un fondo ultra claro y limpio
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Elementos de fondo
  bgCircle: {
    position: 'absolute',
    borderRadius: 500,
    borderWidth: 2,
    borderColor: 'rgba(110, 80, 85, 0.05)',
  },
  circle1: {
    width: 600,
    height: 600,
    borderStyle: 'dashed',
    top: -150,
    right: -200,
    backgroundColor: 'rgba(235, 218, 203, 0.2)', // Tono latte sutil
  },
  circle2: {
    width: 450,
    height: 450,
    bottom: -100,
    left: -150,
    backgroundColor: 'rgba(53, 39, 40, 0.03)',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(182, 126, 92, 0.15)', // Coffee glow
    top: '35%',
    shadowColor: colors.coffee,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  logoWrapper: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    width: 170,
    height: 170,
    backgroundColor: colors.white,
    borderRadius: 85,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  logo: {
    width: 105,
    height: 105,
  },
  sparkle: {
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 60,
    zIndex: 10,
  },
  titleChar: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.dark, // Color oscuro premium
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  roleChar: {
    color: colors.coffee, // El rol aparece en color café
    fontSize: 38,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkLight,
    letterSpacing: 1,
  }
});

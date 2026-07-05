import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, ScrollView, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  // Animaciones de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }
    
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      // data: { access_token, token_type, user: { id, nombre, email, rol, status } }
      login(data.access_token, data.user);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error al iniciar sesión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View 
              style={[
                styles.innerContainer, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                  <Image source={require('../../../assets/LOGOCOFFECODE.png')} style={styles.logo} />
                </View>
                <Text style={styles.welcomeText}>Bienvenido</Text>
                <Text style={styles.brandText}>COFFEE CODE</Text>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.darkLight} style={styles.leftIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="ejemplo@coffeecode.com"
                    placeholderTextColor={colors.darkLight}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>

                <Text style={styles.label}>CONTRASEÑA</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.darkLight} style={styles.leftIcon} />
                  <TextInput 
                    style={[styles.input, styles.inputWithRightIcon]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.darkLight}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={colors.darkLight} 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu Contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.loginButtonText}>Ingresar al Sistema</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  container: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 12,
    color: colors.darkLight,
    fontWeight: '600',
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: 24,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkLight,
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.darkLightest,
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    color: colors.dark,
    fontSize: 16,
    width: '100%',
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: colors.coffee,
    fontWeight: '700',
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: colors.coffee,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import React, { useContext } from 'react';
import {  View, Text, StyleSheet, TouchableOpacity, Image  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function PerfilScreen() {
  const { userInfo, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color={colors.white} />
          </View>
          
          <Text style={styles.name}>{userInfo?.nombre}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userInfo?.rol?.toUpperCase()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.darkLight} />
            <Text style={styles.infoText}>{userInfo?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.mint} />
            <Text style={styles.infoText}>Estado: {userInfo?.status}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20,
    backgroundColor: 'rgba(252, 247, 251, 0.9)',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.dark },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, alignItems: 'center' },
  profileCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.coffee,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.coffee,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: colors.dark, marginBottom: 8 },
  roleBadge: {
    backgroundColor: colors.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 24,
  },
  roleText: { color: colors.dark, fontWeight: 'bold', fontSize: 12 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(53, 39, 40, 0.05)',
  },
  infoText: {
    fontSize: 16,
    color: colors.dark,
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.dangerLight,
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

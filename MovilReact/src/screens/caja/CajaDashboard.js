import React, { useState, useEffect, useContext, useRef } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Animated  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { pedidosService } from '../../services/pedidosService';
import { ventasService } from '../../services/ventasService';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function CajaDashboard() {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [pedidos, setPedidos] = useState([]);
  const [totalCaja, setTotalCaja] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const fetchData = async () => {
    try {
      const pedidosData = await pedidosService.getPedidos();
      const porCobrar = pedidosData.filter(p => p.status === 'POR_COBRAR' || p.status === 'LISTO');
      setPedidos(porCobrar);

      const ventasData = await ventasService.getVentas();
      const hoy = new Date().toISOString().split('T')[0];
      const ventasHoy = ventasData.filter(v => v.fecha.startsWith(hoy));
      const total = ventasHoy.reduce((sum, v) => sum + v.total, 0);
      setTotalCaja(total);
    } catch (error) {
      console.error('Error fetching caja data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderPedido = ({ item, index }) => {
    // Para replicar el mockup donde una tarjeta es roja (destacada) y otra gris
    // Usaremos roja para POR_COBRAR o si es el primer item
    const isUrgent = item.status === 'POR_COBRAR' || index === 0;

    return (
      <View style={[styles.card, isUrgent ? styles.cardUrgent : styles.cardNormal]}>
        <View style={styles.cardInfo}>
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, isUrgent && styles.textWhite]}>Mesa {item.mesa_id}</Text>
            <Text style={[styles.cardSubtitle, isUrgent && styles.textWhiteOpacity]}>TKT #{item.id.toString().padStart(3, '0')}</Text>
          </View>
          <Text style={[styles.cardTotal, isUrgent && styles.textWhite]}>${(item.detalles ? item.detalles.reduce((sum, d) => sum + ((d.producto?.price || d.producto?.precio || 0) * (d.quantity || d.cantidad || 0)), 0) : (item.total || 0)).toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.actionBtn, isUrgent ? styles.actionBtnWhite : styles.actionBtnDark]}
          onPress={() => navigation.navigate('Pos', { id: item.id })}
        >
          <Text style={[styles.actionBtnText, isUrgent ? styles.textCoffee : styles.textWhite]}>COBRAR</Text>
          <Ionicons name="chevron-forward" size={16} color={isUrgent ? colors.coffee : colors.white} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userInfo?.nombre?.charAt(0) || 'C'}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Caja Principal</Text>
              <Text style={styles.subtitle}>{userInfo?.nombre}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>En Caja (Efectivo)</Text>
            <Ionicons name="lock-closed" size={24} color={colors.white} opacity={0.8} />
          </View>
          <Text style={styles.balanceValue}>${totalCaja.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.corteBtn}>
          <Text style={styles.corteBtnText}>Hacer Corte de Caja</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Pendientes de Cobro</Text>
          
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={colors.coffee} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={pedidos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPedido}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.coffee]} />
              }
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.mintLight} />
                  <Text style={styles.emptyText}>No hay tickets por cobrar</Text>
                </View>
              }
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20,
    backgroundColor: 'rgba(252, 247, 251, 0.9)',
  },
  headerInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 12
  },
  avatarContainer: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.coffee,
    justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  greeting: { fontSize: 14, color: colors.darkLight, fontWeight: '600' },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: colors.dark },
  settingsBtn: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end'
  },
  balanceContainer: {
    backgroundColor: '#352728', // Dark brown
    marginHorizontal: 24, padding: 24, borderRadius: 24,
    marginBottom: 16,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12
  },
  balanceLabel: { color: colors.white, opacity: 0.8, fontSize: 16 },
  balanceValue: { color: colors.white, fontSize: 40, fontWeight: 'bold' },
  corteBtn: {
    marginHorizontal: 24, marginBottom: 24,
    backgroundColor: colors.white, paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.mintLight,
  },
  corteBtnText: { color: colors.dark, fontWeight: 'bold', fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.dark, marginBottom: 16 },
  list: { paddingBottom: 100 },
  card: {
    borderRadius: 24, padding: 20, marginBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  cardUrgent: {
    backgroundColor: '#E53935', // Red mockup
  },
  cardNormal: {
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: 'rgba(53, 39, 40, 0.05)',
  },
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.dark },
  cardSubtitle: { fontSize: 14, color: colors.darkLight, marginTop: 4 },
  cardTotal: { fontSize: 20, fontWeight: 'bold', color: colors.dark, marginRight: 16 },
  textWhite: { color: colors.white },
  textWhiteOpacity: { color: 'rgba(255,255,255,0.8)' },
  textCoffee: { color: colors.coffee },
  actionBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16,
  },
  actionBtnWhite: { backgroundColor: colors.white },
  actionBtnDark: { backgroundColor: colors.coffee },
  actionBtnText: { fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyText: { marginTop: 16, color: colors.darkLight, fontSize: 16 }
});

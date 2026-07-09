import React, { useState, useEffect, useContext, useRef } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Animated  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { pedidosService } from '../../services/pedidosService';
import { AuthContext } from '../../context/AuthContext';

export default function CocinaDashboard() {
  const { userInfo } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDIENTE'); // PENDIENTE | PREPARANDO | LISTO

  // Animaciones de entrada
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

  const fetchPedidos = async () => {
    try {
      const data = await pedidosService.getPedidos();
      // Mostrar PENDIENTE, PREPARANDO, y LISTO
      const activos = data.filter(p => ['PENDIENTE', 'PREPARANDO', 'LISTO'].includes(p.status));
      setPedidos(activos);
    } catch (error) {
      console.error('Error fetching pedidos cocina:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPedidos();
  };

  const handleUpdateStatus = async (pedidoId, newStatus) => {
    try {
      await pedidosService.updateStatus(pedidoId, { status: newStatus });
      fetchPedidos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const renderPedido = ({ item }) => {
    const isCompletado = item.status === 'LISTO';
    const isPreparando = item.status === 'PREPARANDO';
    const isPendiente = item.status === 'PENDIENTE';

    return (
      <View style={[styles.card, isCompletado && styles.cardCompletado]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.ticketTitle, isCompletado && styles.textMuted]}>Ticket #{item.id.toString().padStart(3, '0')}</Text>
            <Text style={[styles.ticketSubtitle, isCompletado && styles.textMuted]}>Mesa {item.mesa_id}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.timeBadge, isCompletado && styles.timeBadgeCompletado]}>
              <Ionicons name="time-outline" size={14} color={isCompletado ? colors.darkLight : colors.coffee} />
              <Text style={[styles.timeText, isCompletado && styles.textMuted]}>
                {new Date(item.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
            {isPreparando && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>URGENTE</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {item.detalles.map((detalle, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={styles.itemRadio}>
              {isPreparando ? (
                <Ionicons name="checkbox" size={20} color={colors.coffee} />
              ) : isCompletado ? (
                <Ionicons name="checkbox" size={20} color={colors.darkLight} />
              ) : (
                <Ionicons name="radio-button-off" size={20} color={colors.darkLight} />
              )}
            </View>
            <Text style={[styles.itemQty, isCompletado && styles.textMuted]}>{detalle.cantidad}x</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, isCompletado && styles.textMuted]}>{detalle.producto?.name || detalle.producto?.nombre}</Text>
              {detalle.notas ? <Text style={[styles.itemNotes, isCompletado && styles.textMuted]}>{detalle.notas}</Text> : null}
            </View>
          </View>
        ))}

        {!isCompletado && (
          <View style={styles.cardFooter}>
            {isPendiente ? (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.coffee }]}
                onPress={() => handleUpdateStatus(item.id, 'PREPARANDO')}
              >
                <Text style={styles.actionBtnText}>Empezar a Preparar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.mint }]}
                onPress={() => handleUpdateStatus(item.id, 'LISTO')}
              >
                <Text style={[styles.actionBtnText, { color: colors.dark }]}>Marcar Listo</Text>
                <Ionicons name="checkmark-done" size={20} color={colors.dark} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const filteredPedidos = pedidos.filter(p => p.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Panel de Cocina</Text>
          <Text style={styles.subtitle}>{pedidos.length} pedidos activos</Text>
        </View>

        <View style={styles.tabsContainer}>
          {['PENDIENTE', 'PREPARANDO', 'LISTO'].map(tab => {
            const count = pedidos.filter(p => p.status === tab).length;
            const isActive = activeTab === tab;
            const tabName = tab === 'PENDIENTE' ? 'NUEVOS' : tab === 'PREPARANDO' ? 'EN PREPARACIÓN' : 'COMPLETADOS';
            
            return (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tabName}</Text>
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>{count}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.content}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={colors.coffee} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredPedidos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPedido}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPedidos(); }} colors={[colors.coffee]} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="checkmark-circle-outline" size={64} color={colors.mint} />
                  <Text style={styles.emptyText}>No hay pedidos en esta sección</Text>
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
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
    backgroundColor: 'rgba(252, 247, 251, 0.9)',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.dark },
  subtitle: { fontSize: 14, color: colors.darkLight, marginTop: 4 },
  tabsContainer: {
    flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 16, backgroundColor: colors.white,
    borderWidth: 1, borderColor: 'rgba(53, 39, 40, 0.05)',
  },
  tabActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  tabText: { fontSize: 9, fontWeight: 'bold', color: colors.darkLight, marginRight: 6 },
  tabTextActive: { color: colors.white },
  badge: { backgroundColor: colors.mintLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeActive: { backgroundColor: colors.coffee },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: colors.dark },
  badgeTextActive: { color: colors.white },
  content: { flex: 1, paddingHorizontal: 24 },
  card: {
    backgroundColor: colors.white, borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(53, 39, 40, 0.05)',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  cardCompletado: { opacity: 0.6 },
  cardUrgent: { borderColor: colors.danger, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ticketInfo: { flexDirection: 'row', alignItems: 'center' },
  tableIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.mintLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  ticketTitle: { fontSize: 20, fontWeight: 'bold', color: colors.dark },
  ticketSubtitle: { fontSize: 14, color: colors.darkLight, marginTop: 4 },
  timeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.mintLight,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4,
  },
  timeBadgeCompletado: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.mintLight },
  timeText: { fontSize: 12, fontWeight: 'bold', color: colors.coffee },
  textMuted: { color: colors.darkLight },
  urgentBadge: { backgroundColor: colors.danger, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
  urgentBadgeText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(53, 39, 40, 0.05)', marginVertical: 16 },
  itemRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  itemRadio: { marginRight: 12, marginTop: 2 },
  itemQty: { fontSize: 14, fontWeight: 'bold', color: colors.dark, width: 28 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: colors.dark },
  itemNotes: { fontSize: 12, color: colors.danger, marginTop: 2, fontStyle: 'italic' },
  cardFooter: { marginTop: 8 },
  actionBtn: {
    flexDirection: 'row', backgroundColor: colors.coffee, padding: 16, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 8
  },
  actionBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 16, color: colors.darkLight, fontSize: 16 }
});

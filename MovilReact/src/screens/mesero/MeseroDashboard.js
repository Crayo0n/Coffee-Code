import React, { useState, useEffect, useContext, useRef } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Animated  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { pedidosService } from '../../services/pedidosService';
import { mesasService } from '../../services/mesasService';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function MeseroDashboard() {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [pedidos, setPedidos] = useState([]);
  const [mesas, setMesas] = useState([]);
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
      // Pedidos PENDIENTES, PREPARANDO o LISTOS (activos)
      const pedidosData = await pedidosService.getPedidos();
      const activos = pedidosData.filter(p => ['PENDIENTE', 'PREPARANDO', 'LISTO'].includes(p.status));
      setPedidos(activos);
      
      const mesasData = await mesasService.getMesas();
      setMesas(mesasData);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const getStatusBadge = (status) => {
    let bgColor = colors.mintLight;
    let textColor = colors.dark;
    let text = status;

    if (status === 'PREPARANDO') {
      bgColor = colors.dangerLight;
      textColor = colors.danger;
      text = 'En Cocina';
    } else if (status === 'LISTO') {
      bgColor = colors.mint;
      textColor = colors.dark;
      text = 'Listo para Servir';
    } else if (status === 'PENDIENTE') {
      bgColor = colors.darkLighter;
      textColor = colors.dark;
      text = 'Nuevo';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
      </View>
    );
  };

  const renderPedido = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Pedidos', { screen: 'DetallePedido', params: { id: item.id } })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.mesaIconContainer}>
          <Ionicons name="restaurant" size={20} color={colors.coffee} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>Mesa {item.mesa_id}</Text>
          <Text style={styles.cardSubtitle}>Ticket #{item.id.toString().padStart(3, '0')}</Text>
        </View>
        <Text style={styles.cardTotal}>${(item.detalles ? item.detalles.reduce((sum, d) => sum + ((d.producto?.price || d.producto?.precio || 0) * (d.quantity || d.cantidad || 0)), 0) : (item.total || 0)).toFixed(2)}</Text>
      </View>
      <View style={styles.cardFooter}>
        {getStatusBadge(item.status)}
        <Ionicons name="chevron-forward" size={20} color={colors.darkLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {userInfo?.nombre?.split(' ')[0]}</Text>
            <Text style={styles.subtitle}>Tienes {pedidos.length} pedidos activos</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Perfil')}>
            <Ionicons name="person" size={20} color={colors.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{mesas.filter(m => m.status === 'ocupada').length}</Text>
            <Text style={styles.statLabel}>Mesas Activas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pedidos.filter(p => p.status === 'LISTO').length}</Text>
            <Text style={styles.statLabel}>Por Servir</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Pedidos en curso</Text>
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
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cafe-outline" size={48} color={colors.darkLight} />
                  <Text style={styles.emptyText}>No hay pedidos activos</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20,
    backgroundColor: 'rgba(252, 247, 251, 0.9)',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  subtitle: {
    fontSize: 14,
    color: colors.dark,
    opacity: 0.7,
    marginTop: 4,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(53, 39, 40, 0.05)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.coffee,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkLight,
    marginTop: 4,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(53, 39, 40, 0.05)',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mesaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.mintLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.darkLight,
    marginTop: 2,
  },
  cardTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.coffee,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(53, 39, 40, 0.05)',
    paddingTop: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  emptyText: {
    marginTop: 16,
    color: colors.darkLight,
    fontSize: 16,
  }
});

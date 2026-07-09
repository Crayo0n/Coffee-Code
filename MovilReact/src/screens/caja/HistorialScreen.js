import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ventasService } from '../../services/ventasService';
import { useNavigation } from '@react-navigation/native';

export default function HistorialScreen() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchVentas = async () => {
    try {
      const data = await ventasService.getVentas();
      // Mostramos las ventas más recientes primero
      setVentas(data.reverse());
    } catch (error) {
      console.error('Error fetching ventas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVentas();
  };

  const renderVenta = ({ item }) => {
    const isEfectivo = item.metodo_pago === 'efectivo';
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('Ticket', { id: item.order_id })}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={isEfectivo ? "cash" : "card"} size={20} color={colors.coffee} />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Venta #{item.ticket_id.toString().padStart(3, '0')}</Text>
          <Text style={styles.cardDate}>{item.date} {item.hour}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountTotal}>${Number(item.total_paid).toFixed(2)}</Text>
          <Text style={styles.paymentMethod}>{item.payment_method}</Text>
        </View>
        
        <Ionicons name="chevron-forward" size={16} color={colors.darkLight} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Historial de Turno</Text>
          <Text style={styles.subtitle}>{ventas.length} ventas procesadas</Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.coffee} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={ventas}
            keyExtractor={(item) => item.ticket_id.toString()}
            renderItem={renderVenta}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.coffee]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color={colors.mintLight} />
                <Text style={styles.emptyText}>No hay ventas registradas</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20,
    backgroundColor: 'rgba(252, 247, 251, 0.9)',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.dark },
  subtitle: { fontSize: 14, color: colors.dark, opacity: 0.7, marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 24 },
  list: { paddingTop: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 20, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(53, 39, 40, 0.05)',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  iconContainer: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.mintLight,
    justifyContent: 'center', alignItems: 'center'
  },
  cardContent: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.dark },
  cardDate: { fontSize: 12, color: colors.darkLight, marginTop: 2 },
  amountContainer: { alignItems: 'flex-end' },
  amountTotal: { fontSize: 16, fontWeight: 'bold', color: colors.coffee },
  paymentMethod: { fontSize: 10, color: colors.darkLight, marginTop: 2, textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 16, color: colors.darkLight, fontSize: 16 }
});

import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { pedidosService } from '../../services/pedidosService';
import { ventasService } from '../../services/ventasService';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PosScreen() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [propinaPct, setPropinaPct] = useState(0);
  
  const navigation = useNavigation();
  const route = useRoute();
  const pedidoId = route.params?.id;

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const data = await pedidosService.getPedido(pedidoId);
        setPedido(data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el pedido');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    if (pedidoId) fetchPedido();
  }, [pedidoId]);

  const calculatedTotal = pedido?.total ?? (pedido?.detalles ? pedido.detalles.reduce((sum, d) => sum + ((d.producto?.price || d.producto?.precio || 0) * (d.quantity || d.cantidad || 0)), 0) : 0);

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const propina = (calculatedTotal * propinaPct) / 100;
      
      const response = await ventasService.cobrarPedido({
        pedido_id: pedidoId,
        metodo_pago: metodoPago,
        propina: propina,
        total: calculatedTotal + propina
      });
      
      Alert.alert('Éxito', 'Cobro procesado correctamente');
      navigation.navigate('Turno', { screen: 'Ticket', params: { id: response.venta.id } });
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el cobro');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.coffee} /></View>;
  }

  if (!pedido) return null;

  const propinaCalculada = (calculatedTotal * propinaPct) / 100;
  const totalConPropina = calculatedTotal + propinaCalculada;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.title}>Cobro</Text>
          <Text style={styles.subtitle}>Ticket #{pedido.id.toString().padStart(3, '0')} {pedido.mesa_id ? `• Mesa ${pedido.mesa_id}` : ''}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>${calculatedTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Propina</Text>
            <Text style={styles.value}>${propinaCalculada.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Descuento</Text>
            <Text style={styles.value}>$0.00</Text>
          </View>
          
          <View style={[styles.divider, { borderStyle: 'dashed' }]} />
          
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalConPropina.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Propina</Text>
        <View style={styles.propinaContainer}>
          {[10, 15, 20, 0].map(pct => (
            <TouchableOpacity 
              key={pct}
              style={[styles.propinaBtn, propinaPct === pct && styles.propinaBtnActive]}
              onPress={() => setPropinaPct(pct)}
            >
              <Text style={[styles.propinaBtnText, propinaPct === pct && styles.propinaBtnTextActive]}>
                {pct === 0 ? '0' : `${pct}%`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Método de Pago</Text>
        <View style={styles.paymentMethods}>
          {[
            { id: 'efectivo', icon: 'cash-outline', label: 'Efectivo' },
            { id: 'tarjeta', icon: 'card-outline', label: 'Tarjeta' },
            { id: 'transferencia', icon: 'swap-horizontal-outline', label: 'Transferencia' }
          ].map(met => (
            <TouchableOpacity 
              key={met.id}
              style={[styles.paymentBtn, metodoPago === met.id && styles.paymentBtnActive]}
              onPress={() => setMetodoPago(met.id)}
            >
              <Ionicons name={met.icon} size={24} color={metodoPago === met.id ? colors.white : colors.dark} />
              <Text style={[styles.paymentText, metodoPago === met.id && styles.paymentTextActive]}>{met.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.processBtn} 
          onPress={handleProcessPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.processBtnText}>Cobrar (${totalConPropina.toFixed(2)})</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20,
    backgroundColor: 'rgba(252, 247, 251, 0.9)',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.dark },
  subtitle: { fontSize: 14, color: colors.darkLight, marginTop: 2 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 220 },
  summaryCard: {
    backgroundColor: colors.white, borderRadius: 24, padding: 24, marginBottom: 32,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.dark, marginBottom: 16 },
  divider: { height: 1, backgroundColor: 'rgba(53, 39, 40, 0.1)', marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 16, color: colors.darkLight },
  value: { fontSize: 16, color: colors.dark, fontWeight: '600' },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: colors.dark },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: colors.coffee },
  propinaContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 12
  },
  propinaBtn: {
    flex: 1, backgroundColor: colors.white, paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.mintLight,
  },
  propinaBtnActive: { backgroundColor: colors.coffee, borderColor: colors.coffee },
  propinaBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.dark },
  propinaBtnTextActive: { color: colors.white },
  paymentMethods: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  paymentBtn: {
    flex: 1, backgroundColor: colors.white, paddingVertical: 20, borderRadius: 20,
    alignItems: 'center', borderWidth: 1, borderColor: colors.mintLight,
  },
  paymentBtnActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  paymentText: { marginTop: 8, fontSize: 12, fontWeight: 'bold', color: colors.dark },
  paymentTextActive: { color: colors.white },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 110,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10,
  },
  processBtn: {
    backgroundColor: '#E53935', // Red mockup
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 18, borderRadius: 20,
  },
  processBtnText: { color: colors.white, fontSize: 18, fontWeight: 'bold' }
});

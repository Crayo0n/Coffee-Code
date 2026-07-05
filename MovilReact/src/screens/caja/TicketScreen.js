import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ventasService } from '../../services/ventasService';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function TicketScreen() {
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation();
  const route = useRoute();
  const ventaId = route.params?.id;

  useEffect(() => {
    const fetchVentaDetails = async () => {
      try {
        const ventasData = await ventasService.getVentas();
        const data = ventasData.find(v => v.id === ventaId);
        setVenta(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (ventaId) fetchVentaDetails();
  }, [ventaId]);

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.coffee} /></View>;
  }

  if (!venta) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.dark} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', marginRight: 44 }}>
          <Text style={styles.title}>Ticket</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.ticketPaper}>
          <View style={styles.ticketHeader}>
            <Text style={styles.brandName}>COFFEE CODE</Text>
            <Text style={styles.ticketInfo}>Ticket #{venta.id.toString().padStart(3, '0')}</Text>
            <Text style={styles.ticketInfo}>{new Date(venta.fecha).toLocaleString()}</Text>
          </View>
          
          <View style={styles.dashedDivider} />
          
          <View style={styles.ticketDetails}>
            <View style={styles.row}>
              <Text style={styles.label}>Cajero:</Text>
              <Text style={styles.value}>{venta.cajero?.nombre || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Método de Pago:</Text>
              <Text style={[styles.value, { textTransform: 'uppercase' }]}>{venta.metodo_pago}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />
          
          <View style={styles.amounts}>
            <View style={styles.row}>
              <Text style={styles.amountLabel}>Subtotal</Text>
              <Text style={styles.amountValue}>${(venta.total / 1.16).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.amountLabel}>IVA (16%)</Text>
              <Text style={styles.amountValue}>${(venta.total - (venta.total / 1.16)).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.amountLabel}>Propina</Text>
              <Text style={styles.amountValue}>${venta.propina.toFixed(2)}</Text>
            </View>
            <View style={[styles.dashedDivider, { marginVertical: 16 }]} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>${venta.total.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.dashedDivider} />
          
          <View style={styles.ticketFooter}>
            <Text style={styles.thankYou}>¡Gracias por tu visita!</Text>
            <Ionicons name="barcode" size={48} color={colors.dark} style={{ marginTop: 16 }} />
          </View>
          
          {/* Decorative zig-zag bottom */}
          <View style={styles.zigzagContainer}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={styles.zigzagTooth} />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.printBtn}>
          <Ionicons name="print" size={20} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.printBtnText}>Imprimir Recibo</Text>
        </TouchableOpacity>
      </ScrollView>
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
  title: { fontSize: 20, fontWeight: 'bold', color: colors.dark },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60, alignItems: 'center' },
  ticketPaper: {
    width: '100%',
    backgroundColor: colors.white,
    padding: 24,
    paddingBottom: 40, // Space for zigzag
    position: 'relative',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5,
  },
  ticketHeader: { alignItems: 'center', marginBottom: 16 },
  brandName: { fontSize: 24, fontWeight: '900', color: colors.dark, marginBottom: 8, letterSpacing: 2 },
  ticketInfo: { fontSize: 12, color: colors.darkLight, marginBottom: 2, fontFamily: 'monospace' },
  dashedDivider: { height: 1, borderWidth: 1, borderColor: colors.darkLighter, borderStyle: 'dashed', marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: colors.darkLight, fontFamily: 'monospace' },
  value: { fontSize: 14, color: colors.dark, fontWeight: 'bold', fontFamily: 'monospace' },
  amounts: { marginVertical: 8 },
  amountLabel: { fontSize: 14, color: colors.darkLight },
  amountValue: { fontSize: 14, color: colors.dark, fontFamily: 'monospace' },
  totalLabel: { fontSize: 20, fontWeight: '900', color: colors.dark },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: colors.dark, fontFamily: 'monospace' },
  ticketFooter: { alignItems: 'center', marginTop: 16 },
  thankYou: { fontSize: 14, fontStyle: 'italic', color: colors.dark },
  zigzagContainer: {
    position: 'absolute', bottom: -10, left: 0, right: 0,
    flexDirection: 'row', height: 20, overflow: 'hidden',
  },
  zigzagTooth: {
    width: 20, height: 20, backgroundColor: colors.light,
    transform: [{ rotate: '45deg' }, { translateY: 10 }],
    marginLeft: -5,
  },
  printBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.coffee, width: '100%', paddingVertical: 16, borderRadius: 16, marginTop: 40,
    shadowColor: colors.coffee, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  printBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' }
});

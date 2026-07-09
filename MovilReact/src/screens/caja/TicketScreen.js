import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image  } from 'react-native';
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
        const data = await ventasService.getTicketDetails(ventaId);
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
            <Image source={require('../../../assets/LOGOCOFFECODE.png')} style={styles.logo} />
            <Text style={styles.brandName}>COFFEE CODE</Text>
            <Text style={styles.ticketInfo}>Ticket de Venta</Text>
            <Text style={styles.ticketInfo}>ID: {venta.id_venta.toString().padStart(3, '0')} | Fecha: {venta.fecha}</Text>
          </View>
          
          <View style={styles.dashedDivider} />
          
          <View style={styles.ticketDetails}>
            <View style={styles.row}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{venta.cliente}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mesa:</Text>
              <Text style={styles.value}>{venta.mesa}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mesero:</Text>
              <Text style={styles.value}>{venta.mesero}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={styles.value}>{venta.estado}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />
          
          <View style={styles.itemsTable}>
            <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4, marginBottom: 8 }]}>
              <Text style={[styles.label, { flex: 0.5 }]}>Cant</Text>
              <Text style={[styles.label, { flex: 2 }]}>Art</Text>
              <Text style={[styles.label, { flex: 1, textAlign: 'right' }]}>Total</Text>
            </View>
            {venta.items && venta.items.map((item, index) => (
              <View key={index} style={styles.row}>
                <Text style={[styles.value, { flex: 0.5, fontWeight: 'normal' }]}>{item.cantidad}</Text>
                <Text style={[styles.value, { flex: 2, fontWeight: 'normal' }]}>{item.nombre}</Text>
                <Text style={[styles.value, { flex: 1, textAlign: 'right', fontWeight: 'normal' }]}>${item.importe.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.dashedDivider, { marginVertical: 16 }]} />
          
          <View style={styles.amounts}>
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
  logo: { width: 50, height: 50, resizeMode: 'contain', marginBottom: 8 },
  brandName: { fontSize: 24, fontWeight: '900', color: colors.dark, marginBottom: 8, letterSpacing: 2 },
  ticketInfo: { fontSize: 12, color: colors.darkLight, marginBottom: 2, fontFamily: 'monospace' },
  dashedDivider: { height: 1, borderWidth: 1, borderColor: colors.darkLighter, borderStyle: 'dashed', marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: colors.darkLight, fontFamily: 'monospace' },
  value: { fontSize: 14, color: colors.dark, fontWeight: 'bold', fontFamily: 'monospace' },
  itemsTable: { marginVertical: 8 },
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

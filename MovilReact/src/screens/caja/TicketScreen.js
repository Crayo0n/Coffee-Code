import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ventasService } from '../../services/ventasService';
import { useNavigation, useRoute } from '@react-navigation/native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { logoBase64 } from '../../constants/logoBase64';

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

  const handlePrint = async () => {
    try {
      const logoSrc = logoBase64;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
            <style>
              @page { margin: 0; }
              body { 
                font-family: 'Courier New', Courier, monospace; 
                padding: 40px 20px; 
                margin: 0;
                background-color: #fff;
                color: #1a1a1a;
                display: flex;
                justify-content: center;
              }
              .ticket {
                width: 100%;
                max-width: 400px;
                background: #fff;
              }
              .header { text-align: center; margin-bottom: 20px; }
              .logo-img {
                width: 70px;
                height: 70px;
                object-fit: contain;
                margin: 0 auto 10px auto;
                display: block;
              }
              h1 { 
                font-size: 28px; 
                font-weight: 900; 
                margin: 0 0 5px 0; 
                letter-spacing: 2px; 
                color: #3b2b20;
                font-family: sans-serif;
              }
              .info { font-size: 12px; color: #666; margin-bottom: 2px; }
              .divider { 
                border-top: 1.5px dashed #ccc; 
                margin: 15px 0; 
              }
              .row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 8px; 
                font-size: 14px;
              }
              .label { color: #666; }
              .value { font-weight: bold; color: #1a1a1a; }
              .item-row { margin-bottom: 6px; }
              .item-name { text-align: left; }
              .amounts { margin-top: 15px; }
              .total-row { 
                font-size: 20px; 
                font-weight: 900; 
                margin-top: 10px; 
                color: #1a1a1a;
              }
              .footer { text-align: center; margin-top: 30px; }
              .thank-you { font-style: italic; font-size: 14px; margin-bottom: 20px; }
              .barcode { 
                font-family: 'Libre Barcode 39 Text', cursive; 
                font-size: 48px; 
                margin-top: 20px;
                display: block;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <img src="${logoSrc}" class="logo-img" />
                <h1>COFFEE CODE</h1>
                <div class="info">Ticket de Venta</div>
                <div class="info">ID: ${venta.id_venta.toString().padStart(3, '0')} | Fecha: ${venta.fecha}</div>
              </div>
              
              <div class="divider"></div>
              
              <div class="row">
                <span class="label">Mesero</span>
                <span class="value">${venta.mesero?.nombre || venta.mesero || 'General'}</span>
              </div>
              <div class="row">
                <span class="label">Método de Pago</span>
                <span class="value">${venta.metodo_pago || 'Efectivo'}</span>
              </div>
              
              <div class="divider"></div>
              
              ${venta.items.map(d => `
                <div class="row item-row">
                  <span class="label item-name">${d.cantidad}x ${d.nombre || 'Producto'}</span>
                  <span class="value">$${(d.importe || 0).toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="divider"></div>
              
              <div class="amounts">
                <div class="row">
                  <span class="label">Subtotal</span>
                  <span class="value">$${(venta.subtotal || 0).toFixed(2)}</span>
                </div>
                <div class="row">
                  <span class="label">Propina</span>
                  <span class="value">$${(venta.propina || 0).toFixed(2)}</span>
                </div>
                <div class="row total-row">
                  <span>TOTAL</span>
                  <span>$${(venta.total || 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <div class="footer">
                <div class="thank-you">¡Gracias por tu visita!</div>
                <div class="barcode">*${venta.id_venta.toString().padStart(4, '0')}*</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Éxito', 'El ticket fue generado exitosamente en PDF.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo generar el recibo.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Historial')}>
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
            <View style={[styles.row, { marginBottom: 12 }]}>
              <Text style={styles.label}>Mesero</Text>
              <Text style={styles.value}>{venta.mesero?.nombre || venta.mesero || 'General'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Método de Pago</Text>
              <Text style={styles.value}>{venta.metodo_pago}</Text>
            </View>
          </View>
          
          <View style={styles.dashedDivider} />
          
          <View style={styles.itemsTable}>
            {venta.items.map((detalle, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.label}>{detalle.cantidad}x {detalle.nombre || 'Producto'}</Text>
                <Text style={styles.value}>${(detalle.importe || 0).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.dashedDivider} />
          
          <View style={styles.amounts}>
            <View style={[styles.row, { marginBottom: 4 }]}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>${(venta.subtotal || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.row, { marginBottom: 12 }]}>
              <Text style={styles.label}>Propina</Text>
              <Text style={styles.value}>${(venta.propina || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>${venta.total.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.dashedDivider} />
          
          <View style={[styles.ticketFooter, { marginBottom: 16 }]}>
            <Text style={styles.thankYou}>¡Gracias por tu visita!</Text>
            <View style={{ marginTop: 16, alignItems: 'center', width: '100%' }}>
              {venta.id_venta ? (
                <Barcode 
                  format="CODE128" 
                  value={String(venta.id_venta).padStart(4, '0')} 
                  text={String(venta.id_venta).padStart(4, '0')} 
                  style={{ width: 200, height: 60 }} 
                  maxWidth={250}
                />
              ) : null}
            </View>
          </View>
          
          {/* Decorative zig-zag bottom */}
          <View style={styles.zigzagContainer}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={styles.zigzagTooth} />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
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
    paddingBottom: 60, // Space for zigzag and barcode
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

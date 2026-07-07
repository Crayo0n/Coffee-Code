import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { pedidosService } from '../../services/pedidosService';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomAlert from '../../components/Alert';

export default function DetallePedidoScreen() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info', onConfirm: null });

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({ title, message, type, onConfirm });
    setAlertVisible(true);
  };
  
  const navigation = useNavigation();
  const route = useRoute();
  const pedidoId = route.params?.id;

  const fetchPedido = async () => {
    try {
      const data = await pedidosService.getPedido(pedidoId);
      setPedido(data);
    } catch (error) {
      console.error('Error fetching pedido details:', error);
      showAlert('Error', 'No se pudo cargar el pedido', 'error', () => navigation.goBack());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pedidoId) {
      fetchPedido();
    }
  }, [pedidoId]);

  const sendToKitchen = async () => {
    setIsUpdating(true);
    try {
      await pedidosService.updateStatus(pedidoId, { status: 'PREPARANDO' });
      showAlert('¡Comanda Enviada!', 'El pedido ha sido enviado a cocina correctamente.', 'success', () => navigation.navigate('Inicio'));
    } catch (error) {
      showAlert('Error', 'No se pudo enviar la comanda a cocina.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const markReadyToPay = async () => {
    setIsUpdating(true);
    try {
      await pedidosService.updateStatus(pedidoId, { status: 'POR_COBRAR' });
      showAlert('Cobro Solicitado', 'Se ha notificado a caja para que procese el pago.', 'success', () => navigation.navigate('Inicio'));
    } catch (error) {
      showAlert('Error', 'No se pudo solicitar el cobro.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    let bgColor = colors.mintLight;
    let textColor = colors.dark;
    let text = status;

    if (status === 'PREPARANDO') {
      bgColor = colors.dangerLight;
      textColor = colors.danger;
      text = 'En Preparación';
    } else if (status === 'LISTO') {
      bgColor = colors.mint;
      textColor = colors.dark;
      text = 'Listo para Cobro';
    } else if (status === 'PENDIENTE') {
      bgColor = colors.mintLight;
      textColor = colors.dark;
      text = 'Nuevo';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>{text}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.coffee} />
      </View>
    );
  }

  if (!pedido) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.title}>Resumen Pedido</Text>
          <Text style={styles.subtitle}>Mesa {pedido.mesa_id}</Text>
        </View>
        {getStatusBadge(pedido.status)}
      </View>

      <FlatList
        data={pedido.detalles}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>Artículos ({pedido.detalles.length})</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemQtyBadge}>
              <Text style={styles.itemQtyText}>{item.quantity || item.cantidad}x</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName}>{item.producto?.nombre || item.producto?.name || 'Producto'}</Text>
              {item.notas ? <Text style={styles.itemNotes}>{item.notas}</Text> : null}
            </View>
            <Text style={styles.itemPrice}>${((item.producto?.price || item.producto?.precio || 0) * (item.quantity || item.cantidad || 0)).toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={() => {
          const total = pedido.detalles.reduce((sum, item) => sum + ((item.producto?.price || item.producto?.precio || 0) * (item.quantity || item.cantidad || 0)), 0);
          return (
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${(total / 1.16).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (16%)</Text>
              <Text style={styles.totalValue}>${(total - (total / 1.16)).toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalFinalLabel}>Total</Text>
              <Text style={styles.totalFinalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        )}}
      />

      <View style={styles.footerActions}>
        {pedido.status === 'PENDIENTE' && (
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={sendToKitchen}
            disabled={isUpdating}
          >
            {isUpdating ? <ActivityIndicator color={colors.white} /> : (
              <>
                <Text style={styles.primaryBtnText}>A Cocina</Text>
                <Ionicons name="send" size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        )}
        
        {pedido.status === 'LISTO' && (
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.danger }]}
            onPress={markReadyToPay}
            disabled={isUpdating}
          >
            {isUpdating ? <ActivityIndicator color={colors.white} /> : (
              <>
                <Text style={styles.primaryBtnText}>Solicitar Cobro</Text>
                <Ionicons name="card" size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        )}
        
        {pedido.status === 'PREPARANDO' && (
          <View style={styles.waitingContainer}>
             <ActivityIndicator size="small" color={colors.darkLight} style={{ marginRight: 8 }} />
             <Text style={styles.waitingText}>Esperando a que Cocina marque como Listo...</Text>
          </View>
        )}
      </View>
      
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertVisible(false);
          if (alertConfig.onConfirm) alertConfig.onConfirm();
        }}
      />
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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.dark },
  subtitle: { fontSize: 12, color: colors.darkLight },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
  content: { paddingHorizontal: 24, paddingBottom: 220 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.dark, marginBottom: 16, marginTop: 16 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16, borderRadius: 20, marginBottom: 12,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  itemQtyBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.mintLight,
    justifyContent: 'center', alignItems: 'center'
  },
  itemQtyText: { color: colors.coffee, fontWeight: 'bold' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: colors.dark },
  itemNotes: { fontSize: 12, color: colors.darkLight, marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: colors.coffee },
  totalsContainer: {
    backgroundColor: colors.white,
    padding: 24, borderRadius: 24, marginTop: 12,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 14, color: colors.darkLight },
  totalValue: { fontSize: 14, color: colors.darkLight, fontWeight: '500' },
  divider: { height: 2, backgroundColor: colors.mintLight, marginVertical: 12, borderStyle: 'dashed', borderRadius: 1 },
  totalFinalLabel: { fontSize: 18, fontWeight: 'bold', color: colors.dark },
  totalFinalValue: { fontSize: 24, fontWeight: 'bold', color: colors.coffee },
  footerActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 110, paddingTop: 16,
    backgroundColor: colors.light,
  },
  primaryBtn: {
    backgroundColor: colors.coffee,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, borderRadius: 20,
    shadowColor: colors.coffee, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  waitingContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(252, 247, 251, 0.8)', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: colors.mintLight
  },
  waitingText: { fontSize: 12, color: colors.darkLight, fontWeight: '600' }
});

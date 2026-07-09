import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { productosService } from '../../services/productosService';
import { pedidosService } from '../../services/pedidosService';
import { mesasService } from '../../services/mesasService';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomAlert from '../../components/Alert';

const PRODUCT_IMAGES = {
  'espresso_intenso.png': require('../../../assets/productos/espresso_intenso.png'),
  'latte_vainilla.png': require('../../../assets/productos/latte_vainilla.png'),
  'cafe_americano.png': require('../../../assets/productos/cafe_americano.png'),
  'frappe_moka.png': require('../../../assets/productos/frappe_moka.png'),
  'croissant.png': require('../../../assets/productos/croissant.png')
};

export default function CrearPedidoScreen() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info', onConfirm: null });

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({ title, message, type, onConfirm });
    setAlertVisible(true);
  };
  
  const navigation = useNavigation();
  const route = useRoute();
  const mesaId = route.params?.mesaId || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          productosService.getProductos(),
          productosService.getCategorias()
        ]);
        setProductos(prodData.filter(p => p.status === 'activo' || p.estado?.name === 'disponible'));
        setCategorias(catData);
        if (catData.length > 0) setSelectedCategoria(catData[0].id);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateCart = (producto, delta) => {
    setCart(prev => {
      const current = prev[producto.id]?.cantidad || 0;
      const newCant = Math.max(0, current + delta);
      
      const newCart = { ...prev };
      if (newCant === 0) {
        delete newCart[producto.id];
      } else {
        newCart[producto.id] = { producto, cantidad: newCant };
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((sum, item) => sum + ((item.producto.price || item.producto.precio || 0) * item.cantidad), 0);
  };
  
  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.cantidad, 0);
  };

  const handleSubmit = async () => {
    const items = Object.values(cart);
    if (items.length === 0) {
      showAlert('Atención', 'El pedido está vacío, debes agregar al menos un producto.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const pedidoData = {
        table_id: mesaId,
        detalles: items.map(item => ({
          product_id: item.producto.id,
          quantity: item.cantidad
        }))
      };

      const newPedido = await pedidosService.createPedido(pedidoData);
      await mesasService.updateStatus(mesaId, { status: 'ocupada' });
      navigation.navigate('DetallePedido', { id: newPedido.id });
    } catch (error) {
      showAlert('Error', 'No se pudo crear el pedido, inténtalo de nuevo.', 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProductos = productos.filter(p => p.categoria_id === selectedCategoria || p.categoria?.id === selectedCategoria);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.title}>Nuevo Pedido</Text>
          <Text style={styles.subtitle}>Mesa {mesaId}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.coffee} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categorias.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.categoryBtn, selectedCategoria === cat.id && styles.categoryBtnActive]}
                  onPress={() => setSelectedCategoria(cat.id)}
                >
                  <Text style={[styles.categoryText, selectedCategoria === cat.id && styles.categoryTextActive]}>
                    {(cat.nombre || cat.name || '').replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredProductos}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => {
              const cantidad = cart[item.id]?.cantidad || 0;
              let photoSrc = require('../../../assets/icon.png');
              if (item.photo) {
                if (item.photo.startsWith('data:image') || item.photo.startsWith('http')) {
                  photoSrc = { uri: item.photo };
                } else if (PRODUCT_IMAGES[item.photo]) {
                  photoSrc = PRODUCT_IMAGES[item.photo];
                }
              }
              return (
                <View style={styles.productCard}>
                  <View style={styles.imageContainer}>
                    <Image source={photoSrc} style={styles.productImage} />
                    <View style={styles.priceTag}>
                      <Text style={styles.priceTagText}>${item.price || item.precio}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name || item.nombre}</Text>
                    {item.description && <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>}
                  </View>
                  
                  <View style={styles.quantityControls}>
                    {cantidad > 0 ? (
                      <>
                        <TouchableOpacity 
                          style={[styles.qtyBtn, styles.qtyBtnMinus]} 
                          onPress={() => handleUpdateCart(item, -1)}
                        >
                          <Ionicons name="remove" size={16} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{cantidad}</Text>
                        <TouchableOpacity 
                          style={[styles.qtyBtn, styles.qtyBtnPlus]} 
                          onPress={() => handleUpdateCart(item, 1)}
                        >
                          <Ionicons name="add" size={16} color={colors.white} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity 
                        style={styles.addBtn} 
                        onPress={() => handleUpdateCart(item, 1)}
                      >
                        <Text style={styles.addBtnText}>+ Agregar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />

          {getCartItemsCount() > 0 && (
            <View style={styles.footer}>
              <View style={styles.footerInfo}>
                <Text style={styles.footerItems}>{getCartItemsCount()} artículos</Text>
                <Text style={styles.footerTotal}>${getCartTotal().toFixed(2)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Ver Pedido</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      
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
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.dark },
  subtitle: { fontSize: 14, color: colors.dark, opacity: 0.7 },
  categoriesContainer: { paddingHorizontal: 24, paddingBottom: 16 },
  categoryBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    backgroundColor: colors.white, marginRight: 12,
    borderWidth: 1, borderColor: colors.mintLight,
  },
  categoryBtnActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  categoryText: { color: colors.darkLight, fontWeight: '600' },
  categoryTextActive: { color: colors.white },
  productList: { paddingHorizontal: 16, paddingBottom: 180 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  productCard: {
    backgroundColor: colors.white, borderRadius: 24,
    width: '48%', padding: 12,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  imageContainer: {
    width: '100%', height: 120, borderRadius: 16, overflow: 'hidden', marginBottom: 12,
    backgroundColor: colors.light,
  },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  priceTag: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  priceTagText: { fontSize: 12, fontWeight: 'bold', color: colors.coffee },
  productInfo: { marginBottom: 12 },
  productName: { fontSize: 14, fontWeight: 'bold', color: colors.dark, marginBottom: 2 },
  productDesc: { fontSize: 12, color: colors.darkLight },
  quantityControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 36,
  },
  addBtn: {
    backgroundColor: colors.mintLight, width: '100%', height: '100%',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center'
  },
  addBtnText: { color: colors.dark, fontWeight: 'bold', fontSize: 13 },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  qtyBtnMinus: { backgroundColor: colors.darkLight },
  qtyBtnPlus: { backgroundColor: colors.coffee },
  qtyText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: colors.dark },
  footer: {
    position: 'absolute', bottom: 90, left: 0, right: 0,
    backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20,
    borderRadius: 30,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: colors.dark, shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10,
  },
  footerInfo: { flex: 1 },
  footerItems: { fontSize: 14, color: colors.darkLight, fontWeight: '600' },
  footerTotal: { fontSize: 24, fontWeight: 'bold', color: colors.coffee },
  submitBtn: {
    backgroundColor: colors.coffee, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16,
  },
  submitBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 16, marginRight: 4 }
});

import React, { useState, useEffect } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { mesasService } from '../../services/mesasService';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function MesasScreen() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchMesas = async () => {
    try {
      const data = await mesasService.getMesas();
      setMesas(data);
    } catch (error) {
      console.error('Error fetching mesas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchMesas();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMesas();
  };

  const renderMesa = ({ item }) => {
    const isOcupada = item.status === 'ocupada';

    return (
      <View style={[styles.card, isOcupada ? styles.cardOcupada : styles.cardDisponible]}>
        {isOcupada && (
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>Ocupada</Text>
          </View>
        )}
        
        <View style={styles.iconContainer}>
          <Ionicons name={isOcupada ? 'people' : 'restaurant'} size={24} color={isOcupada ? colors.coffee : colors.darkLight} />
        </View>
        
        <Text style={[styles.mesaName, !isOcupada && { color: colors.darkLight }]}>Mesa {item.id}</Text>
        
        <View style={styles.capacityContainer}>
          <Ionicons name="person" size={12} color={colors.darkLight} />
          <Text style={styles.capacityText}>Capacidad: {item.capacidad}</Text>
        </View>

        {isOcupada ? (
          <>
            <Text style={styles.statusTextOcupada}>En Servicio</Text>
            <TouchableOpacity 
              style={styles.actionBtnOcupada}
              // Ideally navigate to DetallePedido of the active order, but for simplicity:
              onPress={() => navigation.navigate('Inicio')} 
            >
              <Text style={styles.actionBtnTextOcupada}>Ver Estado</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.statusTextDisponible}>Disponible</Text>
            <TouchableOpacity 
              style={styles.actionBtnDisponible}
              onPress={() => navigation.navigate('Pedidos', { screen: 'CrearPedido', params: { mesaId: item.id } })}
            >
              <Text style={styles.actionBtnTextDisponible}>Abrir Mesa</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Plano de Mesas</Text>
          <Text style={styles.subtitle}>Zonas interior y terraza</Text>
        </View>
        <View style={styles.headerBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{mesas.filter(m => m.status === 'ocupada').length} Ocupadas</Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.coffee} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={mesas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMesa}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.coffee]} />
            }
          />
        )}
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  subtitle: {
    fontSize: 14,
    color: colors.dark,
    opacity: 0.7,
  },
  headerBadge: {
    backgroundColor: colors.coffee,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardOcupada: {
    borderWidth: 2,
    borderColor: colors.coffee,
  },
  cardDisponible: {
    borderWidth: 2,
    borderColor: 'rgba(53, 39, 40, 0.1)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(252, 247, 251, 0.5)',
  },
  timeBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.coffee,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  timeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mintLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  mesaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 4,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 12,
    color: colors.darkLight,
    fontWeight: '500',
  },
  statusTextOcupada: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.coffee,
    marginBottom: 12,
  },
  statusTextDisponible: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.mint,
    marginBottom: 12,
  },
  actionBtnOcupada: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: colors.mintLight,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mintMedium,
  },
  actionBtnDisponible: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnTextOcupada: {
    color: colors.dark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionBtnTextDisponible: {
    color: colors.dark,
    fontSize: 12,
    fontWeight: 'bold',
  }
});

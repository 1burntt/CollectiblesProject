// app/card/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { generarNombreUsuario } from '../../utils/nameGenerator';
import { fetchCardById, type Card } from '@/API';
import { useUserCollection } from '../../contexts/UserCollectionContext';

const { width, height } = Dimensions.get('window');

export default function CardDetailScreen() {
  const { id, fromCollection } = useLocalSearchParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const {
    addToInventory,
    addToWishlist,
    addToTradeList,
    isInInventory,
    isInWishlist,
    isInTradeList
  } = useUserCollection();

  useEffect(() => {
    if (!fromCollection) {
      setOwner(generarNombreUsuario());
    }
    if (id) loadCardDetails(id as string);
  }, [id, fromCollection]);

  const loadCardDetails = async (cardId: string) => {
    try {
      const data = await fetchCardById(cardId);
      setCard(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToInventory = () => {
    if (card) {
      addToInventory(card);
      Alert.alert('✅ Añadido a Inventario', `"${card.name}" se ha guardado en tu inventario.`);
    }
  };

  const handleAddToWishlist = () => {
    if (card) {
      addToWishlist(card);
      Alert.alert('❤️ Añadido a Wishlist', `"${card.name}" se ha guardado en tu wishlist.`, [
        { text: 'Ver Wishlist', onPress: () => router.push('../(tabs)/wishlistScreen') },
        { text: 'OK' }
      ]);
    }
  };

  const handleAddToTradeList = () => {
    if (card) {
      if (!isInInventory(card.id)) {
        Alert.alert('❌ No está en inventario', 'Debes agregar la carta a tu inventario primero.');
        return;
      }
      addToTradeList(card);
      Alert.alert('🔄 Añadido a Trade List', `"${card.name}" está listado para intercambio.`, [
        { text: 'Ver Trade List', onPress: () => router.push('../(tabs)/TradeReady') },
        { text: 'OK' }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>Cargando detalles...</ThemedText>
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>No se encontró la carta.</ThemedText>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={30} color="white" />
          </TouchableOpacity>
          {!fromCollection && (
            <ThemedText style={styles.ownerText}>{owner} tiene esta carta</ThemedText>
          )}
        </View>

        {/* Imagen clickeable con /high.png */}
        <TouchableOpacity
          style={styles.imageSection}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: `${card.image}/high.png` }}
            style={styles.mainCardImage}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          <View style={styles.zoomHint}>
            <Ionicons name="expand-outline" size={20} color="white" />
            <ThemedText style={styles.zoomText}>Tocar para ampliar</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Tres botones */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.inventoryBtn]}
            onPress={handleAddToInventory}
            disabled={isInInventory(card.id)}
          >
            <Ionicons name="briefcase" size={24} color={isInInventory(card.id) ? '#666' : '#4CAF50'} />
            <ThemedText style={[styles.btnLabel, isInInventory(card.id) && styles.disabledText]}>
              {isInInventory(card.id) ? 'En Inventario' : 'Agregar a Inventario'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.wishlistBtn]}
            onPress={handleAddToWishlist}
            disabled={isInWishlist(card.id)}
          >
            <Ionicons name="heart" size={24} color={isInWishlist(card.id) ? '#666' : '#E91E63'} />
            <ThemedText style={[styles.btnLabel, isInWishlist(card.id) && styles.disabledText]}>
              {isInWishlist(card.id) ? 'En Wishlist' : 'Agregar a Wishlist'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.tradeBtn]}
            onPress={handleAddToTradeList}
            disabled={isInTradeList(card.id)}
          >
            <Ionicons name="swap-horizontal" size={24} color={isInTradeList(card.id) ? '#666' : '#FFA500'} />
            <ThemedText style={[styles.btnLabel, isInTradeList(card.id) && styles.disabledText]}>
              {isInTradeList(card.id) ? 'En Trade List' : 'Agregar a Trade List'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Información de la carta */}
        <View style={styles.infoBox}>
          <ThemedText type="subtitle" style={styles.infoTitle}>Card Information</ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Series:</ThemedText>
            <ThemedText style={styles.value}>{card.set?.name || 'Unknown'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Name:</ThemedText>
            <ThemedText style={styles.value}>{card.name}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Number:</ThemedText>
            <ThemedText style={styles.value}>#{card.localId || card.id.split('-')[1]}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>HP / Element:</ThemedText>
            <ThemedText style={styles.value}>{card.hp || 'N/A'} - {card.types?.join(', ') || 'Neutral'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Illustrator:</ThemedText>
            <ThemedText style={styles.value}>{card.illustrator || 'Unknown'}</ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Modal con /high.png */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: `${card.image}/high.png` }}
              style={styles.modalImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  navHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40 },
  ownerText: { color: '#888', marginLeft: 15, fontSize: 16 },
  imageSection: { alignItems: 'center', marginVertical: 20, position: 'relative' },
  mainCardImage: { width: '90%', aspectRatio: 0.7, borderRadius: 20 },
  zoomHint: { position: 'absolute', bottom: 10, right: 30, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  zoomText: { color: 'white', fontSize: 12, marginLeft: 5 },
  actionButtons: { flexDirection: 'column', paddingHorizontal: 20, marginVertical: 20, gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, borderWidth: 1, gap: 10 },
  inventoryBtn: { backgroundColor: '#1A3A1A', borderColor: '#4CAF50' },
  wishlistBtn: { backgroundColor: '#3A1A2A', borderColor: '#E91E63' },
  tradeBtn: { backgroundColor: '#3A2A1A', borderColor: '#FFA500' },
  btnLabel: { fontSize: 14, fontWeight: '600' },
  disabledText: { color: '#666' },
  infoBox: { backgroundColor: '#111', margin: 20, padding: 20, borderRadius: 15 },
  infoTitle: { color: 'white', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#666', fontSize: 14 },
  value: { color: '#ddd', fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.95, height: height * 0.8, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '100%' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
});
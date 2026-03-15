import { fetchCardById, type Card } from '@/API';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions, FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useUserCollection } from '../../contexts/UserCollectionContext';
import { generarNombreUsuario } from '../../utils/nameGenerator';

// Para saber el tamaño de la pantalla y ajustar las imágenes
const { width, height } = Dimensions.get('window');

export default function CardDetailScreen() {
  // --------------------------------------------------------------------
  // 1. RECOGER LO QUE NOS PASAN AL ENTRAR EN LA PANTALLA
  // --------------------------------------------------------------------
  // id es el identificador de la carta (ej: "swsh1-1")
  // fromCollection es un parámetro opcional que nos dice si venimos de una colección (inventario, wishlist...)
  const { id, fromCollection } = useLocalSearchParams();
  const router = useRouter();

  // --------------------------------------------------------------------
  // 2. ESTADOS DE LA PANTALLA
  // --------------------------------------------------------------------
  const [card, setCard] = useState<Card | null>(null);     // La carta que estamos viendo
  const [owner, setOwner] = useState('');                  // Quién es el dueño (si venimos de explorar)
  const [loading, setLoading] = useState(true);            // ¿Estamos cargando?
  const [modalVisible, setModalVisible] = useState(false);  // ¿Está abierta la imagen gigante?

  // Estados para el modal de selección de carta (para pedir intercambio)
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Traemos todas las funciones de la mochila (inventario, wishlist, etc.)
  const {
    addToInventory,
    addToWishlist,
    addToTradeList,
    isInInventory,
    isInWishlist,
    isInTradeList,
    inventory
  } = useUserCollection();

  // --------------------------------------------------------------------
  // 3. EFECTO INICIAL: cuando la pantalla se carga, generamos un dueño
  //    (si no venimos de colección) y cargamos los detalles de la carta.
  // --------------------------------------------------------------------
  useEffect(() => {
    // Si NO venimos de una colección (inventario, wishlist, etc.), entonces
    // esta carta pertenece a otro usuario. Le ponemos un nombre al azar.
    if (!fromCollection) {
      setOwner(generarNombreUsuario());
    }
    // Cargamos los detalles de la carta usando el ID
    if (id) loadCardDetails(id as string);
  }, [id, fromCollection]); // Se ejecuta cada vez que cambia el id o fromCollection

  // --------------------------------------------------------------------
  // 4. FUNCIÓN PARA CARGAR LOS DETALLES DE LA CARTA
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // 5. FUNCIONES PARA LOS BOTONES (AÑADIR A COLECCIONES)
  // --------------------------------------------------------------------
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
      // Para ofrecer una carta, primero tiene que estar en el inventario
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

  // --------------------------------------------------------------------
  // 6. FUNCIÓN PARA "PEDIR CARTA" (solo si la carta es de otro usuario)
  // --------------------------------------------------------------------
  const handleRequestCard = () => {
    if (inventory.length === 0) {
      Alert.alert('❌ Inventario vacío', 'No tienes cartas en tu inventario para ofrecer.');
      return;
    }
    // Abrimos el modal para que elija una carta de su inventario para ofrecer
    setSelectModalVisible(true);
  };

  // --------------------------------------------------------------------
  // 7. FUNCIÓN CUANDO EL USUARIO SELECCIONA UNA CARTA DE SU INVENTARIO PARA OFRECER
  // --------------------------------------------------------------------
  const handleSelectCard = (selected: Card) => {
    setSelectedCard(selected);
    setSelectModalVisible(false);

    // Mostramos un mensaje de que la solicitud se envió (simulado)
    Alert.alert(
      '📨 Solicitud enviada',
      `Se mandó una petición a ${owner} para intercambiar su ${card?.name} por tu ${selected.name}.`,
      [{ text: 'OK' }]
    );
  };

  // --------------------------------------------------------------------
  // 8. DIBUJAR CADA CARTA DENTRO DEL MODAL DE SELECCIÓN
  // --------------------------------------------------------------------
  const renderInventoryItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={styles.inventoryItem}
      onPress={() => handleSelectCard(item)}
    >
      <Image
        source={{ uri: `${item.image}/low.png` }}
        style={styles.inventoryItemImage}
        contentFit="contain"
      />
      <ThemedText numberOfLines={2} style={styles.inventoryItemName}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  // --------------------------------------------------------------------
  // 9. PANTALLAS DE CARGA Y ERROR
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // 10. PANTALLA PRINCIPAL DE DETALLE
  // --------------------------------------------------------------------
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cabecera con botón de volver */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={30} color="white" />
          </TouchableOpacity>
          {!fromCollection && (
            <ThemedText style={styles.ownerText}>{owner} tiene esta carta</ThemedText>
          )}
        </View>

        {/* --- SECCIÓN DE LA IMAGEN GRANDE --- */}
        <TouchableOpacity
          style={styles.imageSection}
          onPress={() => setModalVisible(true)}  // Al tocar, abre la imagen gigante
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: `${card.image}/high.png` }}  // Imagen en alta calidad
            style={styles.mainCardImage}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          <View style={styles.zoomHint}>
            <Ionicons name="expand-outline" size={20} color="white" />
            <ThemedText style={styles.zoomText}>Tocar para ampliar</ThemedText>
          </View>
        </TouchableOpacity>

        {/* --- CUATRO BOTONES DE ACCIÓN --- */}
        <View style={styles.actionButtons}>
          {/* Botón 1: Añadir a Inventario */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.inventoryBtn]}
            onPress={handleAddToInventory}
            disabled={isInInventory(card.id)} // Se desactiva si ya está en inventario
          >
            <Ionicons
              name="briefcase"
              size={24}
              color={isInInventory(card.id) ? '#666' : '#4CAF50'}
            />
            <ThemedText style={[styles.btnLabel, isInInventory(card.id) && styles.disabledText]}>
              {isInInventory(card.id) ? 'En Inventario' : 'Agregar a Inventario'}
            </ThemedText>
          </TouchableOpacity>

          {/* Botón 2: Añadir a Wishlist */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.wishlistBtn]}
            onPress={handleAddToWishlist}
            disabled={isInWishlist(card.id)}
          >
            <Ionicons
              name="heart"
              size={24}
              color={isInWishlist(card.id) ? '#666' : '#FF8A5C'}
            />
            <ThemedText style={[styles.btnLabel, isInWishlist(card.id) && styles.disabledText]}>
              {isInWishlist(card.id) ? 'En Wishlist' : 'Agregar a Wishlist'}
            </ThemedText>
          </TouchableOpacity>

          {/* Botón 3: Añadir a Trade List */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.tradeBtn]}
            onPress={handleAddToTradeList}
            disabled={isInTradeList(card.id)}
          >
            <Ionicons
              name="swap-horizontal"
              size={24}
              color={isInTradeList(card.id) ? '#666' : '#4A9EFF'}
            />
            <ThemedText style={[styles.btnLabel, isInTradeList(card.id) && styles.disabledText]}>
              {isInTradeList(card.id) ? 'En Trade List' : 'Agregar a Trade List'}
            </ThemedText>
          </TouchableOpacity>

          {/* Botón 4: Pedir carta (SOLO cuando NO viene de colección) */}
          {!fromCollection && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.requestBtn]}
              onPress={handleRequestCard}
            >
              <Ionicons name="mail" size={24} color="#FFD93D" />
              <ThemedText style={styles.btnLabel}>Pedir carta</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* --- INFORMACIÓN DETALLADA DE LA CARTA --- */}
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

      {/* --- MODAL PARA VER LA IMAGEN EN GRANDE --- */}
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

      {/* --- MODAL PARA SELECCIONAR CARTA DEL INVENTARIO (AL PEDIR UN INTERCAMBIO) --- */}
      <Modal visible={selectModalVisible} transparent animationType="slide">
        <View style={styles.selectModalContainer}>
          <View style={styles.selectModalContent}>
            <View style={styles.selectModalHeader}>
              <ThemedText style={styles.selectModalTitle}>Selecciona una carta de tu inventario</ThemedText>
              <TouchableOpacity onPress={() => setSelectModalVisible(false)}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>

            {inventory.length === 0 ? (
              <View style={styles.emptyInventory}>
                <ThemedText>No tienes cartas en tu inventario</ThemedText>
              </View>
            ) : (
              <FlatList
                data={inventory}
                renderItem={renderInventoryItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.inventoryList}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------
// 11. ESTILOS
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  centerContainer: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
    backgroundColor: '#0F1420',
  },
  ownerText: { color: '#A0AEC0', marginLeft: 15, fontSize: 16 },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
    backgroundColor: '#1A1F2A',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A3344',
  },
  mainCardImage: { width: '90%', aspectRatio: 0.7, borderRadius: 16 },
  zoomHint: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF8A5C',
  },
  zoomText: { color: 'white', fontSize: 12, marginLeft: 5 },

  // Estilos para los 4 botones
  actionButtons: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    marginVertical: 20,
    gap: 12
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    backgroundColor: '#1A1F2A',
  },
  inventoryBtn: {
    backgroundColor: '#1A2A1A',
    borderColor: '#4CAF50'
  },
  wishlistBtn: {
    backgroundColor: '#2A1A2A',
    borderColor: '#FF8A5C'
  },
  tradeBtn: {
    backgroundColor: '#1A1A2A',
    borderColor: '#4A9EFF'
  },
  requestBtn: {
    backgroundColor: '#2A2A1A',
    borderColor: '#FFD93D'
  },
  btnLabel: { fontSize: 14, fontWeight: '600', color: 'white' },
  disabledText: { color: '#666' },

  infoBox: {
    backgroundColor: '#1A1F2A',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2A3344',
  },
  infoTitle: {
    color: 'white',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
    paddingBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#A0AEC0', fontSize: 14 },
  value: { color: '#FFD93D', fontSize: 14, fontWeight: 'bold' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: width * 0.95,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },

  // Estilos para el modal de selección
  selectModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#1A1F2A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3344',
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
  },
  selectModalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyInventory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryList: {
    paddingBottom: 20,
  },
  inventoryItem: {
    width: '48%',
    aspectRatio: 0.8,
    backgroundColor: '#0F1420',
    borderRadius: 12,
    margin: '1%',
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3344',
  },
  inventoryItemImage: {
    width: '100%',
    height: '70%',
    borderRadius: 8,
  },
  inventoryItemName: {
    color: '#A0AEC0',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
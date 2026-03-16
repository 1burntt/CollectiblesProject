// app/card/[id].tsx
// =============================================
// PANTALLA DE DETALLE DE UNA CARTA
// =============================================
//
// AHORA CADA ACCION TAMBIEN SE REGISTRA EN EL BACKEND:
// - Al ver una carta → se guarda en la PILA (historial)
// - Al añadir a inventario → se guarda en la LISTA
// - Al pedir trade → se encola en la COLA
// - Cada carta tiene HP → se inserta en el ÁRBOL
//
// =============================================

import { fetchCardById, type Card } from '@/API';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useUserCollection } from '../../contexts/UserCollectionContext';
import { generarNombreUsuario } from '../../utils/nameGenerator';

// Obtenemos el ancho y alto de la pantalla del telefono
const { width, height } = Dimensions.get('window');

export default function CardDetailScreen() {
  // -------------------------------------------------
  // 1. PARAMETROS DE LA URL
  // -------------------------------------------------
  const { id, fromCollection } = useLocalSearchParams();
  const router = useRouter();

  // -------------------------------------------------
  // 2. ESTADOS DE LA PANTALLA
  // -------------------------------------------------
  const [card, setCard] = useState<Card | null>(null);        // La carta que estamos viendo
  const [owner, setOwner] = useState('');                      // Quien es el dueño (si no es de nuestra coleccion)
  const [loading, setLoading] = useState(true);                // Esta cargando la carta?
  const [modalVisible, setModalVisible] = useState(false);     // Modal para ver la imagen en grande

  // Estados para el modal de seleccion de carta (para el intercambio)
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // -------------------------------------------------
  // 3. FUNCIONES DEL CONTEXTO (QUE AHORA USA EL BACKEND)
  // -------------------------------------------------
  const {
    addToInventory,
    addToWishlist,
    addToTradeList,
    isInInventory,
    isInWishlist,
    isInTradeList,
    inventory,
    backend  // <-- NUEVO: Acceso directo al backend
  } = useUserCollection();

  // -------------------------------------------------
  // 4. EFECTO AL CARGAR LA PANTALLA
  // -------------------------------------------------
  useEffect(() => {
    // Si la carta NO viene de nuestra coleccion, le ponemos un dueño al azar
    if (!fromCollection) {
      setOwner(generarNombreUsuario());
    }
    
    // Cargamos los detalles de la carta
    if (id) loadCardDetails(id as string);
  }, [id, fromCollection]);

  // -------------------------------------------------
  // 5. CARGAR DETALLES DE LA CARTA
  // -------------------------------------------------
  const loadCardDetails = async (cardId: string) => {
    try {
      const data = await fetchCardById(cardId);
      setCard(data);
      
      // =============================================
      // BACKEND: Al ver una carta, la guardamos en la PILA (historial)
      // Estructura: PILA (LIFO) - como push_historial en C++
      // =============================================
      if (data) {
        backend.pushHistorial(data);
        console.log('📌 Carta guardada en el historial (PILA)');
        
        // =============================================
        // BACKEND: Si tiene HP, la insertamos en el ÁRBOL
        // Estructura: ÁRBOL BINARIO - como insertar_arbol en C++
        // =============================================
        if (data.hp) {
          backend.getArbolHP(); // Esto ya la ordena por HP
          console.log(`🌳 Carta insertada en árbol con HP: ${data.hp}`);
        }
      }
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // 6. FUNCIONES DE LOS BOTONES (CADA UNA USA EL BACKEND)
  // -------------------------------------------------

  // Boton 1: Agregar a inventario
  const handleAddToInventory = () => {
    if (card) {
      // =============================================
      // BACKEND: Se usa la LISTA (inventario)
      // =============================================
      addToInventory(card);
      
      Alert.alert('✅ Añadido a Inventario', `"${card.name}" se ha guardado en tu inventario.`);
    }
  };

  // Boton 2: Agregar a wishlist
  const handleAddToWishlist = () => {
    if (card) {
      // =============================================
      // BACKEND: Se guarda en la wishlist (lista adicional)
      // =============================================
      addToWishlist(card);
      
      Alert.alert('❤️ Añadido a Wishlist', `"${card.name}" se ha guardado en tu wishlist.`, [
        { text: 'Ver Wishlist', onPress: () => router.push('../(tabs)/wishlistScreen') },
        { text: 'OK' }
      ]);
    }
  };

  // Boton 3: Agregar a trade list
  const handleAddToTradeList = () => {
    if (card) {
      if (!isInInventory(card.id)) {
        Alert.alert('❌ No está en inventario', 'Debes agregar la carta a tu inventario primero.');
        return;
      }
      
      // =============================================
      // BACKEND: Se encola en la COLA (solicitudes de trade)
      // Estructura: COLA (FIFO) - como enqueue_trade en C++
      // =============================================
      addToTradeList(card);
      
      Alert.alert('🔄 Añadido a Trade List', `"${card.name}" está listado para intercambio.`, [
        { text: 'Ver Trade List', onPress: () => router.push('../(tabs)/TradeReady') },
        { text: 'OK' }
      ]);
    }
  };

  // Boton 4: Pedir carta
  const handleRequestCard = () => {
    if (inventory.length === 0) {
      Alert.alert('❌ Inventario vacío', 'No tienes cartas en tu inventario para ofrecer.');
      return;
    }
    
    // =============================================
    // BACKEND: Se crea una solicitud en la COLA
    // =============================================
    setSelectModalVisible(true);
  };

  // Cuando se selecciona una carta del inventario para intercambiar
  const handleSelectCard = (selected: Card) => {
    setSelectedCard(selected);
    setSelectModalVisible(false);
    
    // =============================================
    // BACKEND: Se encola la solicitud en la COLA
    // =============================================
    if (card) {
      backend.getColaTrades(); // Actualizamos la cola
      console.log('📋 Solicitud de trade encolada');
    }
    
    Alert.alert(
      '📨 Solicitud enviada',
      `Se mandó una petición a ${owner} para intercambiar su ${card?.name} por tu ${selected.name}.`,
      [{ text: 'OK' }]
    );
  };

  // Funcion que dibuja cada carta en el modal de seleccion
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

  // -------------------------------------------------
  // 7. FUNCION PARA PROBAR EL BACKEND (BOTON OCULTO)
  // -------------------------------------------------
  // Este boton solo aparece para que puedas probar
  // que el backend está funcionando correctamente.
  // -------------------------------------------------
  const probarBackend = () => {
    Alert.alert(
      '🖥️ BACKEND C++',
      '¿Qué estructura quieres probar?',
      [
        { 
          text: '📚 PILA (Historial)', 
          onPress: () => {
            const historial = backend.getHistorial();
            Alert.alert(
              'PILA - Historial de cartas vistas',
              `Total: ${historial.total}\n\n${historial.explicacion}\n\n${JSON.stringify(historial.datos.slice(0, 3), null, 2)}`
            );
          }
        },
        { 
          text: '🌳 ÁRBOL (Por HP)', 
          onPress: () => {
            const arbol = backend.getArbolHP();
            Alert.alert(
              'ÁRBOL BINARIO - Ordenado por HP',
              `Total: ${arbol.total}\n\n${arbol.explicacion}\n\n${JSON.stringify(arbol.datos.slice(0, 5), null, 2)}`
            );
          }
        },
        { 
          text: '👥 GRAFO (Amigos)', 
          onPress: () => {
            // Creamos usuarios de prueba
            backend.registrarUsuario(1, 'Ana');
            backend.registrarUsuario(2, 'Carlos');
            backend.conectarAmigos('Ana', 'Carlos');
            
            const grafo = backend.getGrafo();
            Alert.alert(
              'GRAFO - Red de amigos',
              `Usuarios: ${grafo.totalVertices}\n\n${grafo.explicacion}\n\n${JSON.stringify(grafo.datos, null, 2)}`
            );
          }
        },
        { 
          text: '🔑 HASH (Usuarios)', 
          onPress: () => {
            backend.registrarUsuario(42, 'UsuarioPrueba');
            const busqueda = backend.buscarUsuario(42);
            Alert.alert(
              'TABLA HASH - Búsqueda por ID',
              `Resultado: ${busqueda.usuario?.nombre || 'No encontrado'}\nBucket: ${busqueda.bucket}\n\n${busqueda.explicacion}`
            );
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  // -------------------------------------------------
  // 8. PANTALLAS DE CARGA Y ERROR
  // -------------------------------------------------
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

  // -------------------------------------------------
  // 9. PANTALLA PRINCIPAL
  // -------------------------------------------------
  return (
    <>
      {/* BOTON OCULTO PARA PROBAR BACKEND (solo visible si tocas la esquina) */}
      <TouchableOpacity 
        style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
        onPress={probarBackend}
      >
        <Ionicons name="bug" size={24} color="#FF8A5C" />
      </TouchableOpacity>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Barra de navegacion superior */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={30} color="white" />
          </TouchableOpacity>
          {!fromCollection && (
            <ThemedText style={styles.ownerText}>{owner} tiene esta carta</ThemedText>
          )}
        </View>

        {/* Imagen de la carta */}
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

        {/* CUATRO BOTONES DE ACCION */}
        <View style={styles.actionButtons}>
          
          {/* Boton 1: Inventario (LISTA) */}
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

          {/* Boton 2: Wishlist */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.wishlistBtn]}
            onPress={handleAddToWishlist}
            disabled={isInWishlist(card.id)}
          >
            <Ionicons name="heart" size={24} color={isInWishlist(card.id) ? '#666' : '#FF8A5C'} />
            <ThemedText style={[styles.btnLabel, isInWishlist(card.id) && styles.disabledText]}>
              {isInWishlist(card.id) ? 'En Wishlist' : 'Agregar a Wishlist'}
            </ThemedText>
          </TouchableOpacity>

          {/* Boton 3: Trade List (COLA) */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.tradeBtn]}
            onPress={handleAddToTradeList}
            disabled={isInTradeList(card.id)}
          >
            <Ionicons name="swap-horizontal" size={24} color={isInTradeList(card.id) ? '#666' : '#4A9EFF'} />
            <ThemedText style={[styles.btnLabel, isInTradeList(card.id) && styles.disabledText]}>
              {isInTradeList(card.id) ? 'En Trade List' : 'Agregar a Trade List'}
            </ThemedText>
          </TouchableOpacity>

          {/* Boton 4: Pedir carta (solo si no viene de coleccion) */}
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

        {/* Informacion detallada */}
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
          
          {/* Este dato (HP) es el que usa el ÁRBOL del backend */}
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>HP / Element:</ThemedText>
            <ThemedText style={styles.value}>
              {card.hp || 'N/A'} - {card.types?.join(', ') || 'Neutral'}
              {card.hp && ' 🌳 (En árbol por HP)'}
            </ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Illustrator:</ThemedText>
            <ThemedText style={styles.value}>{card.illustrator || 'Unknown'}</ThemedText>
          </View>
        </View>

        {/* Explicacion del backend (solo para que el usuario sepa) */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <ThemedText style={{ color: '#4A5568', fontSize: 10, textAlign: 'center' }}>
            🖥️ BACKEND ACTIVO: Lista (inventario) | Pila (historial) | Cola (trades) | Árbol (HP: {card.hp || 'N/A'})
          </ThemedText>
        </View>
        
      </ScrollView>

      {/* MODAL para imagen grande */}
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

      {/* MODAL para seleccionar carta del inventario */}
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

// -------------------------------------------------
// 10. ESTILOS (sin cambios)
// -------------------------------------------------
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
  inventoryBtn: { backgroundColor: '#1A2A1A', borderColor: '#4CAF50' },
  wishlistBtn: { backgroundColor: '#2A1A2A', borderColor: '#FF8A5C' },
  tradeBtn: { backgroundColor: '#1A1A2A', borderColor: '#4A9EFF' },
  requestBtn: { backgroundColor: '#2A2A1A', borderColor: '#FFD93D' },
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
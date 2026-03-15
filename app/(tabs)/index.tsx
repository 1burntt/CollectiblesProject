
import { fetchAllCards, searchCardsByName } from '@/API';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useUserCollection } from '../../contexts/UserCollectionContext';
import { generarNombreUsuario } from '../../utils/nameGenerator';

// ----------------------------------------------------------------------
// Definimos la forma de una carta para esta pantalla (necesitamos id, nombre y foto)
// ----------------------------------------------------------------------
interface Card {
  id: string;
  name: string;
  image?: string;
}

export default function HomeScreen() {
  // --------------------------------------------------------------------
  // 1. ESTADOS DE LA PANTALLA (variables que pueden cambiar y hacen que la pantalla se actualice)
  // --------------------------------------------------------------------

  // Lista principal de cartas que se muestran
  const [cards, setCards] = useState<Card[]>([]);
  // ¿Estamos cargando las cartas por primera vez?
  const [loading, setLoading] = useState(true);
  // ¿Está visible el menú lateral?
  const [isPanelVisible, setPanelVisible] = useState(false);
  // Nombre del usuario (se genera al azar)
  const [username, setUsername] = useState("");
  // Página actual para cargar más cartas (infinite scroll)
  const [page, setPage] = useState(1);
  // ¿Estamos cargando más cartas ahora mismo?
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // ¿Quedan más cartas por cargar?
  const [hasMore, setHasMore] = useState(true);
  // Si hay un error, guardamos el mensaje aquí
  const [error, setError] = useState<string | null>(null);

  // --- Estado para el BUSCADOR ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Traemos las funciones de la mochila (UserCollectionContext)
  const { clearAllData } = useUserCollection();

  // --- Animaciones para que la pantalla se vea bonita al abrirse ---
  const fadeAnim = useRef(new Animated.Value(0)).current;      // Empieza invisible (0)
  const scaleAnim = useRef(new Animated.Value(0.95)).current; // Empieza un poco más pequeña

  // --------------------------------------------------------------------
  // 2. EFECTO INICIAL (se ejecuta una sola vez cuando la pantalla se carga)
  // --------------------------------------------------------------------
  useEffect(() => {
    // Generamos un nombre de usuario aleatorio
    setUsername(generarNombreUsuario());
    // Cargamos las primeras cartas
    loadInitialCards();

    // Iniciamos las animaciones de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,               // Queremos que termine siendo visible (1)
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,               // Queremos que termine con su tamaño normal (1)
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // El array vacío [] significa "ejecutar solo una vez al cargar"

  // --------------------------------------------------------------------
  // 3. FUNCIONES PARA CARGAR CARTAS
  // --------------------------------------------------------------------

  // Carga las primeras cartas (página 1)
  const loadInitialCards = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando cartas iniciales...');
      const data = await fetchAllCards(1, 20);
      console.log(`📊 Cartas recibidas: ${data.length}`);
      if (data.length === 0) {
        setError('No se encontraron cartas. Intenta de nuevo.');
      } else {
        setCards(data);
        setPage(2);          // La próxima vez que se cargue, será la página 2
        setHasMore(data.length === 20); // Si vinieron 20, seguramente hay más
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error al cargar las cartas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Carga más cartas (cuando el usuario hace scroll al final)
  const loadMoreCards = async () => {
    // Si ya estamos cargando, o no hay más, o es la carga inicial, no hacemos nada
    if (isLoadingMore || !hasMore || loading) return;

    setIsLoadingMore(true);
    try {
      console.log(`🔄 Cargando página ${page}...`);
      const newCards = await fetchAllCards(page, 20);
      if (newCards.length > 0) {
        // Añadimos las nuevas cartas al final de la lista que ya tenemos
        setCards(prev => [...prev, ...newCards]);
        setPage(prev => prev + 1);
        setHasMore(newCards.length === 20);
        console.log(`✅ Añadidas ${newCards.length} cartas. Total: ${cards.length + newCards.length}`);
      } else {
        setHasMore(false);
        console.log('🏁 No hay más cartas');
      }
    } catch (error) {
      console.error('❌ Error cargando más cartas:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // --------------------------------------------------------------------
  // 4. FUNCIONES DEL BUSCADOR
  // --------------------------------------------------------------------

  // Cada vez que el usuario escribe en el buscador, llamamos a esta función
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      // Si escribe menos de 2 letras, ocultamos resultados
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setShowResults(true);
    try {
      const results = await searchCardsByName(text);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Botón para cancelar la búsqueda y volver a la lista principal
  const cancelSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  // --------------------------------------------------------------------
  // 5. FUNCIÓN PARA IR AL DETALLE DE UNA CARTA
  // --------------------------------------------------------------------
  const handleCardPress = (cardId: string) => {
    router.push(`../card/${cardId}`);
  };

  // --------------------------------------------------------------------
  // 6. FUNCIÓN PARA BORRAR TODOS LOS DATOS (con confirmación)
  // --------------------------------------------------------------------
  const limpiarTodosLosDatos = () => {
    Alert.alert(
      '🗑️ Borrar todos los datos',
      '¿Estás seguro? Esta acción eliminará todo tu inventario, wishlist y cartas listadas para trade.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData(); // Llama a la función de la mochila
              setSearchQuery('');    // Limpia el buscador por si acaso
              setShowResults(false);
              setSearchResults([]);
              Alert.alert('✅ Listo', 'Todos tus datos han sido eliminados.');
              setPanelVisible(false); // Cierra el menú lateral
            } catch (error) {
              console.error('Error al borrar datos:', error);
              Alert.alert('❌ Error', 'No se pudieron borrar los datos.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // --------------------------------------------------------------------
  // 7. DIBUJAR (RENDERIZAR) UNA SOLA CARTA EN LA CUADRÍCULA
  // --------------------------------------------------------------------
  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => handleCardPress(item.id)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        contentFit="contain"
        cachePolicy="memory-disk" // Guarda la imagen en memoria para que cargue más rápido después
      />
      {/* numberOfLines={1} hace que si el nombre es muy largo, se corte con "..." */}
      <ThemedText numberOfLines={1} style={styles.cardName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  // --------------------------------------------------------------------
  // 8. PANTALLAS DE CARGA Y ERROR (lo que se ve antes de que carguen las cartas)
  // --------------------------------------------------------------------
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#0A0A0A' }]}>
        <ActivityIndicator size="large" color="#FF8A5C" />
        <ThemedText style={styles.loadingText}>Cargando cartas...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#0A0A0A' }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF8A5C" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitialCards}>
          <ThemedText style={styles.retryText}>Reintentar</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // --------------------------------------------------------------------
  // 9. PANTALLA PRINCIPAL (con todo el contenido)
  // --------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Barra de estado (la hora, batería, etc.) la ponemos blanca sobre fondo oscuro */}
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Imagen de fondo (wallpaper) muy transparente para que se vea el contenido */}
      <Image
        source={require('../../assets/images/wallpaper.jpg')}
        style={[styles.wallpaper, { opacity: 0.15 }]}
        contentFit="cover"
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* --- CABECERA --- */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.logoText}>COLLECTIBLES</ThemedText>
          <TouchableOpacity onPress={() => setPanelVisible(true)} style={styles.menuIconButton}>
            <Ionicons name="menu-outline" size={35} color="#FF8A5C" />
          </TouchableOpacity>
        </View>

        {/* --- BUSCADOR --- */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#A0AEC0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              placeholderTextColor="#4A5568"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={cancelSearch}>
                <Ionicons name="close-circle" size={20} color="#A0AEC0" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- LISTA DE CARTAS (pueden ser resultados de búsqueda o la lista principal) --- */}
        {showResults ? (
          // Si estamos mostrando resultados de búsqueda
          <FlatList
            data={searchResults}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={3} // Mostramos 3 columnas
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.scrollBody}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <ThemedText style={styles.resultsText}>
                  Resultados para &quot;{searchQuery}&quot;
                </ThemedText>
              </View>
            }
            ListEmptyComponent={
              // Si no hay resultados y no está buscando, mostramos un mensaje
              !isSearching && searchQuery.length >= 2 ? (
                <View style={styles.centerContainer}>
                  <ThemedText style={{ color: '#A0AEC0' }}>No se encontraron cartas</ThemedText>
                </View>
              ) : null
            }
            ListFooterComponent={
              // Si está buscando, mostramos un circulito de carga
              isSearching ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#6C5CE7" />
                  <ThemedText style={styles.footerText}>Buscando...</ThemedText>
                </View>
              ) : null
            }
          />
        ) : (
          // Si no, mostramos la lista principal de cartas
          <FlatList
            data={cards}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.scrollBody}
            onEndReached={loadMoreCards}       // Cuando llegue al final, carga más
            onEndReachedThreshold={0.5}        // Se activa cuando falta la mitad de la pantalla
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#6C5CE7" />
                  <ThemedText style={styles.footerText}>Cargando más...</ThemedText>
                </View>
              ) : null
            }
          />
        )}

        {/* --- MENÚ LATERAL (MODAL) --- */}
        <Modal visible={isPanelVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            {/* Toque fuera del menú para cerrarlo */}
            <TouchableOpacity style={styles.closeOverlay} onPress={() => setPanelVisible(false)} activeOpacity={1} />
            <View style={styles.sidePanel}>
              {/* Información del usuario */}
              <View style={styles.userInfoSection}>
                <Image
                  source={require('../../assets/images/profile-pic.jpg')}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
                <ThemedText style={styles.panelUser}>{username}</ThemedText>
              </View>

              {/* Lista de opciones del menú */}
              <View style={styles.menuList}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setPanelVisible(false); router.push('/(tabs)/inventoryScreen'); }}
                >
                  <Ionicons name="briefcase-outline" size={22} color="#FF8A5C" />
                  <ThemedText style={styles.menuItemText}>Inventory</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setPanelVisible(false); router.push('/(tabs)/wishlistScreen'); }}
                >
                  <Ionicons name="heart-outline" size={22} color="#FFD93D" />
                  <ThemedText style={styles.menuItemText}>Wishlist</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setPanelVisible(false); router.push('/(tabs)/TradeReady'); }}
                >
                  <Ionicons name="swap-horizontal-outline" size={22} color="#4A9EFF" />
                  <ThemedText style={styles.menuItemText}>Listed for Trade</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Botón de borrar datos */}
              <TouchableOpacity style={styles.deleteButton} onPress={limpiarTodosLosDatos}>
                <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                <ThemedText style={styles.deleteButtonText}>Borrar Datos</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ----------------------------------------------------------------------
// 10. ESTILOS (cómo se ven las cosas)
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  wallpaper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: '#6C5CE7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  menuIconButton: {
    padding: 8,
    backgroundColor: '#1A1F2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3344',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1F2A',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3344',
  },
  searchInput: {
    flex: 1,
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  scrollBody: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 15
  },
  cardWrapper: {
    width: '31%',
    aspectRatio: 0.72,
    backgroundColor: '#1A1F2A',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2A3344',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '85%',
    borderRadius: 12,
  },
  cardName: {
    color: '#A0AEC0',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#A0AEC0'
  },
  errorText: {
    color: '#FF8A5C',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
    marginTop: 20
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#4A9EFF',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  footerLoader: {
    marginVertical: 20,
    alignItems: 'center'
  },
  footerText: {
    color: '#A0AEC0',
    marginTop: 5
  },

  // Estilos del menú lateral
  modalContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  closeOverlay: {
    flex: 0.3,
    backgroundColor: 'rgba(0,0,0,0.8)'
  },
  sidePanel: {
    flex: 0.7,
    backgroundColor: '#121826',
    borderLeftWidth: 1,
    borderLeftColor: '#2A3344',
    position: 'relative',
  },
  userInfoSection: {
    padding: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
    backgroundColor: '#0F1420',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FF8A5C',
  },
  panelUser: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  menuList: {
    padding: 20
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
    backgroundColor: '#1A1F2A',
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },

  deleteButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  resultsHeader: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
  },
  resultsText: {
    color: '#A0AEC0',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
// app/(tabs)/index.tsx
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

// --- 1. Definimos la forma de una carta para esta pantalla ---
interface Card {
  id: string;
  name: string;
  image?: string;
}

// --- 2. Funcion principal de la pantalla ---
export default function HomeScreen() {
  // --- 2.1. Estados (variables que pueden cambiar y hacer que la pantalla se vuelva a dibujar) ---
  const [cards, setCards] = useState<Card[]>([]);           // Lista de cartas principales
  const [loading, setLoading] = useState(true);             // Esta cargando las cartas iniciales?
  const [isPanelVisible, setPanelVisible] = useState(false); // Esta abierto el menu lateral?
  const [username, setUsername] = useState("");              // Nombre de usuario
  const [page, setPage] = useState(1);                       // Pagina actual para cargar mas cartas
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Esta cargando mas cartas?
  const [hasMore, setHasMore] = useState(true);              // Hay mas cartas por cargar?
  const [error, setError] = useState<string | null>(null);   // Hay algun error?

  // Estados para la busqueda
  const [searchQuery, setSearchQuery] = useState('');        // Lo que el usuario escribe en la busqueda
  const [searchResults, setSearchResults] = useState<Card[]>([]); // Resultados de la busqueda
  const [isSearching, setIsSearching] = useState(false);     // Esta buscando en este momento?
  const [showResults, setShowResults] = useState(false);     // Mostrar resultados de busqueda?

  // Funcion para borrar todo (viene del contexto)
  const { clearAllData } = useUserCollection();

  // Referencias y valores para las animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;   // Para la animacion de opacidad (de 0 a 1)
  const scaleAnim = useRef(new Animated.Value(0.95)).current; // Para la animacion de tamaño (de 0.95 a 1)

  // --- 2.2. Efecto que se ejecuta UNA SOLA VEZ al cargar la pantalla ---
  useEffect(() => {
    // Generamos un nombre de usuario al azar
    setUsername(generarNombreUsuario());
    // Cargamos las cartas iniciales
    loadInitialCards();

    // Iniciamos las animaciones
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // --- 2.3. Funcion para cargar las primeras cartas (llamada desde el useEffect) ---
  const loadInitialCards = async () => {
    setLoading(true);   // Activamos el indicador de carga
    setError(null);     // Limpiamos cualquier error anterior
    try {
      console.log('🔄 Cargando cartas iniciales...');
      // Pedimos las primeras 20 cartas a la API
      const data = await fetchAllCards(1, 20);
      console.log(`📊 Cartas recibidas: ${data.length}`);

      if (data.length === 0) {
        // Si no hay cartas, mostramos un mensaje de error amigable
        setError('No se encontraron cartas. Intenta de nuevo.');
      } else {
        // Guardamos las cartas, aumentamos la pagina a 2 y decimos que hay mas si llegaron 20
        setCards(data);
        setPage(2);
        setHasMore(data.length === 20);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error al cargar las cartas. Verifica tu conexión.');
    } finally {
      setLoading(false); // Apagamos el indicador de carga, pase lo que pase
    }
  };

  // --- 2.4. Funcion para cargar MAS cartas (cuando el usuario hace scroll al final) ---
  const loadMoreCards = async () => {
    // Si ya estamos cargando, no hay mas o la pantalla esta cargando, no hacemos nada
    if (isLoadingMore || !hasMore || loading) return;

    setIsLoadingMore(true); // Activamos el indicador de "cargando mas"
    try {
      console.log(`🔄 Cargando pagina ${page}...`);
      const newCards = await fetchAllCards(page, 20);

      if (newCards.length > 0) {
        // Añadimos las nuevas cartas a la lista que ya teniamos
        setCards(prev => [...prev, ...newCards]);
        setPage(prev => prev + 1); // Aumentamos el numero de pagina
        // Si nos dieron menos de 20 cartas, significa que ya no hay mas
        setHasMore(newCards.length === 20);
        console.log(`✅ Añadidas ${newCards.length} cartas. Total: ${cards.length + newCards.length}`);
      } else {
        setHasMore(false); // No hay mas cartas
        console.log('🏁 No hay más cartas');
      }
    } catch (error) {
      console.error('❌ Error cargando más cartas:', error);
    } finally {
      setIsLoadingMore(false); // Apagamos el indicador de "cargando mas"
    }
  };

  // --- 2.5. Funcion para cuando tocan una carta ---
  const handleCardPress = (cardId: string) => {
    // Navegamos a la pantalla de detalle de esa carta
    router.push(`../card/${cardId}`);
  };

  // --- 2.6. Funcion para buscar ---
  const handleSearch = async (text: string) => {
    setSearchQuery(text); // Guardamos lo que el usuario escribe

    // Si el texto es muy corto, limpiamos los resultados y no buscamos
    if (text.length < 2) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true); // Activamos el indicador de busqueda
    setShowResults(true);  // Mostramos la seccion de resultados
    try {
      const results = await searchCardsByName(text);
      setSearchResults(results); // Guardamos los resultados
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false); // Apagamos el indicador de busqueda
    }
  };

  // --- 2.7. Funcion para cancelar la busqueda y volver a la lista principal---
  const cancelSearch = () => {
    setSearchQuery('');   // Borramos el texto de busqueda
    setShowResults(false); // Ocultamos los resultados
    setSearchResults([]); // Limpiamos los resultados
  };

  // --- 2.8. Funcion para borrar todos los datos (con confirmacion) ---
  const limpiarTodosLosDatos = () => {
    // Mostramos una alerta de confirmacion
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
              await clearAllData();          // Llamamos a la funcion del contexto
              setSearchQuery('');             // Limpiamos busqueda
              setShowResults(false);
              setSearchResults([]);
              Alert.alert('✅ Listo', 'Todos tus datos han sido eliminados.');
              setPanelVisible(false);         // Cerramos el menu
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

  // --- 2.9. Funcion que dibuja CADA carta en la lista (como un molde) ---
  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity style={styles.cardWrapper} onPress={() => handleCardPress(item.id)}>
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        contentFit="contain"
        cachePolicy="memory-disk" // Guarda la imagen en cache para que cargue mas rapido la proxima vez
      />
      <ThemedText numberOfLines={1} style={styles.cardName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  // --- 2.10. Que mostramos mientras cargan las cartas ---
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#0A0A0A' }]}>
        <ActivityIndicator size="large" color="#FF8A5C" />
        <ThemedText style={styles.loadingText}>Cargando cartas...</ThemedText>
      </View>
    );
  }

  // --- 2.11. Que mostramos si hubo un error al cargar ---
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

  // --- 2.12. La pantalla principal (con toda la interfaz) ---
  return (
    <View style={styles.container}>
      {/* Barra de estado (hora, bateria, etc) */}
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* IMAGEN DE FONDO (wallpaper) */}
      <Image
        source={require('../../assets/images/wallpaper.jpg')}
        style={[styles.wallpaper, { opacity: 0.15 }]} // Muy bajita la opacidad para que se vea el contenido
        contentFit="cover"
      />

      {/* Contenedor principal seguro (evita que el contenido se meta en la barra de estado o la barra de navegacion del telefono) */}
      <SafeAreaView style={{ flex: 1 }}>
        {/* Cabecera con el logo y el boton del menu */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.logoText}>COLLECTIBLES</ThemedText>
          <TouchableOpacity onPress={() => setPanelVisible(true)} style={styles.menuIconButton}>
            <Ionicons name="menu-outline" size={35} color="#FF8A5C" />
          </TouchableOpacity>
        </View>

        {/* Barra de busqueda */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#A0AEC0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cartas..."
              placeholderTextColor="#4A5568"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {/* Si hay texto en la busqueda, mostramos una 'X' para limpiar */}
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={cancelSearch}>
                <Ionicons name="close-circle" size={20} color="#A0AEC0" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* MOSTRAMOS RESULTADOS DE BUSQUEDA O LA LISTA PRINCIPAL */}
        {showResults ? (
          // --- SI ESTAMOS BUSCANDO, MOSTRAMOS LOS RESULTADOS ---
          <FlatList
            data={searchResults}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={3} // 3 columnas
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.scrollBody}
            ListHeaderComponent={
              // Cabecera de los resultados
              <View style={styles.resultsHeader}>
                <ThemedText style={styles.resultsText}>
                  Resultados para "{searchQuery}"
                </ThemedText>
              </View>
            }
            ListEmptyComponent={
              // Si no hay resultados y ya termino de buscar
              !isSearching && searchQuery.length >= 2 ? (
                <View style={styles.centerContainer}>
                  <ThemedText style={{ color: '#A0AEC0' }}>No se encontraron cartas</ThemedText>
                </View>
              ) : null
            }
            ListFooterComponent={
              // Mostramos un indicador mientras buscamos
              isSearching ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#6C5CE7" />
                  <ThemedText style={styles.footerText}>Buscando...</ThemedText>
                </View>
              ) : null
            }
          />
        ) : (
          // --- SI NO ESTAMOS BUSCANDO, MOSTRAMOS LA LISTA PRINCIPAL ---
          <FlatList
            data={cards}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.scrollBody}
            onEndReached={loadMoreCards}          // Cuando lleguemos al final, cargamos mas
            onEndReachedThreshold={0.5}           // Cuando falte la mitad de la pantalla, empezamos a cargar
            ListFooterComponent={
              // Mostramos un indicador si estamos cargando mas
              isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#6C5CE7" />
                  <ThemedText style={styles.footerText}>Cargando más...</ThemedText>
                </View>
              ) : null
            }
          />
        )}

        {/* --- MODAL DEL MENU LATERAL (se desliza desde la derecha) --- */}
        <Modal visible={isPanelVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            
            {/* Zona OSCURA fuera del menu */}
            <TouchableOpacity 
              style={styles.closeOverlay} 
              onPress={() => setPanelVisible(false)} 
              activeOpacity={1} 
            />

            {/* El panel del menu */}
            <View style={styles.sidePanel}>
              
              {/* SECCION DEL USUARIO */}
              <View style={styles.userInfoSection}>
                <Image
                  source={require('../../assets/images/profile-pic.jpg')}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
                <ThemedText style={styles.panelUser}>{username}</ThemedText>
              </View>

              {/* LISTA DE OPCIONES DEL MENU */}
              <View style={styles.menuList}>
                
                {/* Opcion 1: Ir al Inventario */}
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => { 
                    setPanelVisible(false); 
                    router.push('/(tabs)/inventoryScreen'); 
                  }}
                >
                  <Ionicons name="briefcase-outline" size={22} color="#FF8A5C" />
                  <ThemedText style={styles.menuItemText}>Inventory</ThemedText>
                </TouchableOpacity>
                
                {/* Opcion 2: Ir a Wishlist */}
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => { 
                    setPanelVisible(false); 
                    router.push('/(tabs)/wishlistScreen'); 
                  }}
                >
                  <Ionicons name="heart-outline" size={22} color="#FFD93D" />
                  <ThemedText style={styles.menuItemText}>Wishlist</ThemedText>
                </TouchableOpacity>
                
                {/* Opcion 3: Ir a Trade List */}
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => { 
                    setPanelVisible(false); 
                    router.push('/(tabs)/TradeReady'); 
                  }}
                >
                  <Ionicons name="swap-horizontal-outline" size={22} color="#4A9EFF" />
                  <ThemedText style={styles.menuItemText}>Listed for Trade</ThemedText>
                </TouchableOpacity>

                {/* =========================================
                    OPCION DE BACKEND DEMO: ELIMINADA
                    Ya no aparece aqui. El backend ahora
                    esta integrado en toda la app.
                ========================================= */}
                
              </View>

              {/* BOTON PARA BORRAR DATOS */}
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={limpiarTodosLosDatos}
              >
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

// --- 3. Estilos de la pantalla (todo junto para facilitar la busqueda) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Fondo oscuro principal
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

  // Estilos del Modal
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
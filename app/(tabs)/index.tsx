import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, SafeAreaView, TouchableOpacity,
  TextInput, Modal, StatusBar, FlatList, Alert, ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { generarNombreUsuario } from '../../utils/nameGenerator';
import { fetchAllCards, searchCardsByName } from '@/API';
import { useUserCollection } from '../../contexts/UserCollectionContext';

interface Card {
  id: string;
  name: string;
  image?: string;
}

export default function HomeScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelVisible, setPanelVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Contexto para limpiar las colecciones
  const { clearAllData } = useUserCollection();

  useEffect(() => {
    setUsername(generarNombreUsuario());
    loadInitialCards();
  }, []);

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
        setPage(2);
        setHasMore(data.length === 20);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error al cargar las cartas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCards = async () => {
    if (isLoadingMore || !hasMore || loading) return;

    setIsLoadingMore(true);
    try {
      console.log(`🔄 Cargando página ${page}...`);
      const newCards = await fetchAllCards(page, 20);

      if (newCards.length > 0) {
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

  const handleCardPress = (cardId: string) => {
    router.push(`../card/${cardId}`);
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.length < 2) {
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

  const cancelSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  // Función para borrar todos los datos
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
              await clearAllData();
              setSearchQuery('');
              setShowResults(false);
              setSearchResults([]);
              Alert.alert('✅ Listo', 'Todos tus datos han sido eliminados.');
              setPanelVisible(false);
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

  const renderCardItem = ({ item, index }: { item: Card; index: number }) => (
    <TouchableOpacity 
      style={[
        styles.cardWrapper,
        (index + 1) % 3 !== 0 && styles.cardMarginRight
      ]} 
      onPress={() => handleCardPress(item.id)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <ThemedText numberOfLines={1} style={styles.cardName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#367C9C" />
        <ThemedText style={styles.loadingText}>Cargando cartas...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitialCards}>
          <ThemedText style={styles.retryText}>Reintentar</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.logoText}>COLLECTIBLES</ThemedText>
          <TouchableOpacity onPress={() => setPanelVisible(true)} style={styles.menuIconButton}>
            <Ionicons name="menu-outline" size={35} color="white" />
          </TouchableOpacity>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={cancelSearch}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* RESULTADOS DE BÚSQUEDA O LISTA PRINCIPAL */}
        {showResults ? (
          <FlatList
            data={searchResults}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={false}
            contentContainerStyle={styles.scrollBody}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <ThemedText style={styles.resultsText}>
                  Resultados para "{searchQuery}"
                </ThemedText>
              </View>
            }
            ListEmptyComponent={
              !isSearching && searchQuery.length >= 2 ? (
                <View style={styles.centerContainer}>
                  <ThemedText>No se encontraron cartas</ThemedText>
                </View>
              ) : null
            }
            ListFooterComponent={
              isSearching ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#367C9C" />
                  <ThemedText style={styles.footerText}>Buscando...</ThemedText>
                </View>
              ) : null
            }
          />
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={false}
            contentContainerStyle={styles.scrollBody}
            onEndReached={loadMoreCards}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#367C9C" />
                  <ThemedText style={styles.footerText}>Cargando más...</ThemedText>
                </View>
              ) : null
            }
          />
        )}

        {/* PANEL LATERAL CON FOTO DE PERFIL Y BOTÓN DE BORRAR */}
        <Modal visible={isPanelVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeOverlay} onPress={() => setPanelVisible(false)} activeOpacity={1} />
            <View style={styles.sidePanel}>
              <View style={styles.userInfoSection}>
                {/* FOTO DE PERFIL - Coloca tu imagen en assets/images/profile-pic.jpg */}
                <Image
                  source={require('../../assets/images/profile-pic.jpg')}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
                <ThemedText style={styles.panelUser}>{username}</ThemedText>
              </View>
              
              <View style={styles.menuList}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setPanelVisible(false); router.push('/(tabs)/inventoryScreen'); }}>
                  <Ionicons name="briefcase-outline" size={22} color="white" />
                  <ThemedText style={styles.menuItemText}>Inventory</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setPanelVisible(false); router.push('/(tabs)/wishlistScreen'); }}>
                  <Ionicons name="heart-outline" size={22} color="white" />
                  <ThemedText style={styles.menuItemText}>Wishlist</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setPanelVisible(false); router.push('/(tabs)/TradeReady'); }}>
                  <Ionicons name="swap-horizontal-outline" size={22} color="white" />
                  <ThemedText style={styles.menuItemText}>Listed for Trade</ThemedText>
                </TouchableOpacity>
              </View>

              {/* BOTÓN DE BORRAR DATOS */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  logoText: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  menuIconButton: { padding: 5 },
  searchSection: { paddingHorizontal: 20, marginBottom: 15 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 15, alignItems: 'center' },
  searchInput: { flex: 1, color: 'white', marginLeft: 10, fontSize: 16 },
  scrollBody: { paddingHorizontal: 10, paddingBottom: 20 },
  gridRow: { justifyContent: 'space-between', marginBottom: 15 },
  cardWrapper: { 
    width: '31%', 
    aspectRatio: 0.72, 
    backgroundColor: '#111', 
    borderRadius: 12, 
    overflow: 'hidden', 
    alignItems: 'center', 
    padding: 5,
    marginBottom: 15
  },
  cardMarginRight: {
    marginRight: '3.5%',
  },
  cardImage: { width: '100%', height: '85%' },
  cardName: { color: '#888', fontSize: 11, marginTop: 4, fontWeight: '500' },
  loadingText: { marginTop: 10, color: '#888' },
  errorText: { color: '#FF6B6B', fontSize: 16, textAlign: 'center', marginHorizontal: 40, marginTop: 20 },
  retryButton: { marginTop: 20, backgroundColor: '#367C9C', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryText: { color: 'white', fontSize: 16, fontWeight: '600' },
  footerLoader: { marginVertical: 20, alignItems: 'center' },
  footerText: { color: '#888', marginTop: 5 },
  
  // Estilos del modal
  modalContainer: { flex: 1, flexDirection: 'row' },
  closeOverlay: { flex: 0.3, backgroundColor: 'rgba(0,0,0,0.6)' },
  sidePanel: { 
    flex: 0.7, 
    backgroundColor: '#121212', 
    borderLeftWidth: 1, 
    borderLeftColor: '#333',
    position: 'relative',
  },
  userInfoSection: { padding: 40, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  
  // Estilo para la foto de perfil
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  
  panelUser: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  menuList: { padding: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  menuItemText: { color: 'white', fontSize: 16, marginLeft: 15 },
  
  // Botón de borrar datos
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
    borderBottomColor: '#333',
  },
  resultsText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
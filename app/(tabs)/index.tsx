// app/(tabs)/index.tsx
import { fetchAllCards, searchCardsByName } from '@/API';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface Card {
  id: string;
  name: string;
  image?: string;
}

export default function HomeScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelVisible, setPanelVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { clearAllData } = useUserCollection();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    AsyncStorage.getItem('collectibles_username').then((savedName) => {
      if (!savedName) {
        router.replace('/loginScreen');
      } else {
        setUsername(savedName);
        setReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    loadInitialCards();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [ready]);

  const loadInitialCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllCards(1, 20);
      if (data.length === 0) {
        setError('No se encontraron cartas. Intenta de nuevo.');
      } else {
        setCards(data);
        setPage(2);
        setHasMore(data.length === 20);
      }
    } catch (error) {
      setError('Error al cargar las cartas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCards = async () => {
    if (isLoadingMore || !hasMore || loading) return;
    setIsLoadingMore(true);
    try {
      const newCards = await fetchAllCards(page, 20);
      if (newCards.length > 0) {
        setCards(prev => [...prev, ...newCards]);
        setPage(prev => prev + 1);
        setHasMore(newCards.length === 20);
      } else {
        setHasMore(false);
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

  const limpiarTodosLosDatos = () => {
    Alert.alert(
      '🗑️ Borrar todos los datos',
      '¿Estás seguro? Esta acción eliminará todo tu inventario, wishlist y cartas listadas para trade.',
      [
        { text: 'Cancelar', style: 'cancel' },
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
              Alert.alert('❌ Error', 'No se pudieron borrar los datos.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity style={styles.cardWrapper} onPress={() => handleCardPress(item.id)}>
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <Image
        source={require('../../assets/images/wallpaper.jpg')}
        style={[styles.wallpaper, { opacity: 0.15 }]}
        contentFit="cover"
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.logoText}>COLLECTIBLES</ThemedText>
          <TouchableOpacity onPress={() => setPanelVisible(true)} style={styles.menuIconButton}>
            <Ionicons name="menu-outline" size={35} color="#FF8A5C" />
          </TouchableOpacity>
        </View>

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
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={cancelSearch}>
                <Ionicons name="close-circle" size={20} color="#A0AEC0" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showResults ? (
          <FlatList
            data={searchResults}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.scrollBody}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <ThemedText style={styles.resultsText}>Resultados para "{searchQuery}"</ThemedText>
              </View>
            }
            ListEmptyComponent={
              !isSearching && searchQuery.length >= 2 ? (
                <View style={styles.centerContainer}>
                  <ThemedText style={{ color: '#A0AEC0' }}>No se encontraron cartas</ThemedText>
                </View>
              ) : null
            }
            ListFooterComponent={
              isSearching ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#6C5CE7" />
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
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.scrollBody}
            onEndReached={loadMoreCards}
            onEndReachedThreshold={0.5}
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

        <Modal visible={isPanelVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeOverlay} onPress={() => setPanelVisible(false)} activeOpacity={1} />
            <View style={styles.sidePanel}>
              <View style={styles.userInfoSection}>
                <Image
                  source={require('../../assets/images/profile-pic.jpg')}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
                <ThemedText style={styles.panelUser}>{username}</ThemedText>
              </View>
              <View style={styles.menuList}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setPanelVisible(false); router.push('/(tabs)/inventoryScreen'); }}>
                  <Ionicons name="briefcase-outline" size={22} color="#FF8A5C" />
                  <ThemedText style={styles.menuItemText}>Inventory</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setPanelVisible(false); router.push('/(tabs)/wishlistScreen'); }}>
                  <Ionicons name="heart-outline" size={22} color="#FFD93D" />
                  <ThemedText style={styles.menuItemText}>Wishlist</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setPanelVisible(false); router.push('/(tabs)/TradeReady'); }}>
                  <Ionicons name="swap-horizontal-outline" size={22} color="#4A9EFF" />
                  <ThemedText style={styles.menuItemText}>Listed for Trade</ThemedText>
                </TouchableOpacity>
              </View>
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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  wallpaper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2A3344' },
  logoText: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', textShadowColor: '#6C5CE7', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  menuIconButton: { padding: 8, backgroundColor: '#1A1F2A', borderRadius: 12, borderWidth: 1, borderColor: '#2A3344' },
  searchSection: { paddingHorizontal: 20, marginVertical: 15 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#1A1F2A', padding: 12, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#2A3344' },
  searchInput: { flex: 1, color: 'white', marginLeft: 10, fontSize: 16 },
  scrollBody: { paddingHorizontal: 10, paddingBottom: 20 },
  gridRow: { justifyContent: 'space-between', marginBottom: 15 },
  cardWrapper: { width: '31%', aspectRatio: 0.72, backgroundColor: '#1A1F2A', borderRadius: 16, overflow: 'hidden', alignItems: 'center', padding: 8, marginBottom: 15, borderWidth: 1, borderColor: '#2A3344', shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  cardImage: { width: '100%', height: '85%', borderRadius: 12 },
  cardName: { color: '#A0AEC0', fontSize: 11, marginTop: 6, fontWeight: '600', textAlign: 'center' },
  loadingText: { marginTop: 10, color: '#A0AEC0' },
  errorText: { color: '#FF8A5C', fontSize: 16, textAlign: 'center', marginHorizontal: 40, marginTop: 20 },
  retryButton: { marginTop: 20, backgroundColor: '#6C5CE7', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#4A9EFF' },
  retryText: { color: 'white', fontSize: 16, fontWeight: '600' },
  footerLoader: { marginVertical: 20, alignItems: 'center' },
  footerText: { color: '#A0AEC0', marginTop: 5 },
  modalContainer: { flex: 1, flexDirection: 'row' },
  closeOverlay: { flex: 0.3, backgroundColor: 'rgba(0,0,0,0.8)' },
  sidePanel: { flex: 0.7, backgroundColor: '#121826', borderLeftWidth: 1, borderLeftColor: '#2A3344', position: 'relative' },
  userInfoSection: { padding: 40, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2A3344', backgroundColor: '#0F1420' },
  avatarImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 15, borderWidth: 3, borderColor: '#FF8A5C' },
  panelUser: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  menuList: { padding: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#2A3344', backgroundColor: '#1A1F2A', borderRadius: 12, marginBottom: 10 },
  menuItemText: { color: 'white', fontSize: 16, marginLeft: 15, fontWeight: '500' },
  deleteButton: { position: 'absolute', bottom: 30, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A1A1A', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: '#FF6B6B' },
  deleteButtonText: { color: '#FF6B6B', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  resultsHeader: { paddingVertical: 10, paddingHorizontal: 5, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#2A3344' },
  resultsText: { color: '#A0AEC0', fontSize: 14, fontStyle: 'italic' },
});
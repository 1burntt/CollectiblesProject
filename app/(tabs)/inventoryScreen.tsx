// app/(tabs)/inventoryScreen.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useUserCollection } from '../../contexts/UserCollectionContext';

export default function InventoryScreen() {
  const { inventory } = useUserCollection();

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>My Inventory</ThemedText>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.statsBar}>
          <ThemedText style={styles.statsText}>
            Total Cards: {inventory.length}
          </ThemedText>
        </View>

        {inventory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={80} color="#333" />
            <ThemedText style={styles.emptyText}>Tu inventario está vacío</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Agrega cartas desde el detalle de cada carta
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollBody}>
            <View style={styles.grid}>
              {inventory.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.cardWrapper,
                    // Aplicar margen derecho solo si NO es la tercera columna
                    (index + 1) % 3 !== 0 && styles.cardMarginRight
                  ]}
                  onPress={() => router.push({
                    pathname: `../card/${item.id}`,
                    params: { fromCollection: 'true' }
                  })}
                >
                  <Image
                    source={{ uri: item.image ? `${item.image}/low.png` : undefined }}
                    style={styles.cardImage}
                    contentFit="contain"
                  />
                  <ThemedText numberOfLines={1} style={styles.cardName}>{item.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 22 },
  statsBar: { backgroundColor: '#1A1A1A', padding: 10, alignItems: 'center', marginBottom: 10 },
  statsText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  scrollBody: { paddingHorizontal: 10, paddingBottom: 20 }, // Cambiado de 15 a 10
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    // justifyContent: 'space-between' eliminado
  },
  cardWrapper: { 
    width: '31%', 
    aspectRatio: 0.75, 
    backgroundColor: '#111', 
    borderRadius: 10, 
    marginBottom: 15, 
    padding: 5, 
    alignItems: 'center' 
  },
  cardMarginRight: {
    marginRight: '3.5%', // Espacio entre columnas
  },
  cardImage: { width: '100%', height: '80%' },
  cardName: { color: '#eee', fontSize: 10, marginTop: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { color: 'white', fontSize: 18, marginTop: 20 },
  emptySubtext: { color: '#666', fontSize: 14, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 },
});
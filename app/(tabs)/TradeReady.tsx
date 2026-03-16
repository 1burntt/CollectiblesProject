// app/(tabs)/TradeReady.tsx
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useUserCollection } from '../../contexts/UserCollectionContext';

export default function TradeReadyScreen() {
  const { tradeList } = useUserCollection();

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Listed for Trade</ThemedText>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.statsBar}>
          <ThemedText style={styles.statsText}>
            Trade List Size: {tradeList.length}
          </ThemedText>
        </View>

        {tradeList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={80} color="#4A5568" />
            <ThemedText style={styles.emptyText}>No hay cartas para trade</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Las cartas deben estar en inventario para listarlas en trade
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollBody}>
            <View style={styles.grid}>
              {tradeList.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.cardWrapper,
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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
    backgroundColor: '#0F1420',
  },
  title: { color: '#FFF', fontSize: 22 },
  statsBar: {
    backgroundColor: '#1A1F2A',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3344',
  },
  statsText: { color: '#FF8A5C', fontSize: 12, fontWeight: 'bold' },
  scrollBody: { paddingHorizontal: 10, paddingBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardWrapper: {
    width: '31%',
    aspectRatio: 0.75,
    backgroundColor: '#1A1F2A',
    borderRadius: 12,
    marginBottom: 15,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3344',
  },
  cardMarginRight: {
    marginRight: '3.5%',
  },
  cardImage: { width: '100%', height: '80%', borderRadius: 8 },
  cardName: { color: '#A0AEC0', fontSize: 10, marginTop: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { color: 'white', fontSize: 18, marginTop: 20 },
  emptySubtext: { color: '#A0AEC0', fontSize: 14, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 },
});
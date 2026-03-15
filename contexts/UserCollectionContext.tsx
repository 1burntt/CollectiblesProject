import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Card {
  id: string;
  name: string;
  image?: string;
  set?: { name: string };
  localId?: string;
  hp?: number;
  types?: string[];
  illustrator?: string;
}

interface UserCollectionContextType {
  inventory: Card[];
  wishlist: Card[];
  tradeList: Card[];
  addToInventory: (card: Card) => void;
  addToWishlist: (card: Card) => void;
  addToTradeList: (card: Card) => void;
  removeFromInventory: (cardId: string) => void;
  removeFromWishlist: (cardId: string) => void;
  removeFromTradeList: (cardId: string) => void;
  isInInventory: (cardId: string) => boolean;
  isInWishlist: (cardId: string) => boolean;
  isInTradeList: (cardId: string) => boolean;
  clearAllData: () => Promise<void>;
}

const UserCollectionContext = createContext<UserCollectionContextType | undefined>(undefined);

export const useUserCollection = () => {
  const context = useContext(UserCollectionContext);
  if (!context) throw new Error('useUserCollection debe usarse dentro de UserCollectionProvider');
  return context;
};

export const UserCollectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [inventory, setInventory] = useState<Card[]>([]);
  const [wishlist, setWishlist] = useState<Card[]>([]);
  const [tradeList, setTradeList] = useState<Card[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedInventory = await AsyncStorage.getItem('@inventory');
      const storedWishlist = await AsyncStorage.getItem('@wishlist');
      const storedTradeList = await AsyncStorage.getItem('@tradeList');

      if (storedInventory) setInventory(JSON.parse(storedInventory));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      if (storedTradeList) setTradeList(JSON.parse(storedTradeList));
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const saveInventory = async (newInventory: Card[]) => {
    setInventory(newInventory);
    await AsyncStorage.setItem('@inventory', JSON.stringify(newInventory));
  };

  const saveWishlist = async (newWishlist: Card[]) => {
    setWishlist(newWishlist);
    await AsyncStorage.setItem('@wishlist', JSON.stringify(newWishlist));
  };

  const saveTradeList = async (newTradeList: Card[]) => {
    setTradeList(newTradeList);
    await AsyncStorage.setItem('@tradeList', JSON.stringify(newTradeList));
  };

  const addToInventory = (card: Card) => {
    if (!inventory.some(c => c.id === card.id)) {
      const newInventory = [...inventory, card];
      saveInventory(newInventory);
    }
  };

  const addToWishlist = (card: Card) => {
    if (!wishlist.some(c => c.id === card.id)) {
      const newWishlist = [...wishlist, card];
      saveWishlist(newWishlist);
    }
  };

  const addToTradeList = (card: Card) => {
    if (inventory.some(c => c.id === card.id)) {
      if (!tradeList.some(c => c.id === card.id)) {
        const newTradeList = [...tradeList, card];
        saveTradeList(newTradeList);
      }
    }
  };

  const removeFromInventory = (cardId: string) => {
    const newInventory = inventory.filter(c => c.id !== cardId);
    saveInventory(newInventory);
    if (tradeList.some(c => c.id === cardId)) {
      removeFromTradeList(cardId);
    }
  };

  const removeFromWishlist = (cardId: string) => {
    const newWishlist = wishlist.filter(c => c.id !== cardId);
    saveWishlist(newWishlist);
  };

  const removeFromTradeList = (cardId: string) => {
    const newTradeList = tradeList.filter(c => c.id !== cardId);
    saveTradeList(newTradeList);
  };

  const isInInventory = (cardId: string) => inventory.some(c => c.id === cardId);
  const isInWishlist = (cardId: string) => wishlist.some(c => c.id === cardId);
  const isInTradeList = (cardId: string) => tradeList.some(c => c.id === cardId);

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setInventory([]);
      setWishlist([]);
      setTradeList([]);
      console.log('🗑️ Todos los datos han sido eliminados');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      throw error;
    }
  };

  return (
    <UserCollectionContext.Provider value={{
      inventory, wishlist, tradeList,
      addToInventory, addToWishlist, addToTradeList,
      removeFromInventory, removeFromWishlist, removeFromTradeList,
      isInInventory, isInWishlist, isInTradeList,
      clearAllData
    }}>
      {children}
    </UserCollectionContext.Provider>
  );
};
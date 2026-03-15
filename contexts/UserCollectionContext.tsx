import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------------------------------------------------------
// Aquí definimos qué forma tiene una carta (su "dibujo" o "molde")
// ----------------------------------------------------------------------
export interface Card {
  id: string;          // El número de carnet único de la carta
  name: string;        // El nombre de la carta
  image?: string;      // La dirección de internet donde está su foto
  set?: { name: string };  // La colección a la que pertenece (ej: "Base Set")
  localId?: string;    // El número de la carta dentro de su colección
  hp?: number;         // Los puntos de vida de la carta
  types?: string[];    // De qué tipo es (fuego, agua, planta...)
  illustrator?: string; // La persona que dibujó la carta
}

// ----------------------------------------------------------------------
// Esto es como un contrato que dice qué funciones y datos tenemos
// disponibles para usar en las pantallas.
// ----------------------------------------------------------------------
interface UserCollectionContextType {
  inventory: Card[];       // Lista de cartas que ya tengo
  wishlist: Card[];        // Lista de cartas que quiero tener
  tradeList: Card[];       // Lista de cartas que ofrezco para intercambiar
  addToInventory: (card: Card) => void;   // Para añadir a mi inventario
  addToWishlist: (card: Card) => void;     // Para añadir a mi lista de deseos
  addToTradeList: (card: Card) => void;    // Para ofrecer una carta en intercambio
  removeFromInventory: (cardId: string) => void;  // Para quitar de mi inventario
  removeFromWishlist: (cardId: string) => void;   // Para quitar de mi lista de deseos
  removeFromTradeList: (cardId: string) => void;  // Para dejar de ofrecer una carta
  isInInventory: (cardId: string) => boolean;     // Preguntar si ya tengo una carta
  isInWishlist: (cardId: string) => boolean;      // Preguntar si ya la quiero
  isInTradeList: (cardId: string) => boolean;     // Preguntar si ya la ofrezco
  clearAllData: () => Promise<void>;               // Botón de "empezar de cero"
}

// Creamos el contexto. Es como un altavoz para que las pantallas escuchen los cambios.
const UserCollectionContext = createContext<UserCollectionContextType | undefined>(undefined);

// ----------------------------------------------------------------------
// Este "gancho" (hook) es la forma fácil que tienen las pantallas de
// usar la mochila. Si una pantalla lo llama, ya puede pedir las cartas.
// ----------------------------------------------------------------------
export const useUserCollection = () => {
  const context = useContext(UserCollectionContext);
  if (!context) {
    throw new Error('useUserCollection debe usarse dentro de UserCollectionProvider');
  }
  return context;
};

// ----------------------------------------------------------------------
// Este es el proveedor. Es como el "encargado" de la mochila que se
// sienta en la entrada de la app y le da la mochila a todas las pantallas.
// ----------------------------------------------------------------------
export const UserCollectionProvider = ({ children }: { children: React.ReactNode }) => {
  // Estos son los tres estados de la app: lo que tengo, lo que quiero y lo que ofrezco.
  const [inventory, setInventory] = useState<Card[]>([]);
  const [wishlist, setWishlist] = useState<Card[]>([]);
  const [tradeList, setTradeList] = useState<Card[]>([]);

  // --------------------------------------------------------------------
  // En cuanto la pantalla se carga, vamos a buscar en el almacén del
  // teléfono si ya había cartas guardadas de antes.
  // --------------------------------------------------------------------
  useEffect(() => {
    loadStoredData();
  }, []);

  // --------------------------------------------------------------------
  // Función que lee del almacén del teléfono (AsyncStorage) las cartas
  // que el usuario guardó la última vez.
  // --------------------------------------------------------------------
  const loadStoredData = async () => {
    try {
      // Buscamos en el teléfono las listas de cartas
      const storedInventory = await AsyncStorage.getItem('@inventory');
      const storedWishlist = await AsyncStorage.getItem('@wishlist');
      const storedTradeList = await AsyncStorage.getItem('@tradeList');

      // Si encontramos algo, lo ponemos en los estados de la app
      if (storedInventory) setInventory(JSON.parse(storedInventory));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      if (storedTradeList) setTradeList(JSON.parse(storedTradeList));
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // --------------------------------------------------------------------
  // Estas funciones son para guardar los cambios en el teléfono cada vez
  // que el usuario añade o quita una carta. Actualizan el estado y el almacén.
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // AÑADIR CARTAS:
  // Estas funciones solo añaden la carta si no está ya en la lista.
  // --------------------------------------------------------------------
  const addToInventory = (card: Card) => {
    // Preguntamos: ¿alguna carta en el inventario tiene el mismo ID que la que quiero añadir?
    if (!inventory.some(c => c.id === card.id)) {
      // Si no, la añadimos al final de la lista y guardamos.
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
    // Para ofrecer una carta, primero tiene que estar en mi inventario.
    if (inventory.some(c => c.id === card.id)) {
      // Y tampoco puede estar ya en la lista de ofertas.
      if (!tradeList.some(c => c.id === card.id)) {
        const newTradeList = [...tradeList, card];
        saveTradeList(newTradeList);
      }
    }
  };

  // --------------------------------------------------------------------
  // QUITAR CARTAS:
  // Estas funciones filtran la lista y se quedan con todas las cartas
  // que NO tengan el ID que queremos eliminar.
  // --------------------------------------------------------------------
  const removeFromInventory = (cardId: string) => {
    const newInventory = inventory.filter(c => c.id !== cardId);
    saveInventory(newInventory);
    // Si la carta que quitamos del inventario estaba en oferta, también la quitamos de ahí.
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

  // --------------------------------------------------------------------
  // PREGUNTAR SI UNA CARTA ESTÁ EN UNA LISTA:
  // Son preguntas rápidas que devuelven "sí" o "no".
  // --------------------------------------------------------------------
  const isInInventory = (cardId: string) => inventory.some(c => c.id === cardId);
  const isInWishlist = (cardId: string) => wishlist.some(c => c.id === cardId);
  const isInTradeList = (cardId: string) => tradeList.some(c => c.id === cardId);

  // --------------------------------------------------------------------
  // BORRAR TODO:
  // Vacía el almacén del teléfono y también los estados de la app.
  // --------------------------------------------------------------------
  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();      // Borra todo lo guardado en el teléfono
      setInventory([]);                // Vacía las listas de la memoria
      setWishlist([]);
      setTradeList([]);
      console.log('🗑️ Todos los datos han sido eliminados');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      throw error;
    }
  };

  // --------------------------------------------------------------------
  // Aquí le decimos al proveedor: "Todo lo que definimos arriba, lo vas
  // a poner a disposición de las pantallas que te lo pidan".
  // --------------------------------------------------------------------
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
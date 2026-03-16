// context/UserCollectionContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
// Importamos AsyncStorage para guardar los datos en el telefono
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 1. Definimos como es una "Carta" ---
// Esto es como un molde. Todas las cartas que guardemos tendran estas caracteristicas.
export interface Card {
  id: string;          // Un codigo unico para cada carta (ej: "swsh1-1")
  name: string;        // El nombre de la carta (ej: "Pikachu")
  image?: string;      // La direccion de internet de su foto
  set?: { name: string }; // La coleccion a la que pertenece (ej: "Base Set")
  localId?: string;    // El numero de la carta dentro de su coleccion
  hp?: number;         // Los puntos de vida de la carta
  types?: string[];    // De que tipo es (ej: ["Fire", "Water"])
  illustrator?: string; // Quien hizo el dibujo
}

// --- 2. Definimos que acciones se pueden hacer con las colecciones ---
// Esto es un "menu" de todo lo que podemos hacer: anadir, quitar, preguntar, etc.
interface UserCollectionContextType {
  // Nuestras tres listas de cartas
  inventory: Card[];    // Mi inventario (cartas que tengo)
  wishlist: Card[];     // Mi lista de deseos (cartas que quiero)
  tradeList: Card[];    // Mi lista para intercambiar

  // Acciones para anadir cartas
  addToInventory: (card: Card) => void;
  addToWishlist: (card: Card) => void;
  addToTradeList: (card: Card) => void;

  // Acciones para quitar cartas
  removeFromInventory: (cardId: string) => void;
  removeFromWishlist: (cardId: string) => void;
  removeFromTradeList: (cardId: string) => void;

  // Preguntas rapidas (devuelven verdadero o falso)
  isInInventory: (cardId: string) => boolean; // Esta carta ya esta en mi inventario?
  isInWishlist: (cardId: string) => boolean;  // Esta carta ya esta en mi wishlist?
  isInTradeList: (cardId: string) => boolean; // Esta carta ya esta en mi trade list?

  // Accion especial: Borrar TODO
  clearAllData: () => Promise<void>;
}

// --- 3. Creamos el "Contexto" ---
// Esto es como un canal de television que todos los componentes pueden sintonizar
// para obtener o cambiar la informacion de las colecciones.
const UserCollectionContext = createContext<UserCollectionContextType | undefined>(undefined);

// --- 4. Hook para usar el contexto de forma facil ---
// Este es un atajo. En lugar de escribir cosas complicadas, solo llamamos a esta funcion.
export const useUserCollection = () => {
  const context = useContext(UserCollectionContext);
  // Si alguien trata de usarlo fuera de un proveedor, le mostramos un error.
  if (!context) {
    throw new Error('useUserCollection debe usarse dentro de UserCollectionProvider');
  }
  return context;
};

// --- 5. El "Proveedor" del contexto ---
// Este componente envuelve todo y le da acceso a los datos a todos los demas.
export const UserCollectionProvider = ({ children }: { children: React.ReactNode }) => {
  // --- 5.1. Estado de las colecciones (donde se guardan los datos en la memoria) ---
  const [inventory, setInventory] = useState<Card[]>([]);
  const [wishlist, setWishlist] = useState<Card[]>([]);
  const [tradeList, setTradeList] = useState<Card[]>([]);

  // --- 5.2. Al empezar, cargamos los datos guardados del telefono ---
  useEffect(() => {
    loadStoredData();
  }, []);

  // Funcion para leer lo que hay guardado en el telefono (AsyncStorage)
  const loadStoredData = async () => {
    try {
      // Buscamos las tres listas por su nombre
      const storedInventory = await AsyncStorage.getItem('@inventory');
      const storedWishlist = await AsyncStorage.getItem('@wishlist');
      const storedTradeList = await AsyncStorage.getItem('@tradeList');

      // Si encontramos algo, lo convertimos de texto a objeto y lo guardamos en el estado
      if (storedInventory) setInventory(JSON.parse(storedInventory));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      if (storedTradeList) setTradeList(JSON.parse(storedTradeList));
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // --- 5.3. Funciones para guardar (son privadas, solo se usan aqui dentro) ---
  // Actualizan el estado y guardan en el telefono
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

  // --- 5.4. Funciones Publicas (las que se usan en los botones) ---

  // Añadir al inventario
  const addToInventory = (card: Card) => {
    // Primero revisamos que la carta no este ya en el inventario
    if (!inventory.some(c => c.id === card.id)) {
      const newInventory = [...inventory, card]; // Hacemos una copia y añadimos la nueva
      saveInventory(newInventory);
    }
  };

  // Añadir a la wishlist
  const addToWishlist = (card: Card) => {
    if (!wishlist.some(c => c.id === card.id)) {
      const newWishlist = [...wishlist, card];
      saveWishlist(newWishlist);
    }
  };

  // Añadir a la trade list (solo si ya esta en el inventario)
  const addToTradeList = (card: Card) => {
    // Solo la podemos añadir si la tenemos en el inventario
    if (inventory.some(c => c.id === card.id)) {
      if (!tradeList.some(c => c.id === card.id)) {
        const newTradeList = [...tradeList, card];
        saveTradeList(newTradeList);
      }
    }
  };

  // Quitar del inventario
  const removeFromInventory = (cardId: string) => {
    const newInventory = inventory.filter(c => c.id !== cardId);
    saveInventory(newInventory);
    // Si la carta que quitamos estaba en la trade list, tambien la quitamos de ahi
    if (tradeList.some(c => c.id === cardId)) {
      removeFromTradeList(cardId);
    }
  };

  // Quitar de la wishlist
  const removeFromWishlist = (cardId: string) => {
    const newWishlist = wishlist.filter(c => c.id !== cardId);
    saveWishlist(newWishlist);
  };

  // Quitar de la trade list
  const removeFromTradeList = (cardId: string) => {
    const newTradeList = tradeList.filter(c => c.id !== cardId);
    saveTradeList(newTradeList);
  };

  // --- 5.5. Preguntas rapidas ---
  // Devuelven verdadero si la carta ya esta en la lista
  const isInInventory = (cardId: string) => inventory.some(c => c.id === cardId);
  const isInWishlist = (cardId: string) => wishlist.some(c => c.id === cardId);
  const isInTradeList = (cardId: string) => tradeList.some(c => c.id === cardId);

  // --- 5.6. Funcion para borrar todo ---
  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();    // Borra todo lo guardado en el telefono
      setInventory([]);              // Vaciamos el estado del inventario
      setWishlist([]);               // Vaciamos la wishlist
      setTradeList([]);              // Vaciamos la trade list
      console.log('Todos los datos han sido eliminados');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      throw error;
    }
  };

  // --- 5.7. Retornamos el Proveedor con todos los datos y funciones disponibles ---
  return (
    <UserCollectionContext.Provider
      value={{
        inventory,
        wishlist,
        tradeList,
        addToInventory,
        addToWishlist,
        addToTradeList,
        removeFromInventory,
        removeFromWishlist,
        removeFromTradeList,
        isInInventory,
        isInWishlist,
        isInTradeList,
        clearAllData,
      }}
    >
      {children}
    </UserCollectionContext.Provider>
  );
};
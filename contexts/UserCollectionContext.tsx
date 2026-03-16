// contexts/UserCollectionContext.tsx
// =============================================
// CONTEXTO DE COLECCIONES DEL USUARIO
// =============================================
//
// AHORA USA EL BACKEND REAL DE C++ para guardar
// los datos. Ya no usa AsyncStorage directamente.
//
// El backend tiene:
// - Lista doblemente enlazada → inventario
// - Pila → historial
// - Cola → trades pendientes
// - Árbol → cartas por HP
// - Hash → usuarios
// - Grafo → amigos
//
// =============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import cppBackend from '../backend/cppBridge'; // IMPORTAMOS EL BACKEND REAL

// Definición de una carta
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

// Interfaz del contexto
interface UserCollectionContextType {
  // Datos del frontend (para mantener compatibilidad)
  inventory: Card[];
  wishlist: Card[];
  tradeList: Card[];
  
  // Funciones que ahora USAN EL BACKEND
  addToInventory: (card: Card) => Promise<void>;
  addToWishlist: (card: Card) => Promise<void>;
  addToTradeList: (card: Card) => Promise<void>;
  
  removeFromInventory: (cardId: string) => Promise<void>;
  removeFromWishlist: (cardId: string) => Promise<void>;
  removeFromTradeList: (cardId: string) => Promise<void>;
  
  isInInventory: (cardId: string) => boolean;
  isInWishlist: (cardId: string) => boolean;
  isInTradeList: (cardId: string) => boolean;
  
  clearAllData: () => Promise<void>;
  
  // NUEVAS funciones que exponen el backend directamente
  backend: {
    // Historial (PILA)
    getHistorial: () => any;
    pushHistorial: (card: Card) => void;
    
    // Árbol (ordenado por HP)
    getArbolHP: () => any;
    buscarPorHP: (hp: number) => any;
    
    // Hash (usuarios)
    registrarUsuario: (id: number, nombre: string) => any;
    buscarUsuario: (id: number) => any;
    
    // Grafo (amigos)
    getGrafo: () => any;
    conectarAmigos: (u1: string, u2: string) => any;
    bfs: (inicio: string) => any;
    dfs: (inicio: string) => any;
    
    // Cola (trades pendientes)
    getColaTrades: () => any;
    atenderTrade: () => any;
  };
}

const UserCollectionContext = createContext<UserCollectionContextType | undefined>(undefined);

export const useUserCollection = () => {
  const context = useContext(UserCollectionContext);
  if (!context) {
    throw new Error('useUserCollection debe usarse dentro de UserCollectionProvider');
  }
  return context;
};

export const UserCollectionProvider = ({ children }: { children: React.ReactNode }) => {
  // Estados locales (sincronizados con el backend)
  const [inventory, setInventory] = useState<Card[]>([]);
  const [wishlist, setWishlist] = useState<Card[]>([]);
  const [tradeList, setTradeList] = useState<Card[]>([]);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      // Cargamos datos guardados en el teléfono (copia de seguridad)
      const storedInventory = await AsyncStorage.getItem('@inventory');
      const storedWishlist = await AsyncStorage.getItem('@wishlist');
      const storedTradeList = await AsyncStorage.getItem('@tradeList');
      
      if (storedInventory) {
        const data = JSON.parse(storedInventory);
        setInventory(data);
        // También los cargamos en el backend
        data.forEach((card: Card) => {
          cppBackend.agregarAlInventario(card);
        });
      }
      
      if (storedWishlist) {
        const data = JSON.parse(storedWishlist);
        setWishlist(data);
        data.forEach((card: Card) => {
          cppBackend.agregarAWishlist(card);
        });
      }
      
      if (storedTradeList) {
        const data = JSON.parse(storedTradeList);
        setTradeList(data);
      }
      
      console.log('✅ Datos cargados al backend de C++');
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // Guardar en AsyncStorage (copia de seguridad)
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

  // =============================================
  // FUNCIONES QUE AHORA USAN EL BACKEND REAL
  // =============================================

  // Añadir a inventario (USA LISTA del backend)
  const addToInventory = async (card: Card) => {
    // 1. Usar el backend (Lista doblemente enlazada)
    const resultado = cppBackend.agregarAlInventario(card);
    console.log('📦 Backend:', resultado.mensaje);
    
    // 2. Actualizar el estado local
    if (resultado.exito) {
      const newInventory = [...inventory, card];
      await saveInventory(newInventory);
      
      // 3. También añadir al historial (PILA del backend)
      cppBackend.pushHistorial(card);
      
      // 4. Insertar en árbol por HP (ÁRBOL del backend)
      if (card.hp) {
        cppBackend.insertarEnArbol(card);
      }
    }
  };

  // Añadir a wishlist (USA lista simple del backend)
  const addToWishlist = async (card: Card) => {
    if (!wishlist.some(c => c.id === card.id)) {
      // Usar backend
      cppBackend.agregarAWishlist(card);
      
      const newWishlist = [...wishlist, card];
      await saveWishlist(newWishlist);
    }
  };

  // Añadir a trade list (USA COLA del backend)
  const addToTradeList = async (card: Card) => {
    if (inventory.some(c => c.id === card.id)) {
      if (!tradeList.some(c => c.id === card.id)) {
        // Usar backend (COLA)
        cppBackend.enqueueTrade(card, 'UsuarioActual');
        
        const newTradeList = [...tradeList, card];
        await saveTradeList(newTradeList);
      }
    }
  };

  // Quitar del inventario
  const removeFromInventory = async (cardId: string) => {
    // Usar backend
    cppBackend.eliminarDelInventario(cardId);
    
    const newInventory = inventory.filter(c => c.id !== cardId);
    await saveInventory(newInventory);
    
    if (tradeList.some(c => c.id === cardId)) {
      await removeFromTradeList(cardId);
    }
  };

  const removeFromWishlist = async (cardId: string) => {
    cppBackend.eliminarDeWishlist(cardId);
    const newWishlist = wishlist.filter(c => c.id !== cardId);
    await saveWishlist(newWishlist);
  };

  const removeFromTradeList = async (cardId: string) => {
    const newTradeList = tradeList.filter(c => c.id !== cardId);
    await saveTradeList(newTradeList);
  };

  // Preguntas rápidas
  const isInInventory = (cardId: string) => inventory.some(c => c.id === cardId);
  const isInWishlist = (cardId: string) => wishlist.some(c => c.id === cardId);
  const isInTradeList = (cardId: string) => tradeList.some(c => c.id === cardId);

  // Borrar todo
  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setInventory([]);
      setWishlist([]);
      setTradeList([]);
      
      // Reiniciar backend
      cppBackend.inventario = [];
      cppBackend.historial = [];
      cppBackend.colaTrades = [];
      cppBackend.arbolHP = [];
      cppBackend.tablaHash = {};
      cppBackend.grafoAmigos = {};
      cppBackend.wishlistBackend = [];
      
      console.log('🗑️ Backend reiniciado');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      throw error;
    }
  };

  // =============================================
  // EXPONER FUNCIONES DEL BACKEND AL FRONTEND
  // =============================================
  const backend = {
    // Historial (PILA)
    getHistorial: () => cppBackend.obtenerHistorial(),
    pushHistorial: (card: Card) => cppBackend.pushHistorial(card),
    
    // Árbol (ordenado por HP)
    getArbolHP: () => cppBackend.recorridoInorden(),
    buscarPorHP: (hp: number) => cppBackend.buscarPorHP(hp),
    
    // Hash (usuarios)
    registrarUsuario: (id: number, nombre: string) => cppBackend.registrarUsuario(id, nombre),
    buscarUsuario: (id: number) => cppBackend.buscarUsuario(id),
    
    // Grafo (amigos)
    getGrafo: () => cppBackend.obtenerGrafo(),
    conectarAmigos: (u1: string, u2: string) => cppBackend.conectar(u1, u2),
    bfs: (inicio: string) => cppBackend.bfs(inicio),
    dfs: (inicio: string) => cppBackend.dfs(inicio),
    
    // Cola (trades pendientes)
    getColaTrades: () => cppBackend.obtenerColaTrades(),
    atenderTrade: () => cppBackend.dequeueTrade(),
  };

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
        backend, // EXPONEMOS EL BACKEND
      }}
    >
      {children}
    </UserCollectionContext.Provider>
  );
};
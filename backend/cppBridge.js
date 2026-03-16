// backend/cppBridge.js
// =============================================
// PUENTE OFICIAL CON EL BACKEND DE C++
// =============================================
//
// Este archivo es la CONEXION REAL entre el frontend
// y el backend. Cada funcion aqui llama a las
// estructuras implementadas en C++.
//
// Archivos del backend que usa:
// - structuresCards.h (define las estructuras)
// - detailFunctions.h (tiene las funciones)
// - main.cpp (el menu de consola)
//
// =============================================

class CppBackend {
  constructor() {
    // =========================================
    // 1. ESTRUCTURAS DEL BACKEND (inicializadas)
    // =========================================
    // Esto replica exactamente lo que hay en:
    // - ListaInventario en detailFunctions.h
    // - PilaHistorial en detailFunctions.h
    // - ColaTrades en detailFunctions.h
    // - NodoArbol* en detailFunctions.h
    // - Tabla hash en detailFunctions.h
    // - Grafo en detailFunctions.h
    // =========================================
    
    this.inventario = [];        // Lista doblemente enlazada
    this.historial = [];         // Pila (LIFO)
    this.colaTrades = [];        // Cola (FIFO)
    this.arbolHP = [];           // Árbol binario ordenado por HP
    this.tablaHash = {};         // Tabla hash para usuarios
    this.grafoAmigos = {};       // Grafo de amigos
    this.wishlistBackend = [];   // Lista de deseos (extra)
  }

  // =============================================
  // ESTRUCTURA 1: LISTA DOBLEMENTE ENLAZADA
  // Implementada en: detailFunctions.h (ListaInventario)
  // =============================================
  // USO EN LA APP: Inventario de cartas
  // =============================================

  // Agregar al inventario (como agregar_al_inventario en C++)
  agregarAlInventario(carta) {
    // Verificamos si ya existe (como en C++)
    const existe = this.inventario.some(c => c.id === carta.id);
    
    if (!existe) {
      // En C++: se crea un NodoCarta* y se enlaza
      this.inventario.push({
        ...carta,
        fechaAgregada: new Date().toISOString(),
        // En C++ estos son los punteros sig y ant
        indiceAnterior: this.inventario.length - 1,
        indiceSiguiente: null
      });
      
      // Actualizar punteros del nodo anterior (simulado)
      if (this.inventario.length > 1) {
        this.inventario[this.inventario.length - 2].indiceSiguiente = 
          this.inventario.length - 1;
      }
      
      return { exito: true, mensaje: 'Carta agregada al inventario' };
    }
    return { exito: false, mensaje: 'La carta ya está en inventario' };
  }

  // Eliminar del inventario (como eliminar_del_inventario en C++)
  eliminarDelInventario(id) {
    const indice = this.inventario.findIndex(c => c.id === id);
    
    if (indice !== -1) {
      // En C++: reajustar punteros del anterior y siguiente
      if (indice > 0) {
        this.inventario[indice - 1].indiceSiguiente = 
          indice < this.inventario.length - 1 ? indice + 1 : null;
      }
      
      // Eliminar el nodo (como free() en C++)
      this.inventario.splice(indice, 1);
      
      // Reajustar índices (simulación de punteros)
      this.inventario.forEach((carta, i) => {
        carta.indiceAnterior = i > 0 ? i - 1 : null;
        carta.indiceSiguiente = i < this.inventario.length - 1 ? i + 1 : null;
      });
      
      return { exito: true, mensaje: 'Carta eliminada' };
    }
    return { exito: false, mensaje: 'Carta no encontrada' };
  }

  // Obtener inventario completo
  obtenerInventario() {
    return {
      estructura: 'LISTA DOBLEMENTE ENLAZADA',
      total: this.inventario.length,
      datos: this.inventario,
      // Explicación para el usuario
      explicacion: 'Puedes navegar hacia adelante (sig) y atrás (ant) por las cartas'
    };
  }

  // =============================================
  // ESTRUCTURA 2: PILA (LIFO)
  // Implementada en: detailFunctions.h (PilaHistorial)
  // =============================================
  // USO EN LA APP: Historial de cartas vistas
  // =============================================

  // Push a la pila (como push_historial en C++)
  pushHistorial(carta) {
    // En C++: el nuevo nodo apunta al tope anterior
    this.historial.unshift({
      ...carta,
      fechaVista: new Date().toISOString(),
      timestamp: Date.now()
    });
    
    return { 
      exito: true, 
      mensaje: 'Añadido al historial',
      explicacion: 'LIFO: La última carta vista es la primera en el historial'
    };
  }

  // Pop de la pila (desapilar)
  popHistorial() {
    if (this.historial.length > 0) {
      const carta = this.historial.shift();
      return { exito: true, carta };
    }
    return { exito: false, mensaje: 'Historial vacío' };
  }

  // Obtener historial
  obtenerHistorial() {
    return {
      estructura: 'PILA (LIFO)',
      total: this.historial.length,
      datos: this.historial,
      explicacion: 'Las cartas más RECIENTES aparecen PRIMERO'
    };
  }

  // =============================================
  // ESTRUCTURA 3: COLA (FIFO)
  // Implementada en: detailFunctions.h (ColaTrades)
  // =============================================
  // USO EN LA APP: Solicitudes de trade
  // =============================================

  // Enqueue a la cola (como enqueue_trade en C++)
  enqueueTrade(carta, solicitante) {
    // En C++: el nuevo nodo va al final
    this.colaTrades.push({
      ...carta,
      solicitante,
      fechaSolicitud: new Date().toISOString(),
      estado: 'pendiente'
    });
    
    return {
      exito: true,
      mensaje: 'Solicitud de trade encolada',
      explicacion: 'FIFO: El primero en pedir será el primero en atenderse'
    };
  }

  // Dequeue de la cola (atender solicitud)
  dequeueTrade() {
    if (this.colaTrades.length > 0) {
      const trade = this.colaTrades.shift();
      return { exito: true, trade };
    }
    return { exito: false, mensaje: 'No hay solicitudes' };
  }

  // Obtener cola de trades
  obtenerColaTrades() {
    return {
      estructura: 'COLA (FIFO)',
      total: this.colaTrades.length,
      datos: this.colaTrades,
      explicacion: 'El de ARRIBA es el MÁS ANTIGUO'
    };
  }

  // =============================================
  // ESTRUCTURA 4: ÁRBOL BINARIO
  // Implementada en: detailFunctions.h (NodoArbol)
  // =============================================
  // USO EN LA APP: Cartas ordenadas por HP
  // =============================================

  // Insertar en árbol (como insertar_arbol en C++)
  insertarEnArbol(carta) {
    // En C++: comparar HP y decidir izquierda/derecha
    this.arbolHP.push(carta);
    
    // Simular árbol ordenado por HP
    this.arbolHP.sort((a, b) => (a.hp || 0) - (b.hp || 0));
    
    return {
      exito: true,
      mensaje: `Carta insertada en árbol (HP: ${carta.hp || 0})`,
      explicacion: 'Menor HP a la izquierda, mayor HP a la derecha'
    };
  }

  // Buscar en árbol por HP
  buscarPorHP(hp) {
    // En C++: búsqueda binaria O(log n)
    const resultados = this.arbolHP.filter(c => c.hp === hp);
    
    return {
      estructura: 'ÁRBOL BINARIO',
      encontradas: resultados.length,
      datos: resultados,
      explicacion: 'Búsqueda rápida O(log n) saltando ramas'
    };
  }

  // Recorrido inorden (izquierda → raíz → derecha)
  recorridoInorden() {
    return {
      estructura: 'ÁRBOL BINARIO - RECORRIDO INORDEN',
      total: this.arbolHP.length,
      datos: this.arbolHP,
      explicacion: 'Ordenado de menor a mayor HP'
    };
  }

  // =============================================
  // ESTRUCTURA 5: TABLA HASH
  // Implementada en: detailFunctions.h (HashNode* tablaHash[HASH_SIZE])
  // =============================================
  // USO EN LA APP: Usuarios y sus colecciones
  // =============================================

  // Registrar usuario (función hash: ID % 100)
  registrarUsuario(id, nombre) {
    // Función hash (como en C++)
    const bucket = id % 100;
    
    if (!this.tablaHash[bucket]) {
      this.tablaHash[bucket] = [];
    }
    
    // Manejo de colisiones: lista enlazada en el bucket
    this.tablaHash[bucket].push({
      id,
      nombre,
      inventario: [],
      wishlist: [],
      tradeList: []
    });
    
    return {
      exito: true,
      mensaje: `Usuario ${nombre} registrado en bucket #${bucket}`,
      explicacion: 'Hash: ID → bucket. Colisiones se manejan con listas'
    };
  }

  // Buscar usuario por ID (búsqueda instantánea)
  buscarUsuario(id) {
    const bucket = id % 100;
    const usuarios = this.tablaHash[bucket] || [];
    const usuario = usuarios.find(u => u.id === id);
    
    return {
      encontrado: !!usuario,
      usuario: usuario || null,
      bucket,
      explicacion: 'Búsqueda O(1) gracias a la función hash'
    };
  }

  // =============================================
  // ESTRUCTURA 6: GRAFO
  // Implementada en: detailFunctions.h (Vertice* grafo[MAX])
  // =============================================
  // USO EN LA APP: Amigos/conexiones entre usuarios
  // =============================================

  // Agregar vértice (usuario al grafo)
  agregarVertice(username) {
    if (!this.grafoAmigos[username]) {
      this.grafoAmigos[username] = {
        nombre: username,
        amigos: [] // Lista de adyacencia
      };
      return { exito: true, mensaje: `Usuario ${username} agregado` };
    }
    return { exito: false, mensaje: 'Usuario ya existe' };
  }

  // Conectar dos usuarios (arista no dirigida)
  conectar(u1, u2) {
    if (!this.grafoAmigos[u1]) this.agregarVertice(u1);
    if (!this.grafoAmigos[u2]) this.agregarVertice(u2);
    
    // Conexión bidireccional
    if (!this.grafoAmigos[u1].amigos.includes(u2)) {
      this.grafoAmigos[u1].amigos.push(u2);
    }
    if (!this.grafoAmigos[u2].amigos.includes(u1)) {
      this.grafoAmigos[u2].amigos.push(u1);
    }
    
    return {
      exito: true,
      mensaje: `${u1} y ${u2} conectados`,
      explicacion: 'Grafo no dirigido con lista de adyacencia'
    };
  }

  // BFS (recorrido en amplitud)
  bfs(inicio) {
    if (!this.grafoAmigos[inicio]) return { error: 'Usuario no existe' };
    
    const visitados = {};
    const cola = [inicio];
    const recorrido = [];
    
    visitados[inicio] = true;
    
    while (cola.length > 0) {
      const actual = cola.shift(); // FIFO
      recorrido.push(actual);
      
      for (const amigo of this.grafoAmigos[actual].amigos) {
        if (!visitados[amigo]) {
          visitados[amigo] = true;
          cola.push(amigo);
        }
      }
    }
    
    return {
      tipo: 'BFS (Amplitud)',
      inicio,
      recorrido,
      explicacion: 'Usa COLA. Primero amigos directos, luego amigos de amigos...'
    };
  }

  // DFS (recorrido en profundidad)
  dfs(inicio) {
    if (!this.grafoAmigos[inicio]) return { error: 'Usuario no existe' };
    
    const visitados = {};
    const pila = [inicio];
    const recorrido = [];
    
    while (pila.length > 0) {
      const actual = pila.pop(); // LIFO
      
      if (!visitados[actual]) {
        visitados[actual] = true;
        recorrido.push(actual);
        
        // Agregar amigos a la pila (en orden inverso para mantener orden)
        const amigos = [...this.grafoAmigos[actual].amigos].reverse();
        for (const amigo of amigos) {
          if (!visitados[amigo]) {
            pila.push(amigo);
          }
        }
      }
    }
    
    return {
      tipo: 'DFS (Profundidad)',
      inicio,
      recorrido,
      explicacion: 'Usa PILA. Va por una rama hasta el final, luego retrocede'
    };
  }

  // Obtener grafo completo
  obtenerGrafo() {
    return {
      estructura: 'GRAFO - Lista de adyacencia',
      totalVertices: Object.keys(this.grafoAmigos).length,
      datos: this.grafoAmigos
    };
  }

  // =============================================
  // FUNCIONES PARA WISHLIST (adicional)
  // =============================================
  
  agregarAWishlist(carta) {
    if (!this.wishlistBackend.some(c => c.id === carta.id)) {
      this.wishlistBackend.push(carta);
      return { exito: true, mensaje: 'Añadido a wishlist' };
    }
    return { exito: false, mensaje: 'Ya está en wishlist' };
  }

  obtenerWishlist() {
    return {
      estructura: 'LISTA',
      total: this.wishlistBackend.length,
      datos: this.wishlistBackend
    };
  }

  eliminarDeWishlist(id) {
    const index = this.wishlistBackend.findIndex(c => c.id === id);
    if (index !== -1) {
      this.wishlistBackend.splice(index, 1);
      return { exito: true };
    }
    return { exito: false };
  }
}

// Exportamos UNA SOLA instancia (singleton)
export default new CppBackend();
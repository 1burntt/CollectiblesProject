// API.ts

// --- 1. Direccion base de la API de cartas ---
// Todas las peticiones empezaran con esta direccion
const BASE_URL = 'https://api.tcgdex.net/v2/en';

// --- 2. Funcion generica para hablar con la API ---
// Esta funcion hace el trabajo pesado de conectarse a internet.
// Es "generica" porque puede pedir diferentes tipos de informacion.
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    // Unimos la direccion base con lo que nos falta (ej: '/cards/xy1-1')
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log('🌐 Obteniendo datos de:', fullUrl);

    // Usamos 'fetch' para ir a buscar la informacion a internet
    const response = await fetch(fullUrl);

    // Si la respuesta no es buena (ej: error 404), lanzamos un error
    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`);
    }

    // Convertimos la respuesta de texto a un objeto de JavaScript
    return await response.json();
  } catch (error) {
    console.error('❌ Error al conectar con la API:', error);
    throw error; // Lanzamos el error para que quien llamo a la funcion lo maneje
  }
}

// --- 3. Definimos la forma de una "Carta" (la misma que en el contexto) ---
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

// --- 4. Definimos una version mas simple de carta para las listas ---
// (Solo necesitamos el id, nombre y la imagen)
export interface CardListItem {
  id: string;
  name: string;
  image: string;
}

// --- 5. Lista de colecciones populares para buscar cartas ---
const POPULAR_SETS = [
  'swsh1', 'base1', 'dp1', 'ex1', 'hgss1', 'xy1', 'sm1', 'neo1',
];

// --- 6. Funcion para obtener las cartas principales (en la pantalla de inicio) ---
export const fetchAllCards = async (page: number = 1, limit: number = 20): Promise<CardListItem[]> => {
  try {
    // Un pequeño truco para ir rotando entre las colecciones populares
    // Usamos la pagina para decidir que dos colecciones vamos a pedir ahora.
    const startIndex = ((page - 1) * 2) % POPULAR_SETS.length;
    const setsToFetch = [
      POPULAR_SETS[startIndex % POPULAR_SETS.length],
      POPULAR_SETS[(startIndex + 1) % POPULAR_SETS.length]
    ];

    console.log(`📦 Obteniendo cartas de las colecciones: ${setsToFetch.join(', ')}`);

    // Hacemos una solicitud por cada coleccion (paralelamente)
    const promises = setsToFetch.map(setId =>
      fetchAPI<any>(`/sets/${setId}`).then(data => data.cards || []).catch(() => [])
    );

    // Esperamos a que todas las solicitudes terminen
    const results = await Promise.all(promises);
    // Unimos todas las cartas de las dos colecciones en una sola lista
    const allCards = results.flat();

    // Filtramos las cartas que no tengan imagen y nos quedamos solo con las primeras 'limit'
    return allCards
      .filter((card: any) => card.image)
      .slice(0, limit)
      .map((card: any) => ({
        id: card.id,
        name: card.name,
        image: `${card.image}/low.png` // Pedimos la imagen de baja calidad para que cargue rapido
      }));
  } catch (error) {
    console.error('❌ Error obteniendo cartas:', error);
    return []; // Si hay error, devolvemos una lista vacia
  }
};

// --- 7. Funcion para obtener los detalles de UNA SOLA carta ---
export const fetchCardById = async (id: string): Promise<Card | null> => {
  try {
    console.log(`🔍 Obteniendo detalles de la carta: ${id}`);
    const data = await fetchAPI<any>(`/cards/${id}`);
    if (!data) return null;

    // Organizamos la informacion que nos llega para que coincida con nuestra interfaz 'Card'
    return {
      id: data.id,
      name: data.name,
      image: data.image,
      set: data.set || { name: 'Colección Desconocida' },
      localId: data.localId,
      hp: data.hp,
      types: data.types || [],
      illustrator: data.illustrator
    };
  } catch (error) {
    console.error(`❌ Error obteniendo detalles de la carta ${id}:`, error);
    return null;
  }
};

// --- 8. Funcion para buscar cartas por su nombre ---
export const searchCardsByName = async (query: string, limit: number = 20): Promise<CardListItem[]> => {
  try {
    // Si la busqueda es muy corta (menos de 2 letras), no hacemos nada.
    if (!query || query.length < 2) return [];

    console.log(`🔍 Buscando cartas que contengan: "${query}"`);

    const allResults: CardListItem[] = [];

    // Vamos a buscar en cada una de las colecciones populares
    for (const setId of POPULAR_SETS) {
      // Si ya juntamos suficientes cartas, paramos de buscar
      if (allResults.length >= limit) break;

      try {
        console.log(`📦 Buscando en coleccion: ${setId}`);
        const setData = await fetchAPI<any>(`/sets/${setId}`);

        // Si la coleccion tiene cartas, buscamos las que coincidan con el nombre
        if (setData && setData.cards && Array.isArray(setData.cards)) {
          const matches = setData.cards
            .filter((card: any) =>
              card.name &&
              card.name.toLowerCase().includes(query.toLowerCase()) &&
              card.image
            )
            .slice(0, limit - allResults.length) // Solo las que necesitamos
            .map((card: any) => ({
              id: card.id,
              name: card.name,
              image: `${card.image}/low.png`
            }));

          if (matches.length > 0) {
            console.log(`✅ Encontradas ${matches.length} en ${setId}`);
            allResults.push(...matches); // Las añadimos a la lista de resultados
          }
        }
      } catch (e) {
        // Si una coleccion da error, simplemente la saltamos
        console.log(`⚠️ Error en coleccion ${setId}:`, e);
      }
    }

    console.log(`🔍 Busqueda completada. Total encontradas: ${allResults.length} cartas para "${query}"`);
    return allResults;

  } catch (error) {
    console.error('❌ Error buscando cartas:', error);
    return [];
  }
};
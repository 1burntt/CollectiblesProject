// API.ts
const BASE_URL = 'https://api.tcgdex.net/v2/en';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log('🌐 Fetching:', fullUrl);
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ Error en fetchAPI:', error);
    throw error;
  }
}

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

export interface CardListItem {
  id: string;
  name: string;
  image: string;
}

const POPULAR_SETS = [
  'swsh1', 'base1', 'dp1', 'ex1', 'hgss1', 'xy1', 'sm1', 'neo1',
];

// Obtiene todas las cartas (MINIATURAS: /low.png)
export const fetchAllCards = async (page: number = 1, limit: number = 20): Promise<CardListItem[]> => {
  try {
    const startIndex = ((page - 1) * 2) % POPULAR_SETS.length;
    const setsToFetch = [
      POPULAR_SETS[startIndex % POPULAR_SETS.length],
      POPULAR_SETS[(startIndex + 1) % POPULAR_SETS.length]
    ];

    const promises = setsToFetch.map(setId =>
      fetchAPI<any>(`/sets/${setId}`).then(data => data.cards || []).catch(() => [])
    );

    const results = await Promise.all(promises);
    const allCards = results.flat();

    return allCards
      .filter((card: any) => card.image)
      .slice(0, limit)
      .map((card: any) => ({
        id: card.id,
        name: card.name,
        image: `${card.image}/low.png`
      }));

  } catch (error) {
    console.error('❌ Error fetching cards:', error);
    return [];
  }
};

// Obtiene una carta por ID (ALTA CALIDAD: /high.png)
export const fetchCardById = async (id: string): Promise<Card | null> => {
  try {
    const data = await fetchAPI<any>(`/cards/${id}`);
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      image: data.image,
      set: data.set || { name: 'Unknown Set' },
      localId: data.localId,
      hp: data.hp,
      types: data.types || [],
      illustrator: data.illustrator
    };
  } catch (error) {
    console.error(`❌ Error fetching card by id ${id}:`, error);
    return null;
  }
};

// Búsqueda de cartas por nombre - VERSIÓN CORREGIDA
export const searchCardsByName = async (query: string, limit: number = 20): Promise<CardListItem[]> => {
  try {
    if (!query || query.length < 2) return [];

    console.log(`🔍 Buscando: "${query}"`);
    
    const allResults: CardListItem[] = [];
    
    // Buscar en todos los sets populares
    for (const setId of POPULAR_SETS) {
      if (allResults.length >= limit) break;
      
      try {
        console.log(`📦 Buscando en set: ${setId}`);
        const setData = await fetchAPI<any>(`/sets/${setId}`);
        
        if (setData && setData.cards && Array.isArray(setData.cards)) {
          const matches = setData.cards
            .filter((card: any) => 
              card.name && 
              card.name.toLowerCase().includes(query.toLowerCase()) && 
              card.image
            )
            .slice(0, limit - allResults.length)
            .map((card: any) => ({
              id: card.id,
              name: card.name,
              image: `${card.image}/low.png`
            }));
          
          if (matches.length > 0) {
            console.log(`✅ Encontradas ${matches.length} en ${setId}`);
            allResults.push(...matches);
          }
        }
      } catch (e) {
        // Ignorar errores de sets individuales
        console.log(`⚠️ Error en set ${setId}:`, e);
      }
    }
    
    console.log(`🔍 Total encontradas: ${allResults.length} cartas para "${query}"`);
    return allResults;
    
  } catch (error) {
    console.error('❌ Error searching cards:', error);
    return [];
  }
};
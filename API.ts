// Esta es la dirección de la página web donde están todas las cartas
const BASE_URL = 'https://api.tcgdex.net/v2/en';

// ----------------------------------------------------------------------
// Función auxiliar (ayudante) para hacer la llamada a internet.
// Le decimos qué página queremos visitar (el endpoint) y ella se encarga
// de ir, traer los datos y devolverlos.
// ----------------------------------------------------------------------
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    // Construimos la dirección completa, por ejemplo: https://api.../cards/xy1
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log('🌐 Yendo a buscar a:', fullUrl);

    // Le pedimos al teléfono que vaya a esa dirección
    const response = await fetch(fullUrl);

    // Si la página nos responde con un error (ej: 404 no encontrada), lanzamos una alerta
    if (!response.ok) {
      throw new Error(`La página respondió con error: ${response.status}`);
    }

    // Si todo va bien, convertimos la respuesta a un formato que la app entiende (JSON)
    return await response.json();
  } catch (error) {
    console.error('❌ Error en el viaje a internet:', error);
    throw error; // Lanzamos el error para que quien llamó a esta función sepa que falló
  }
}

// ----------------------------------------------------------------------
// Estos son los "moldes" que definen cómo son las cartas que nos llegan.
// ----------------------------------------------------------------------
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

// Este es un molde más simple para cuando solo necesitamos el nombre, id y foto.
export interface CardListItem {
  id: string;
  name: string;
  image: string;
}

// ----------------------------------------------------------------------
// Aquí elegimos de qué colecciones vamos a sacar las cartas.
// Es como decidir de qué cajas del almacén vamos a rebuscar.
// ----------------------------------------------------------------------
const POPULAR_SETS = [
  'swsh1', 'base1', 'dp1', 'ex1', 'hgss1', 'xy1', 'sm1', 'neo1',
];

// ----------------------------------------------------------------------
// Función para cargar un montón de cartas en la pantalla principal.
// Va a buscar cartas de dos colecciones diferentes para que haya variedad.
// ----------------------------------------------------------------------
export const fetchAllCards = async (page: number = 1, limit: number = 20): Promise<CardListItem[]> => {
  try {
    // Esto es un truco para que cada vez que pidamos más cartas (scroll),
    // cojamos dos colecciones diferentes y no se repitan siempre las mismas.
    const startIndex = ((page - 1) * 2) % POPULAR_SETS.length;
    const setsToFetch = [
      POPULAR_SETS[startIndex % POPULAR_SETS.length],
      POPULAR_SETS[(startIndex + 1) % POPULAR_SETS.length]
    ];

    console.log(`📦 Cargando página ${page} de las colecciones:`, setsToFetch);

    // Vamos a buscar las cartas de las dos colecciones a la vez (en paralelo)
    const promises = setsToFetch.map(setId =>
      fetchAPI<any>(`/sets/${setId}`).then(data => data.cards || []).catch(() => [])
    );

    // Esperamos a que las dos búsquedas terminen
    const results = await Promise.all(promises);

    // Juntamos todas las cartas de las dos colecciones en una sola lista
    const allCards = results.flat();

    // De todas esas cartas, nos quedamos solo con las que tienen foto,
    // cogemos solo las primeras 'limit' (20) y les damos la forma que necesitamos.
    return allCards
      .filter((card: any) => card.image)
      .slice(0, limit)
      .map((card: any) => ({
        id: card.id,
        name: card.name,
        image: `${card.image}/low.png`  // Pedimos la foto en tamaño pequeño
      }));
  } catch (error) {
    console.error('❌ Error al cargar el lote de cartas:', error);
    return []; // Si hay error, devolvemos una lista vacía para que la app no se rompa
  }
};

// ----------------------------------------------------------------------
// Función para buscar UNA SOLA carta por su ID (su número de carnet).
// Se usa cuando entramos al detalle de una carta.
// ----------------------------------------------------------------------
export const fetchCardById = async (id: string): Promise<Card | null> => {
  try {
    // Vamos a la dirección de esa carta en concreto, por ejemplo: /cards/swsh1-1
    const data = await fetchAPI<any>(`/cards/${id}`);
    if (!data) return null;

    // Devolvemos la carta con todos sus detalles, en el formato que usa la app.
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
    console.error(`❌ Error al buscar la carta con id ${id}:`, error);
    return null;
  }
};

// ----------------------------------------------------------------------
// Función para buscar cartas por su nombre (el buscador).
// ----------------------------------------------------------------------
export const searchCardsByName = async (query: string, limit: number = 20): Promise<CardListItem[]> => {
  try {
    // Si el usuario escribe menos de 2 letras, no buscamos nada para no saturar.
    if (!query || query.length < 2) return [];

    console.log(`🔍 Buscando cartas que contengan: "${query}"`);

    // Aquí guardaremos todos los resultados que encontremos
    const allResults: CardListItem[] = [];

    // Vamos colección por colección (las populares) buscando la palabra.
    for (const setId of POPULAR_SETS) {
      // Si ya encontramos suficientes cartas (20), paramos de buscar.
      if (allResults.length >= limit) break;

      try {
        console.log(`📦 Buscando en la colección: ${setId}`);
        // Pedimos la información de la colección
        const setData = await fetchAPI<any>(`/sets/${setId}`);

        // Si la colección tiene cartas...
        if (setData && setData.cards && Array.isArray(setData.cards)) {
          // Filtramos las cartas que tengan nombre y que ese nombre contenga lo que busca el usuario
          const matches = setData.cards
            .filter((card: any) =>
              card.name &&
              card.name.toLowerCase().includes(query.toLowerCase()) &&
              card.image
            )
            // De las que coinciden, solo cogemos las que necesitamos para llegar al límite
            .slice(0, limit - allResults.length)
            .map((card: any) => ({
              id: card.id,
              name: card.name,
              image: `${card.image}/low.png`
            }));

          // Si encontramos coincidencias, las añadimos a la lista total
          if (matches.length > 0) {
            console.log(`✅ Encontradas ${matches.length} en ${setId}`);
            allResults.push(...matches);
          }
        }
      } catch (e) {
        // Si una colección falla, simplemente la ignoramos y seguimos con la siguiente
        console.log(`⚠️ Error al buscar en la colección ${setId}:`, e);
      }
    }

    console.log(`🔍 Busqueda finalizada. Total encontradas: ${allResults.length} cartas para "${query}"`);
    return allResults;
  } catch (error) {
    console.error('❌ Error general en la búsqueda:', error);
    return [];
  }
};
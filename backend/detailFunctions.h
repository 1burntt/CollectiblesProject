// backend/detailFunctions.h
#ifndef DETAILFUNCTIONS_H
#define DETAILFUNCTIONS_H

#include "structuresCards.h"
#include <iostream>
using namespace std;

// ==================== 1. LISTA DOBLEMENTE ENLAZADA (El Inventario) ====================
// Definimos la estructura de la lista en si, que contiene punteros al primero y ultimo nodo,
// y un contador de cuantos elementos tiene.
typedef struct {
    NodoCarta* primero;   // Puntero al primer nodo de la lista
    NodoCarta* ultimo;    // Puntero al ultimo nodo de la lista
    int total;            // Cuantas cartas hay en total
} ListaInventario;

// Funcion para AGREGAR una carta al final del inventario (lista)
void agregar_al_inventario(ListaInventario* li, string id, string nom, int hp, string serie = "", string artista = "", string elem = "", int num = 0) {
    // 1. Creamos el nuevo nodo (la nueva carta)
    NodoCarta* nuevo = (NodoCarta*)malloc(sizeof(NodoCarta));
    nuevo->id = id;
    nuevo->nombre = nom;
    nuevo->hp = hp;
    nuevo->serie = serie;
    nuevo->artista = artista;
    nuevo->elemento = elem;
    nuevo->numero = num;
    nuevo->sig = NULL;  // Como sera el ultimo, su siguiente es NULL
    nuevo->ant = NULL;  // Su anterior lo definimos despues

    // 2. Lo insertamos al final de la lista
    if (li->primero == NULL) {
        // Si la lista esta vacia, el nuevo es el primero y el ultimo
        li->primero = nuevo;
        li->ultimo = nuevo;
    } else {
        // Si no esta vacia, lo enganchamos despues del ultimo
        li->ultimo->sig = nuevo;  // El antiguo ultimo ahora apunta al nuevo
        nuevo->ant = li->ultimo;   // El nuevo apunta al antiguo ultimo como anterior
        li->ultimo = nuevo;        // Actualizamos el puntero "ultimo" de la lista
    }
    li->total++; // Aumentamos el contador de cartas
    cout << "Carta '" << nom << "' agregada al inventario." << endl;
}

// Funcion para ELIMINAR una carta del inventario por su ID
bool eliminar_del_inventario(ListaInventario* li, string id) {
    NodoCarta* actual = li->primero; // Empezamos por el primero

    // Recorremos la lista hasta encontrar la carta con el ID buscado
    while (actual != NULL) {
        if (actual->id == id) {
            // --- Encontramos la carta! Ahora la sacamos de la lista ---

            // Caso 1: Es el primer nodo
            if (actual == li->primero) {
                li->primero = actual->sig; // El nuevo primero es el siguiente
                if (li->primero) li->primero->ant = NULL; // Si hay un nuevo primero, su anterior es NULL
            }
            // Caso 2: Es el ultimo nodo
            else if (actual == li->ultimo) {
                li->ultimo = actual->ant; // El nuevo ultimo es el anterior
                li->ultimo->sig = NULL;   // El nuevo ultimo ya no tiene siguiente
            }
            // Caso 3: Esta en medio
            else {
                actual->ant->sig = actual->sig; // El anterior salta al siguiente
                actual->sig->ant = actual->ant; // El siguiente retrocede al anterior
            }

            free(actual);      // Liberamos la memoria del nodo
            li->total--;       // Disminuimos el contador
            cout << "Carta eliminada del inventario." << endl;
            return true;
        }
        actual = actual->sig; // Pasamos al siguiente nodo
    }

    cout << "Carta no encontrada en el inventario." << endl;
    return false;
}

// Funcion para MOSTRAR todo el inventario
void mostrar_inventario(ListaInventario* li) {
    if (!li->primero) {
        cout << "Inventario vacío." << endl;
        return;
    }

    cout << "\n--- INVENTARIO (Total: " << li->total << ") ---" << endl;
    NodoCarta* actual = li->primero;
    while (actual) {
        cout << actual->id << " | " << actual->nombre << " | HP: " << actual->hp << endl;
        actual = actual->sig;
    }
}

// ==================== 2. PILA (Historial de cartas vistas) ====================
// La pila funciona como una pila de platos: el ultimo que entra es el primero que sale (LIFO).
typedef struct {
    NodoCarta* tope; // El tope es el ultimo elemento que se añadio.
} PilaHistorial;

// Funcion para APILAR (push) una carta al historial (se añade al tope)
void push_historial(PilaHistorial* p, string nombre, string id) {
    NodoCarta* nuevo = (NodoCarta*)malloc(sizeof(NodoCarta));
    nuevo->nombre = nombre;
    nuevo->id = id;
    nuevo->sig = p->tope; // El nuevo nodo apunta al que era el tope hasta ahora
    p->tope = nuevo;      // El nuevo nodo se convierte en el tope
    cout << "'" << nombre << "' añadida al historial de vistas." << endl;
}

// Funcion para MOSTRAR el historial (desde el mas reciente al mas antiguo)
void mostrar_historial(PilaHistorial* p) {
    if (!p->tope) {
        cout << "Historial vacío." << endl;
        return;
    }

    cout << "\n--- HISTORIAL (Ultimas vistas primero) ---" << endl;
    for (NodoCarta* a = p->tope; a; a = a->sig) {
        cout << "-> " << a->nombre << endl;
    }
}

// ==================== 3. COLA (Solicitudes de Trade) ====================
// La cola funciona como una fila en el supermercado: el primero que llega es el primero en ser atendido (FIFO).
typedef struct {
    NodoCarta* frente; // El primero de la fila (el que sigue para ser atendido)
    NodoCarta* final;  // El ultimo de la fila (el que acaba de llegar)
} ColaTrades;

// Funcion para ENCOLAR (queue) una solicitud de trade (se añade al final)
void enqueue_trade(ColaTrades* c, string nombre, string id, string solicitante) {
    NodoCarta* n = (NodoCarta*)malloc(sizeof(NodoCarta));
    n->nombre = nombre;
    n->id = id;
    n->serie = solicitante; // Reutilizamos el campo 'serie' para guardar quien solicita
    n->sig = NULL;          // Como sera el nuevo final, su siguiente es NULL

    if (!c->final) {
        // Si la cola esta vacia, el nuevo es el frente y el final
        c->frente = n;
        c->final = n;
    } else {
        // Si no, lo enganchamos despues del final actual
        c->final->sig = n;
        c->final = n; // Actualizamos el final
    }
    cout << "Trade de '" << nombre << "' de " << solicitante << " añadido a la cola." << endl;
}

// Funcion para MOSTRAR la cola de trades (desde el primero al ultimo)
void mostrar_cola(ColaTrades* c) {
    if (!c->frente) {
        cout << "Cola de trades vacía." << endl;
        return;
    }

    cout << "\n--- COLA DE TRADES (Primero en llegar, primero en atenderse) ---" << endl;
    int i = 1;
    for (NodoCarta* a = c->frente; a; a = a->sig) {
        cout << i++ << ". " << a->nombre << " (solicita: " << a->serie << ")" << endl;
    }
}

// ==================== 4. ARBOL BINARIO (Catalogo ordenado por HP) ====================
// El arbol organiza las cartas por su HP. Los menores van a la izquierda, los mayores a la derecha.

// Funcion para INSERTAR una carta en el arbol (de forma recursiva)
NodoArbol* insertar_arbol(NodoArbol* r, int hp, string nom, string id) {
    if (!r) {
        // Si el lugar esta vacio, creamos un nuevo nodo
        NodoArbol* n = (NodoArbol*)malloc(sizeof(NodoArbol));
        n->hp = hp;
        n->nombreCarta = nom;
        n->idCarta = id;
        n->izq = n->der = NULL;
        return n;
    }

    // Si el HP es menor que el del nodo actual, vamos por la izquierda
    if (hp < r->hp) {
        r->izq = insertar_arbol(r->izq, hp, nom, id);
    }
    // Si es mayor o igual, vamos por la derecha
    else {
        r->der = insertar_arbol(r->der, hp, nom, id);
    }
    return r;
}

// Funcion para MOSTRAR el arbol en orden (INORDEN: izquierda, raiz, derecha)
// Esto mostrara las cartas ordenadas de menor a mayor HP.
void inorden(NodoArbol* r) {
    if (r) {
        inorden(r->izq); // Primero el subarbol izquierdo (HP menor)
        cout << "HP: " << r->hp << " | " << r->nombreCarta << endl; // Luego la raiz
        inorden(r->der); // Finalmente el subarbol derecho (HP mayor)
    }
}

// ==================== 5. TABLA HASH (Registro de usuarios por ID) ====================
// La tabla hash es como un armario con muchos cajones (buckets). Segun el ID del usuario,
// calculamos a que cajon va y lo guardamos ahi. Asi es muy rapido de buscar despues.
#define HASH_SIZE 100 // Numero de cajones

typedef struct HashNode {
    int id;               // ID del usuario
    string user;          // Nombre del usuario
    HashNode* sig;        // Por si hay colisiones (varios usuarios en el mismo cajon)
} HashNode;

HashNode* tablaHash[HASH_SIZE] = {NULL}; // Inicializamos todos los cajones vacios

// Funcion HASH: calcula el indice del cajon a partir del ID
int hashFunc(int id) {
    return id % HASH_SIZE; // Una forma sencilla: el resto de dividir por el tamaño
}

// Funcion para REGISTRAR un usuario
void registrar_usuario(int id, string user) {
    int idx = hashFunc(id); // Calculamos el cajon
    HashNode* n = (HashNode*)malloc(sizeof(HashNode));
    n->id = id;
    n->user = user;
    n->sig = NULL;

    if (!tablaHash[idx]) {
        // Si el cajon esta vacio, el nuevo es el primero
        tablaHash[idx] = n;
    } else {
        // Si ya hay alguien, vamos al final de la lista de ese cajon y lo añadimos
        HashNode* a = tablaHash[idx];
        while (a->sig) a = a->sig;
        a->sig = n;
    }
    cout << "Usuario " << user << " registrado (bucket " << idx << ")." << endl;
}

// Funcion para BUSCAR un usuario por su ID
string buscar_usuario(int id) {
    int idx = hashFunc(id); // Calculamos el cajon donde deberia estar
    HashNode* a = tablaHash[idx];

    // Recorremos la lista de ese cajon buscando el ID
    while (a) {
        if (a->id == id) return a->user;
        a = a->sig;
    }
    return "Usuario no encontrado";
}

// ==================== 6. GRAFO (Red de Amigos) ====================
// El grafo nos permite representar relaciones entre usuarios. Cada usuario es un "vertice"
// y cada relacion de amistad es una "arista" que los une.

#define MAX 50 // Maximo numero de usuarios en el grafo

Vertice* grafo[MAX]; // Arreglo de vertices (usuarios)
int totalV = 0;      // Contador de cuantos usuarios hay

// Funcion para AGREGAR un nuevo vertice (usuario) al grafo
void agregar_vertice(string user) {
    if (totalV >= MAX) return; // No podemos exceder el maximo

    Vertice* v = (Vertice*)malloc(sizeof(Vertice));
    v->username = user;
    v->amigos = NULL; // Aun no tiene amigos
    grafo[totalV++] = v;
    cout << "Usuario " << user << " agregado al grafo." << endl;
}

// Funcion auxiliar para obtener el INDICE de un vertice por su nombre
int idxVertice(string user) {
    for (int i = 0; i < totalV; i++) {
        if (grafo[i]->username == user) return i;
    }
    return -1; // No encontrado
}

// Funcion para CONECTAR dos usuarios (hacerlos amigos)
void conectar(string u1, string u2) {
    int i1 = idxVertice(u1);
    int i2 = idxVertice(u2);

    if (i1 < 0 || i2 < 0) {
        cout << "Uno de los usuarios no existe." << endl;
        return;
    }

    // Añadimos u2 a la lista de amigos de u1
    NodoGrafo* n1 = (NodoGrafo*)malloc(sizeof(NodoGrafo));
    n1->username = u2;
    n1->sig = grafo[i1]->amigos; // Lo insertamos al principio de la lista
    grafo[i1]->amigos = n1;

    // Añadimos u1 a la lista de amigos de u2 (porque la relacion es bidireccional)
    NodoGrafo* n2 = (NodoGrafo*)malloc(sizeof(NodoGrafo));
    n2->username = u1;
    n2->sig = grafo[i2]->amigos;
    grafo[i2]->amigos = n2;

    cout << "Conexion establecida: " << u1 << " - " << u2 << endl;
}

// Funcion para MOSTRAR el grafo completo
void mostrar_grafo() {
    cout << "\n--- GRAFO DE AMIGOS ---" << endl;
    for (int i = 0; i < totalV; i++) {
        cout << grafo[i]->username << " -> ";
        for (NodoGrafo* a = grafo[i]->amigos; a; a = a->sig) {
            cout << a->username << " ";
        }
        cout << endl;
    }
}

#endif
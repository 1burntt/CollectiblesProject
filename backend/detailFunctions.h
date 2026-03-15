#ifndef DETAILFUNCTIONS_H
#define DETAILFUNCTIONS_H

#include "structuresCards.h"
#include <iostream>
using namespace std;

// ==================== 1. LISTA DOBLEMENTE ENLAZADA ====================
// Una lista es como una fila de personas cogidas de la mano.
// Cada persona (nodo) sabe quién está delante y quién detrás.

typedef struct {
    NodoCarta* primero;   // El primero de la fila
    NodoCarta* ultimo;    // El último de la fila
    int total;            // Cuántas personas hay en la fila
} ListaInventario;

// Función para agregar una carta al final de la lista (inventario)
void agregar_al_inventario(ListaInventario* li, string id, string nom, int hp, string serie = "", string artista = "", string elem = "", int num = 0) {
    // Crear la nueva carta (nodo)
    NodoCarta* nuevo = (NodoCarta*)malloc(sizeof(NodoCarta));
    nuevo->id = id;
    nuevo->nombre = nom;
    nuevo->hp = hp;
    nuevo->serie = serie;
    nuevo->artista = artista;
    nuevo->elemento = elem;
    nuevo->numero = num;
    nuevo->sig = NULL;  // Al ser el último, no tiene siguiente
    nuevo->ant = NULL;  // De momento no tiene anterior

    if (li->primero == NULL) {
        // Si la lista está vacía, el nuevo es el primero y el último
        li->primero = nuevo;
        li->ultimo = nuevo;
    } else {
        // Si no, lo enganchamos al final
        li->ultimo->sig = nuevo;  // El que era último ahora apunta al nuevo
        nuevo->ant = li->ultimo;  // El nuevo apunta al que era último como anterior
        li->ultimo = nuevo;       // El nuevo pasa a ser el último
    }
    li->total++; // Una persona más en la fila
    cout << "Carta '" << nom << "' agregada." << endl;
}

// Función para eliminar una carta de la lista por su ID
bool eliminar_del_inventario(ListaInventario* li, string id) {
    NodoCarta* actual = li->primero; // Empezamos por el primero

    // Recorremos toda la lista buscando el ID
    while (actual != NULL) {
        if (actual->id == id) {
            // Si es el primero de la lista
            if (actual == li->primero) {
                li->primero = actual->sig; // El segundo pasa a ser primero
                if (li->primero) li->primero->ant = NULL; // El nuevo primero ya no tiene anterior
            }
            // Si es el último de la lista
            else if (actual == li->ultimo) {
                li->ultimo = actual->ant; // El penúltimo pasa a ser último
                li->ultimo->sig = NULL;   // El nuevo último ya no tiene siguiente
            }
            // Si está en medio
            else {
                // El de antes salta al de después, y viceversa
                actual->ant->sig = actual->sig;
                actual->sig->ant = actual->ant;
            }
            free(actual);      // Liberamos la memoria de ese nodo
            li->total--;       // Una persona menos en la fila
            cout << "Carta eliminada." << endl;
            return true;
        }
        actual = actual->sig; // Pasamos al siguiente
    }
    cout << "Carta no encontrada." << endl;
    return false;
}

// Función para mostrar todo el inventario
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

// ==================== 2. PILA ====================
// Una pila es como una pila de platos: el último que pones es el primero que sacas (LIFO).
typedef struct {
    NodoCarta* tope; // El plato de arriba de la pila
} PilaHistorial;

// Añadir una carta vista al historial (apilar)
void push_historial(PilaHistorial* p, string nombre, string id) {
    NodoCarta* nuevo = (NodoCarta*)malloc(sizeof(NodoCarta));
    nuevo->nombre = nombre;
    nuevo->id = id;
    nuevo->sig = p->tope; // El nuevo apunta al que era el tope
    p->tope = nuevo;      // El nuevo ahora es el tope
    cout << "'" << nombre << "' añadida al historial." << endl;
}

// Mostrar el historial (desde el más reciente al más antiguo)
void mostrar_historial(PilaHistorial* p) {
    if (!p->tope) {
        cout << "Historial vacío." << endl;
        return;
    }
    cout << "\n--- HISTORIAL (LIFO) ---" << endl;
    for (NodoCarta* a = p->tope; a; a = a->sig) {
        cout << "-> " << a->nombre << endl;
    }
}

// ==================== 3. COLA ====================
// Una cola es como una fila en el supermercado: el primero que llega es el primero que se atiende (FIFO).
typedef struct {
    NodoCarta* frente; // El primero de la fila (el que se atiende)
    NodoCarta* final;  // El último de la fila (el que acaba de llegar)
} ColaTrades;

// Añadir una solicitud de trade a la cola (encolar)
void enqueue_trade(ColaTrades* c, string nombre, string id, string solicitante) {
    NodoCarta* n = (NodoCarta*)malloc(sizeof(NodoCarta));
    n->nombre = nombre;
    n->id = id;
    n->serie = solicitante; // Reutilizamos el campo "serie" para guardar quién solicita
    n->sig = NULL;

    if (!c->final) {
        // Si la cola está vacía, el nuevo es el frente y el final
        c->frente = n;
        c->final = n;
    } else {
        // Si no, lo ponemos al final
        c->final->sig = n;
        c->final = n;
    }
    cout << "Trade de '" << nombre << "' de " << solicitante << " encolado." << endl;
}

// Mostrar la cola de trades (del primero al último)
void mostrar_cola(ColaTrades* c) {
    if (!c->frente) {
        cout << "Cola vacía." << endl;
        return;
    }
    cout << "\n--- COLA DE TRADES ---" << endl;
    int i = 1;
    for (NodoCarta* a = c->frente; a; a = a->sig) {
        cout << i++ << ". " << a->nombre << " (solicita: " << a->serie << ")" << endl;
    }
}

// ==================== 4. ÁRBOL BINARIO ====================
// Un árbol binario ordena las cartas por su HP. Las de menos HP van a la izquierda,
// las de más HP a la derecha.

// Insertar una carta en el árbol (por su HP)
NodoArbol* insertar_arbol(NodoArbol* r, int hp, string nom, string id) {
    if (!r) {
        // Si no hay raíz, creamos una nueva
        NodoArbol* n = (NodoArbol*)malloc(sizeof(NodoArbol));
        n->hp = hp;
        n->nombreCarta = nom;
        n->idCarta = id;
        n->izq = n->der = NULL;
        return n;
    }
    // Si el HP es menor que el de la raíz, va a la izquierda
    if (hp < r->hp) {
        r->izq = insertar_arbol(r->izq, hp, nom, id);
    }
    // Si es mayor o igual, va a la derecha
    else {
        r->der = insertar_arbol(r->der, hp, nom, id);
    }
    return r;
}

// Recorrer el árbol en orden (primero izquierda, luego raíz, luego derecha)
// Esto mostrará las cartas ordenadas por HP de menor a mayor.
void inorden(NodoArbol* r) {
    if (r) {
        inorden(r->izq);
        cout << "HP: " << r->hp << " | " << r->nombreCarta << endl;
        inorden(r->der);
    }
}

// ==================== 5. TABLA HASH ====================
// Una tabla hash es como un archivador con muchos cajones.
// Cada usuario se guarda en un cajón según un número (su ID).

#define HASH_SIZE 100 // Tenemos 100 cajones

// Un nodo de la tabla hash (para cuando hay varios en el mismo cajón)
typedef struct HashNode {
    int id;
    string user;
    HashNode* sig;
} HashNode;

// La tabla hash: un array de 100 punteros a nodos
HashNode* tablaHash[HASH_SIZE] = {NULL};

// Función hash: decide en qué cajón (índice) va un ID
int hashFunc(int id) {
    return id % HASH_SIZE; // El resto de dividir por 100
}

// Registrar un usuario (guardarlo en su cajón)
void registrar_usuario(int id, string user) {
    int idx = hashFunc(id); // Calculamos el cajón
    HashNode* n = (HashNode*)malloc(sizeof(HashNode));
    n->id = id;
    n->user = user;
    n->sig = NULL;

    if (!tablaHash[idx]) {
        // Si el cajón está vacío, lo ponemos ahí
        tablaHash[idx] = n;
    } else {
        // Si no, lo añadimos al final de la lista de ese cajón
        HashNode* a = tablaHash[idx];
        while (a->sig) a = a->sig;
        a->sig = n;
    }
    cout << "Usuario " << user << " registrado (bucket " << idx << ")." << endl;
}

// Buscar un usuario por su ID
string buscar_usuario(int id) {
    int idx = hashFunc(id); // Buscamos en el cajón que le corresponde
    HashNode* a = tablaHash[idx];
    // Recorremos la lista de ese cajón
    while (a) {
        if (a->id == id) return a->user;
        a = a->sig;
    }
    return "No encontrado";
}

// ==================== 6. GRAFO ====================
// Un grafo es como una red de amigos. Cada usuario es un punto (vértice)
// y las amistades son líneas que los conectan.

#define MAX 50 // Máximo 50 usuarios

Vertice* grafo[MAX]; // Array de punteros a vértices
int totalV = 0;      // Cuántos usuarios hay en el grafo

// Agregar un nuevo usuario al grafo
void agregar_vertice(string user) {
    if (totalV >= MAX) return;
    Vertice* v = (Vertice*)malloc(sizeof(Vertice));
    v->username = user;
    v->amigos = NULL; // De momento, sin amigos
    grafo[totalV++] = v;
    cout << "Usuario " << user << " agregado al grafo." << endl;
}

// Función auxiliar para encontrar el índice de un usuario en el array
int idxVertice(string user) {
    for (int i = 0; i < totalV; i++) {
        if (grafo[i]->username == user) return i;
    }
    return -1;
}

// Conectar dos usuarios (hacerlos amigos)
void conectar(string u1, string u2) {
    int i1 = idxVertice(u1), i2 = idxVertice(u2);
    if (i1 < 0 || i2 < 0) {
        cout << "Usuario no existe." << endl;
        return;
    }

    // Añadimos u2 como amigo de u1
    NodoGrafo* n1 = (NodoGrafo*)malloc(sizeof(NodoGrafo));
    n1->username = u2;
    n1->sig = grafo[i1]->amigos;
    grafo[i1]->amigos = n1;

    // Añadimos u1 como amigo de u2 (amistad recíproca)
    NodoGrafo* n2 = (NodoGrafo*)malloc(sizeof(NodoGrafo));
    n2->username = u1;
    n2->sig = grafo[i2]->amigos;
    grafo[i2]->amigos = n2;

    cout << "Conexión " << u1 << " - " << u2 << endl;
}

// Mostrar el grafo (cada usuario y su lista de amigos)
void mostrar_grafo() {
    cout << "\n--- GRAFO ---" << endl;
    for (int i = 0; i < totalV; i++) {
        cout << grafo[i]->username << " -> ";
        for (NodoGrafo* a = grafo[i]->amigos; a; a = a->sig) {
            cout << a->username << " ";
        }
        cout << endl;
    }
}

#endif
#ifndef DETAILFUNCTIONS_H
#define DETAILFUNCTIONS_H

#include "structuresCards.h"
#include <iostream>
using namespace std;

// ==================== 1. LISTA DOBLEMENTE ENLAZADA ====================
typedef struct {
    NodoCarta* primero;
    NodoCarta* ultimo;
    int total;
} ListaInventario;

void agregar_al_inventario(ListaInventario* li, string id, string nom, int hp, string serie = "", string artista = "", string elem = "", int num = 0) {
    NodoCarta* nuevo = (NodoCarta*)malloc(sizeof(NodoCarta));
    nuevo->id = id; nuevo->nombre = nom; nuevo->hp = hp; nuevo->serie = serie;
    nuevo->artista = artista; nuevo->elemento = elem; nuevo->numero = num;
    nuevo->sig = NULL; nuevo->ant = NULL;

    if (li->primero == NULL) { li->primero = nuevo; li->ultimo = nuevo; }
    else { li->ultimo->sig = nuevo; nuevo->ant = li->ultimo; li->ultimo = nuevo; }
    li->total++;
    cout << "Carta '" << nom << "' agregada." << endl;
}

bool eliminar_del_inventario(ListaInventario* li, string id) {
    NodoCarta* actual = li->primero;
    while (actual != NULL) {
        if (actual->id == id) {
            if (actual == li->primero) { li->primero = actual->sig; if (li->primero) li->primero->ant = NULL; }
            else if (actual == li->ultimo) { li->ultimo = actual->ant; li->ultimo->sig = NULL; }
            else { actual->ant->sig = actual->sig; actual->sig->ant = actual->ant; }
            free(actual); li->total--; cout << "Carta eliminada." << endl; return true;
        }
        actual = actual->sig;
    }
    cout << "Carta no encontrada." << endl; return false;
}

void mostrar_inventario(ListaInventario* li) {
    if (!li->primero) { cout << "Inventario vacío." << endl; return; }
    cout << "\n--- INVENTARIO (Total: " << li->total << ") ---" << endl;
    NodoCarta* actual = li->primero;
    while (actual) { cout << actual->id << " | " << actual->nombre << " | HP: " << actual->hp << endl; actual = actual->sig; }
}

// ==================== 2. PILA ====================
typedef struct { NodoCarta* tope; } PilaHistorial;

void push_historial(PilaHistorial* p, string nombre, string id) {
    NodoCarta* nuevo = (NodoCarta*)malloc(sizeof(NodoCarta));
    nuevo->nombre = nombre; nuevo->id = id; nuevo->sig = p->tope; p->tope = nuevo;
    cout << "'" << nombre << "' añadida al historial." << endl;
}

void mostrar_historial(PilaHistorial* p) {
    if (!p->tope) { cout << "Historial vacío." << endl; return; }
    cout << "\n--- HISTORIAL (LIFO) ---" << endl;
    for (NodoCarta* a = p->tope; a; a = a->sig) cout << "-> " << a->nombre << endl;
}

// ==================== 3. COLA ====================
typedef struct { NodoCarta* frente; NodoCarta* final; } ColaTrades;

void enqueue_trade(ColaTrades* c, string nombre, string id, string solicitante) {
    NodoCarta* n = (NodoCarta*)malloc(sizeof(NodoCarta));
    n->nombre = nombre; n->id = id; n->serie = solicitante; n->sig = NULL;
    if (!c->final) { c->frente = n; c->final = n; }
    else { c->final->sig = n; c->final = n; }
    cout << "Trade de '" << nombre << "' de " << solicitante << " encolado." << endl;
}

void mostrar_cola(ColaTrades* c) {
    if (!c->frente) { cout << "Cola vacía." << endl; return; }
    cout << "\n--- COLA DE TRADES ---" << endl;
    int i = 1; for (NodoCarta* a = c->frente; a; a = a->sig) 
        cout << i++ << ". " << a->nombre << " (solicita: " << a->serie << ")" << endl;
}

// ==================== 4. ÁRBOL ====================
NodoArbol* insertar_arbol(NodoArbol* r, int hp, string nom, string id) {
    if (!r) { NodoArbol* n = (NodoArbol*)malloc(sizeof(NodoArbol)); n->hp = hp; n->nombreCarta = nom; n->idCarta = id; n->izq = n->der = NULL; return n; }
    if (hp < r->hp) r->izq = insertar_arbol(r->izq, hp, nom, id);
    else r->der = insertar_arbol(r->der, hp, nom, id);
    return r;
}

void inorden(NodoArbol* r) {
    if (r) { inorden(r->izq); cout << "HP: " << r->hp << " | " << r->nombreCarta << endl; inorden(r->der); }
}

// ==================== 5. HASH ====================
#define HASH_SIZE 100
typedef struct HashNode { int id; string user; HashNode* sig; } HashNode;
HashNode* tablaHash[HASH_SIZE] = {NULL};

int hashFunc(int id) { return id % HASH_SIZE; }

void registrar_usuario(int id, string user) {
    int idx = hashFunc(id);
    HashNode* n = (HashNode*)malloc(sizeof(HashNode)); n->id = id; n->user = user; n->sig = NULL;
    if (!tablaHash[idx]) tablaHash[idx] = n;
    else { HashNode* a = tablaHash[idx]; while (a->sig) a = a->sig; a->sig = n; }
    cout << "Usuario " << user << " registrado (bucket " << idx << ")." << endl;
}

string buscar_usuario(int id) {
    HashNode* a = tablaHash[hashFunc(id)];
    while (a) { if (a->id == id) return a->user; a = a->sig; }
    return "No encontrado";
}

// ==================== 6. GRAFO ====================
#define MAX 50
Vertice* grafo[MAX]; int totalV = 0;

void agregar_vertice(string user) {
    if (totalV >= MAX) return;
    Vertice* v = (Vertice*)malloc(sizeof(Vertice)); v->username = user; v->amigos = NULL;
    grafo[totalV++] = v;
    cout << "Usuario " << user << " agregado al grafo." << endl;
}

int idxVertice(string user) {
    for (int i = 0; i < totalV; i++) if (grafo[i]->username == user) return i;
    return -1;
}

void conectar(string u1, string u2) {
    int i1 = idxVertice(u1), i2 = idxVertice(u2);
    if (i1 < 0 || i2 < 0) { cout << "Usuario no existe." << endl; return; }
    NodoGrafo* n1 = (NodoGrafo*)malloc(sizeof(NodoGrafo)); n1->username = u2; n1->sig = grafo[i1]->amigos; grafo[i1]->amigos = n1;
    NodoGrafo* n2 = (NodoGrafo*)malloc(sizeof(NodoGrafo)); n2->username = u1; n2->sig = grafo[i2]->amigos; grafo[i2]->amigos = n2;
    cout << "Conexión " << u1 << " - " << u2 << endl;
}

void mostrar_grafo() {
    cout << "\n--- GRAFO ---" << endl;
    for (int i = 0; i < totalV; i++) {
        cout << grafo[i]->username << " -> ";
        for (NodoGrafo* a = grafo[i]->amigos; a; a = a->sig) cout << a->username << " ";
        cout << endl;
    }
}

#endif
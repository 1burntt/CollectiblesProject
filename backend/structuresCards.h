// backend/structuresCards.h
#ifndef STRUCTURESCARDS_H
#define STRUCTURESCARDS_H

#include <iostream>
#include <string>
#include <stdlib.h>

using namespace std;

// --- 1. Nodo para una LISTA DOBLEMENTE ENLAZADA ---
// Es como un eslabon de una cadena. Cada carta en el inventario sera un nodo.
// Tiene punteros al siguiente y al anterior, lo que permite moverse hacia adelante y atras en la lista.
typedef struct NodoCarta {
    string id;                // Identificador unico de la carta
    string nombre;            // Nombre de la carta
    string serie;             // Coleccion a la que pertenece
    string artista;           // Ilustrador de la carta
    string elemento;          // Tipo (Fuego, Agua, etc.)
    int hp;                   // Puntos de vida
    int numero;               // Numero de la carta dentro de la coleccion
    struct NodoCarta* sig;    // Puntero al SIGUIENTE nodo en la lista
    struct NodoCarta* ant;    // Puntero al ANTERIOR nodo en la lista
} NodoCarta;

// --- 2. Nodo para un ARBOL BINARIO ---
// Similar al nodo de lista, pero en lugar de apuntar a un solo "siguiente",
// apunta a dos "hijos": izquierdo y derecho.
typedef struct NodoArbol {
    int hp;                     // El valor por el que se ordena el arbol (los HP de las cartas)
    string nombreCarta;         // Nombre de la carta
    string idCarta;             // ID de la carta
    struct NodoArbol* izq;      // Hijo izquierdo (cartas con HP menor)
    struct NodoArbol* der;      // Hijo derecho (cartas con HP mayor o igual)
} NodoArbol;

// --- 3. Nodo para un GRAFO (Lista de adyacencia) ---
// Representa una "amistad" o conexion entre dos usuarios.
typedef struct NodoGrafo {
    string username;            // Nombre del usuario amigo
    struct NodoGrafo* sig;      // Puntero al siguiente amigo en la lista
} NodoGrafo;

// --- 4. Vertice de un GRAFO ---
// Representa a un usuario en el grafo de amigos. Cada usuario tiene una lista de amigos.
typedef struct Vertice {
    string username;            // Nombre del usuario
    NodoGrafo* amigos;          // Puntero a la lista de sus amigos (nodos NodoGrafo)
} Vertice;

#endif
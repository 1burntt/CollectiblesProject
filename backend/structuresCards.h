#ifndef STRUCTURESCARDS_H
#define STRUCTURESCARDS_H

#include <iostream>
#include <string>
#include <stdlib.h>
using namespace std;

// ----------------------------------------------------------------------
// Este es el molde para un NODO de una LISTA.
// Un nodo es como un eslabón de una cadena. Guarda una carta y apunta
// al siguiente y al anterior eslabón.
// ----------------------------------------------------------------------
typedef struct NodoCarta {
    string id;                // Identificador único de la carta
    string nombre;            // Nombre de la carta
    string serie;             // Serie a la que pertenece
    string artista;           // Artista que la dibujó
    string elemento;          // Tipo (fuego, agua, etc.)
    int hp;                   // Puntos de vida
    int numero;               // Número dentro de la serie
    struct NodoCarta* sig;    // Puntero al siguiente nodo
    struct NodoCarta* ant;    // Puntero al nodo anterior
} NodoCarta;

// ----------------------------------------------------------------------
// Molde para un NODO de un ÁRBOL.
// Un árbol es como un organigrama. Cada nodo tiene dos "hijos": izquierdo y derecho.
// ----------------------------------------------------------------------
typedef struct NodoArbol {
    int hp;                   // El valor por el que se ordena (HP)
    string nombreCarta;       // Nombre de la carta
    string idCarta;           // ID de la carta
    struct NodoArbol* izq;    // Hijo izquierdo (con HP menor)
    struct NodoArbol* der;    // Hijo derecho (con HP mayor)
} NodoArbol;

// ----------------------------------------------------------------------
// Molde para un NODO de un GRAFO.
// En el grafo, un nodo apunta a sus amigos (otros nodos).
// ----------------------------------------------------------------------
typedef struct NodoGrafo {
    string username;          // Nombre del usuario
    struct NodoGrafo* sig;    // Puntero al siguiente amigo
} NodoGrafo;

// ----------------------------------------------------------------------
// Molde para un VÉRTICE del GRAFO.
// Un vértice es un usuario, y tiene una lista de amigos.
// ----------------------------------------------------------------------
typedef struct Vertice {
    string username;          // Nombre del usuario
    NodoGrafo* amigos;        // Lista de amigos (apuntadores a otros vértices)
} Vertice;

#endif
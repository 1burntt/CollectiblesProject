#ifndef STRUCTURESCARDS_H
#define STRUCTURESCARDS_H

#include <iostream>
#include <string>
#include <stdlib.h>
using namespace std;

typedef struct NodoCarta {
    string id;
    string nombre;
    string serie;
    string artista;
    string elemento;
    int hp;
    int numero;
    struct NodoCarta* sig;
    struct NodoCarta* ant;
} NodoCarta;

typedef struct NodoArbol {
    int hp;
    string nombreCarta;
    string idCarta;
    struct NodoArbol* izq;
    struct NodoArbol* der;
} NodoArbol;

typedef struct NodoGrafo {
    string username;
    struct NodoGrafo* sig;
} NodoGrafo;

typedef struct Vertice {
    string username;
    NodoGrafo* amigos;
} Vertice;

#endif
#include "detailFunctions.h"

int main() {
    ListaInventario miInventario = {NULL, NULL, 0};
    PilaHistorial miHistorial = {NULL};
    ColaTrades misTrades = {NULL, NULL};
    NodoArbol* miCatalogo = NULL;

    int opcion; string id, nom, sol; int hp, idU;

    do {
        cout << "\n=== COLECCIONABLES (DEMO ESTRUCTURAS) ===";
        cout << "\n1. Agregar a Inventario (Lista)";
        cout << "\n2. Mostrar Inventario";
        cout << "\n3. Eliminar de Inventario";
        cout << "\n4. Agregar a Historial (Pila)";
        cout << "\n5. Mostrar Historial";
        cout << "\n6. Agregar Trade a Cola";
        cout << "\n7. Mostrar Cola de Trades";
        cout << "\n8. Insertar en Árbol (por HP)";
        cout << "\n9. Mostrar Árbol (Inorden)";
        cout << "\n10. Registrar Usuario (Hash)";
        cout << "\n11. Buscar Usuario (Hash)";
        cout << "\n12. Agregar Usuario al Grafo";
        cout << "\n13. Conectar Usuarios (Grafo)";
        cout << "\n14. Mostrar Grafo";
        cout << "\n0. Salir";
        cout << "\nOpción: "; cin >> opcion;

        switch(opcion) {
            case 1:
                cout << "ID: "; cin >> id;
                cout << "Nombre: "; cin.ignore(); getline(cin, nom);
                cout << "HP: "; cin >> hp;
                agregar_al_inventario(&miInventario, id, nom, hp);
                break;
            case 2: mostrar_inventario(&miInventario); break;
            case 3:
                cout << "ID a eliminar: "; cin >> id;
                eliminar_del_inventario(&miInventario, id);
                break;
            case 4:
                cout << "Nombre carta vista: "; cin.ignore(); getline(cin, nom);
                cout << "ID: "; cin >> id;
                push_historial(&miHistorial, nom, id);
                break;
            case 5: mostrar_historial(&miHistorial); break;
            case 6:
                cout << "Carta a tradear: "; cin.ignore(); getline(cin, nom);
                cout << "ID: "; cin >> id;
                cout << "Solicitante: "; cin.ignore(); getline(cin, sol);
                enqueue_trade(&misTrades, nom, id, sol);
                break;
            case 7: mostrar_cola(&misTrades); break;
            case 8:
                cout << "HP: "; cin >> hp;
                cout << "Nombre: "; cin.ignore(); getline(cin, nom);
                cout << "ID: "; cin >> id;
                miCatalogo = insertar_arbol(miCatalogo, hp, nom, id);
                break;
            case 9:
                cout << "\nÁrbol (Inorden):\n"; inorden(miCatalogo);
                break;
            case 10:
                cout << "ID usuario: "; cin >> idU;
                cout << "Username: "; cin.ignore(); getline(cin, nom);
                registrar_usuario(idU, nom);
                break;
            case 11:
                cout << "ID a buscar: "; cin >> idU;
                cout << "Usuario: " << buscar_usuario(idU) << endl;
                break;
            case 12:
                cout << "Username: "; cin.ignore(); getline(cin, nom);
                agregar_vertice(nom);
                break;
            case 13: {
                string u1, u2;
                cout << "Usuario 1: "; cin.ignore(); getline(cin, u1);
                cout << "Usuario 2: "; getline(cin, u2);
                conectar(u1, u2);
                break;
            }
            case 14: mostrar_grafo(); break;
        }
    } while(opcion != 0);

    return 0;
}
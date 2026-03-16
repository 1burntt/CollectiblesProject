// backend/main.cpp
#include "detailFunctions.h"

int main() {
    // --- 1. Creamos las instancias de nuestras estructuras de datos ---
    ListaInventario miInventario = {NULL, NULL, 0}; // Inventario (Lista)
    PilaHistorial miHistorial = {NULL};             // Historial (Pila)
    ColaTrades misTrades = {NULL, NULL};            // Cola de Trades (Cola)
    NodoArbol* miCatalogo = NULL;                   // Catalogo por HP (Arbol)

    int opcion;
    string id, nom, sol;
    int hp, idU;

    // --- 2. Menu principal ---
    do {
        cout << "\n=== COLECCIONABLES (DEMO DE ESTRUCTURAS) ===";
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
        cout << "\nOpción: ";
        cin >> opcion;

        // --- 3. Switch para manejar la opcion elegida ---
        switch(opcion) {
            case 1: // Agregar a Inventario
                cout << "ID de la carta: "; cin >> id;
                cout << "Nombre: "; cin.ignore(); getline(cin, nom);
                cout << "HP: "; cin >> hp;
                agregar_al_inventario(&miInventario, id, nom, hp);
                break;

            case 2: // Mostrar Inventario
                mostrar_inventario(&miInventario);
                break;

            case 3: // Eliminar de Inventario
                cout << "ID de la carta a eliminar: "; cin >> id;
                eliminar_del_inventario(&miInventario, id);
                break;

            case 4: // Agregar a Historial (Pila)
                cout << "Nombre de la carta vista: "; cin.ignore(); getline(cin, nom);
                cout << "ID de la carta: "; cin >> id;
                push_historial(&miHistorial, nom, id);
                break;

            case 5: // Mostrar Historial
                mostrar_historial(&miHistorial);
                break;

            case 6: // Agregar Trade a Cola
                cout << "Carta a tradear: "; cin.ignore(); getline(cin, nom);
                cout << "ID: "; cin >> id;
                cout << "Quien la solicita: "; cin.ignore(); getline(cin, sol);
                enqueue_trade(&misTrades, nom, id, sol);
                break;

            case 7: // Mostrar Cola de Trades
                mostrar_cola(&misTrades);
                break;

            case 8: // Insertar en Arbol
                cout << "HP de la carta: "; cin >> hp;
                cout << "Nombre: "; cin.ignore(); getline(cin, nom);
                cout << "ID: "; cin >> id;
                miCatalogo = insertar_arbol(miCatalogo, hp, nom, id);
                break;

            case 9: // Mostrar Arbol (Inorden)
                cout << "\nÁrbol ordenado por HP (de menor a mayor):\n";
                inorden(miCatalogo);
                break;

            case 10: // Registrar Usuario (Hash)
                cout << "ID del usuario: "; cin >> idU;
                cout << "Nombre de usuario: "; cin.ignore(); getline(cin, nom);
                registrar_usuario(idU, nom);
                break;

            case 11: // Buscar Usuario (Hash)
                cout << "ID a buscar: "; cin >> idU;
                cout << "Usuario: " << buscar_usuario(idU) << endl;
                break;

            case 12: // Agregar Usuario al Grafo
                cout << "Nombre de usuario: "; cin.ignore(); getline(cin, nom);
                agregar_vertice(nom);
                break;

            case 13: { // Conectar Usuarios (Grafo)
                string u1, u2;
                cout << "Usuario 1: "; cin.ignore(); getline(cin, u1);
                cout << "Usuario 2: "; getline(cin, u2);
                conectar(u1, u2);
                break;
            }

            case 14: // Mostrar Grafo
                mostrar_grafo();
                break;

            case 0: // Salir
                cout << "Saliendo del programa..." << endl;
                break;

            default:
                cout << "Opcion no valida. Intenta de nuevo." << endl;
        }

    } while(opcion != 0);

    return 0;
}
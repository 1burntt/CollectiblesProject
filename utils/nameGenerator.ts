// utils/nameGenerator.ts

// 1. Una lista enorme de nombres para elegir
const nombres = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer",
  "Michael", "Linda", "William", "Elizabeth", "David", "Susan",
  "Richard", "Jessica", "Joseph", "Sarah", "Thomas", "Karen",
  "Christopher", "Nancy", "Charles", "Lisa", "Daniel", "Betty",
  "Matthew", "Helen", "Anthony", "Sandra", "Donald", "Donna",
  "Mark", "Carol", "Paul", "Ruth", "Steven", "Sharon",
  "Andrew", "Michelle", "Kenneth", "Laura", "Joshua", "Amanda",
  "Kevin", "Melissa", "Brian", "Deborah", "George", "Stephanie",
  "Zack", "Sasha", "Emily", "Tyler", "Megan", "Cody",
  "Alex", "Jordan", "Casey", "Taylor", "Morgan", "Riley",
  "Jesse", "Jamie", "Frankie", "Sam", "Chris", "Pat"
];

// 2. La funcion que escoge un nombre al azar
export const generarNombreUsuario = (): string => {
  // Math.random() da un numero entre 0 y 1.
  // Lo multiplicamos por la cantidad de nombres para obtener un indice al azar.
  // Math.floor redondea hacia abajo para obtener un numero entero.
  const indiceAleatorio = Math.floor(Math.random() * nombres.length);
  // Devolvemos el nombre que este en esa posicion.
  return nombres[indiceAleatorio];
};
// Una lista de nombres de personas
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

// Función que elige un nombre al azar de la lista
export const generarNombreUsuario = (): string => {
  return nombres[Math.floor(Math.random() * nombres.length)];
};
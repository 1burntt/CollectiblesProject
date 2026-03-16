// components/ThemedText.tsx
import { StyleSheet, Text, TextProps } from 'react-native';

// Definimos los tipos de texto que podemos usar
interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle'; // Puede ser normal, titulo o subtitulo
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  // Aplicamos el estilo que corresponda segun el 'type' que nos hayan pedido
  return <Text style={[styles[type], style]} {...props} />;
}

// Aqui definimos como se ve cada tipo de texto
const styles = StyleSheet.create({
  default: { color: 'white' },            // Texto normal, color blanco
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' }, // Titulo grande y negrita
  subtitle: { color: 'white', fontSize: 18, fontWeight: '600' }, // Subtitulo mediano
});
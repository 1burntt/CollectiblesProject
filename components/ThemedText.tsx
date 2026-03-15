import { StyleSheet, Text, TextProps } from 'react-native';

// Definimos los tipos de texto que podemos usar
interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle'; // Puede ser normal, título o subtítulo
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  // Aplicamos el estilo según el tipo que nos pidan
  return <Text style={[styles[type], style]} {...props} />;
}

const styles = StyleSheet.create({
  default: { color: 'white' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: 'white', fontSize: 18, fontWeight: '600' },
});
import { Text, TextProps, StyleSheet } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle';
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  return <Text style={[styles[type], style]} {...props} />;
}

const styles = StyleSheet.create({
  default: { color: 'white' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: 'white', fontSize: 18, fontWeight: '600' },
});
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    height: 300,
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={[styles.container, this.props.style]}>
          <Text style={styles.title}>{this.props.title || 'Algo deu errado'}</Text>
          <Text style={styles.text}>
            {this.props.message || 'Não foi possível carregar este conteúdo.'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

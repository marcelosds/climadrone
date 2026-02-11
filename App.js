import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import logger from './src/utils/logger';
import Constants from 'expo-constants';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  useEffect(() => {
    logger.info('App', 'Inicialização iniciada');
    logger.success('App', 'Config carregada', {
      projectId: Constants?.expoConfig?.extra?.eas?.projectId,
      scheme: Constants?.expoConfig?.scheme,
      debug: Constants?.expoConfig?.extra?.debug
    });
  }, []);
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <ErrorBoundary
          fallback={
            <View style={styles.fallback}>
              <Text style={styles.title}>Falha ao iniciar o aplicativo</Text>
              <Text style={styles.text}>Tente abrir novamente. Se persistir, reinstale a versão preview.</Text>
            </View>
          }
        >
          <AppNavigator />
        </ErrorBoundary>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
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

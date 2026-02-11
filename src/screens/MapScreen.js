import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useWeather } from '../hooks/useWeather';
import { useApp } from '../contexts/AppContext';
import FlightMap from '../components/FlightMap';
import AppHeader from '../components/AppHeader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { COLORS } from '../constants';

const MapScreen = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { weatherData, location, refreshing, refreshWeather } = useWeather();
  const { loading, error, clearError } = useApp();
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!location) {
      refreshWeather();
    }
  }, []);

  // Montar o mapa quando tivermos localização
  useEffect(() => {
    if (location) {
      const t = setTimeout(() => setMapReady(true), 100);
      return () => clearTimeout(t);
    } else {
      setMapReady(false);
    }
  }, [location]);

  const onRefresh = () => {
    clearError();
    refreshWeather();
  };

  if (loading && !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando mapa e localização...</Text>
      </View>
    );
  }

  if (error && !location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext} onPress={onRefresh}>
          Toque para tentar novamente
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Localização não disponível</Text>
        <Text style={styles.emptySubtext} onPress={onRefresh}>
          Toque para atualizar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Mapa de Voo" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 20) + 70, // Tab bar height (60) + safe area + extra padding
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            {weatherData?.location.name}, {weatherData?.location.country}
          </Text>
        </View>

        {location && mapReady ? (
          <ErrorBoundary
            title="Mapa indisponível"
            message="O mapa não pôde ser carregado. Use um build nativo (development build) com react-native-maps configurado."
            fallback={
              <View style={styles.mapFallback}>
                <Text style={styles.mapFallbackTitle}>Mapa indisponível</Text>
                <Text style={styles.mapFallbackText}>
                  Para ver o mapa, use o app via Development Build (não Expo Go).
                </Text>
              </View>
            }
          >
            <FlightMap
              ref={mapRef}
              location={location}
              windDirection={weatherData?.windDirection || 0}
              windSpeed={weatherData?.windSpeed || 0}
            />
          </ErrorBoundary>
        ) : location && !mapReady ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>Carregando mapa...</Text>
          </View>
        ) : null}

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            As informações de espaço aéreo são auxiliares. O piloto é responsável por verificar o voo junto ao DECEA/SARPAS.
          </Text>
        </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legenda</Text>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(14, 165, 233, 0.25)', borderColor: '#0ea5e9', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Área de Operação do Drone</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(245, 158, 11, 0.22)', borderColor: '#f59e0b', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Zona de Aviso - Aeroporto</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(220, 38, 38, 0.28)', borderColor: '#b91c1c', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Zona de Controle (CTR) / Zona de Tráfego de Aeródromo (ATZ)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(249, 115, 22, 0.30)', borderColor: '#c2410c', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Restrita (R)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(153, 27, 27, 0.32)', borderColor: '#7f1d1d', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Proibida (P)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(234, 179, 8, 0.28)', borderColor: '#d97706', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Perigosa (D)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(59, 130, 246, 0.24)', borderColor: '#1d4ed8', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Outros</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (!location) return;
            const lat = Number(location.latitude);
            const lon = Number(location.longitude);
            if (isNaN(lat) || isNaN(lon)) return;
            mapRef.current?.animateToRegion(
              {
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              },
              500
            );
          }}
        >
          <Text style={styles.controlButtonText}>Centralizar Localização</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, refreshing && { opacity: 0.7 }]}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <Text style={styles.controlButtonText}>Atualizar Dados</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  disclaimerContainer: {
    marginHorizontal: 16,
    marginTop: 6
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  scrollView: {
    flex: 1,
  },
  subtitleContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  legendContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.text,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  controlButton: {
    backgroundColor: COLORS.conditionsAccent,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  controlButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  mapPlaceholder: {
    height: 300,
    margin: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  mapFallback: {
    height: 300,
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mapFallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  mapFallbackText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default MapScreen;

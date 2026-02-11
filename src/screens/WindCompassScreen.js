import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWeather } from '../hooks/useWeather';
import { useApp } from '../contexts/AppContext';
import WindCompass from '../components/WindCompass';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../constants';
import * as Location from 'expo-location';
import axios from 'axios';
import Constants from 'expo-constants';

const WindCompassScreen = () => {
  const insets = useSafeAreaInsets();
  const { weatherData, refreshing, refreshWeather, convertWindSpeed, getWindDirectionText, settings } = useWeather();
  const { loading, error, clearError } = useApp();
  const [heading, setHeading] = useState(0);
  const [isFixed, setIsFixed] = useState(true);
  const [addressLine, setAddressLine] = useState(null);

  useEffect(() => {
    if (!weatherData) {
      refreshWeather();
    }
  }, []);

  useEffect(() => {
    let sub = null;
    if (!isFixed) {
      Location.watchHeadingAsync((h) => {
        const deg = h?.trueHeading ?? h?.magHeading ?? 0;
        setHeading(deg);
      }).then((subscription) => {
        sub = subscription;
      }).catch(() => {});
    }
    return () => {
      if (sub) {
        sub.remove();
      }
    };
  }, [isFixed]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const key = Constants?.expoConfig?.extra?.googleMapsApiKey;
        if (!key || !weatherData?.location?.lat) return;
        const { lat, lon } = weatherData.location;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${key}&language=pt-BR`;
        const res = await axios.get(url);
        const result = res.data?.results?.[0];
        if (result?.address_components) {
          const route = result.address_components.find((c) => c.types.includes('route'));
          const locality = result.address_components.find((c) => c.types.includes('sublocality') || c.types.includes('neighborhood'));
          const street = route?.short_name || route?.long_name;
          const area = locality?.short_name || locality?.long_name;
          const formatted = street ? `${street}${area ? `, ${area}` : ''}` : result.formatted_address;
          setAddressLine(formatted);
        }
      } catch {}
    };
    fetchAddress();
  }, [weatherData?.location?.lat, weatherData?.location?.lon]);

  const onRefresh = () => {
    clearError();
    refreshWeather();
  };

  if (loading && !weatherData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando dados do vento...</Text>
      </View>
    );
  }

  if (error && !weatherData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext} onPress={onRefresh}>
          Toque para tentar novamente
        </Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum dado disponível</Text>
        <Text style={styles.emptySubtext} onPress={onRefresh}>
          Toque para atualizar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Bússola do Vento" />
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
            {addressLine || weatherData.location.name}, {weatherData.location.country}
          </Text>
        </View>

      <WindCompass
        windSpeed={weatherData.windSpeed}
        windDirection={weatherData.windDirection}
        windGust={weatherData.windGust}
        unit={settings.windSpeedUnit}
        convertWindSpeed={convertWindSpeed}
        heading={heading}
        isFixed={isFixed}
      />

      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => setIsFixed((v) => !v)}
          style={{ backgroundColor: COLORS.conditionsAccent, borderRadius: 8, padding: 12, alignItems: 'center' }}
        >
          <Text style={{ color: COLORS.surface, fontSize: 16, fontWeight: '600' }}>
            {isFixed ? 'Bússola móvel' : 'Fixar bússola'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.additionalInfo}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Direção do Vento</Text>
          <Text style={styles.infoValue}>
            {Math.round(weatherData.windDirection)}° {getWindDirectionText(weatherData.windDirection)}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Velocidade Convertida</Text>
          <Text style={styles.infoValue}>
            {convertWindSpeed(weatherData.windSpeed)} {settings.windSpeedUnit}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Última Atualização</Text>
          <Text style={styles.infoValue}>
            {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>
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
    color: COLORS.conditionsAccent,
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
    color: COLORS.conditionsAccent,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  additionalInfo: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default WindCompassScreen;

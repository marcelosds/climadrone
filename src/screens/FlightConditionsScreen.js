import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWeather } from '../hooks/useWeather';
import { useApp } from '../contexts/AppContext';
import FlightConditionCard from '../components/FlightConditionCard';
import HourlyForecastTimeline from '../components/HourlyForecastTimeline';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../constants';
import { groupForecastByDay, getDayTabs, calculateDayAverage } from '../utils/forecastUtils';
import axios from 'axios';
import Constants from 'expo-constants';

const FlightConditionsScreen = () => {
  const insets = useSafeAreaInsets();
  const { weatherData, refreshing, refreshWeather, convertTemperature, convertVisibility, convertWindSpeed, getWindDirectionText } = useWeather();
  const { settings, loading, error, clearError } = useApp();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [addressLine, setAddressLine] = useState(null);

  useEffect(() => {
    if (!weatherData) {
      refreshWeather();
    }
  }, []);

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
  // Agrupar forecast por dia
  const forecastByDay = useMemo(() => {
    if (!weatherData?.forecast) return {};
    return groupForecastByDay(weatherData.forecast);
  }, [weatherData?.forecast]);

  // Obter abas de dias
  const dayTabs = useMemo(() => getDayTabs(), []);

  // Obter dados do dia selecionado
  const selectedDayData = useMemo(() => {
    const selectedTab = dayTabs[selectedDayIndex];
    
    if (selectedDayIndex === 0) {
      // Hoje - usar dados atuais
      return weatherData;
    } else {
      // Amanhã ou depois - usar forecast agrupado
      const dayForecast = forecastByDay[selectedTab.dateKey];
      if (!dayForecast || dayForecast.length === 0) {
        return null;
      }
      const dayAverage = calculateDayAverage(dayForecast);
      if (!dayAverage) return null;
      
      // Criar objeto compatível com FlightConditionCard
      return {
        ...dayAverage,
        location: weatherData?.location || dayAverage.location,
        sunrise: weatherData?.sunrise, // Manter sunrise/sunset do dia atual
        sunset: weatherData?.sunset,
      };
    }
  }, [selectedDayIndex, weatherData, forecastByDay, dayTabs]);

  const onRefresh = () => {
    clearError();
    refreshWeather();
  };

  if (loading && !weatherData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando condições de voo...</Text>
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

  const displayData = selectedDayData || weatherData;
  const selectedTab = dayTabs[selectedDayIndex];

  return (
    <View style={styles.container}>
      <AppHeader title="Condições de Voo" />
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          {addressLine || weatherData.location.name}, {weatherData.location.country}
        </Text>
      </View>

      {/* Abas de dias */}
      <View style={styles.tabsContainer}>
        {dayTabs.map((tab, index) => {
          const isSelected = selectedDayIndex === index;
          const hasData = index === 0 || forecastByDay[tab.dateKey]?.length > 0;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                isSelected && styles.tabSelected,
                !hasData && styles.tabDisabled
              ]}
              onPress={() => hasData && setSelectedDayIndex(index)}
              disabled={!hasData}
            >
              <Text style={[
                styles.tabText,
                isSelected && styles.tabTextSelected,
                !hasData && styles.tabTextDisabled
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 20) + 70, // Tab bar height (60) + safe area + extra padding
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!selectedDayData && selectedDayIndex > 0 ? (
          <View style={styles.emptyDayContainer}>
            <Text style={styles.emptyDayText}>
              Dados não disponíveis para {selectedTab.label.toLowerCase()}
            </Text>
          </View>
        ) : (
          <>
            <FlightConditionCard weatherData={displayData} settings={settings} convertWindSpeed={convertWindSpeed} />

            {/* Linha do tempo com previsão horária */}
            {weatherData?.forecast && (
              <HourlyForecastTimeline
                forecast={weatherData.forecast}
                selectedDayIndex={selectedDayIndex}
                weatherData={selectedDayIndex === 0 ? weatherData : null}
                convertTemperature={convertTemperature}
                convertWindSpeed={convertWindSpeed}
                getWindDirectionText={getWindDirectionText}
                windSpeedUnit={settings.windSpeedUnit}
              />
            )}

            <View style={styles.weatherDetails}>
              <Text style={styles.sectionTitle}>Detalhes do Tempo</Text>
              
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Temperatura</Text>
                  <Text style={styles.detailValue}>
                    {convertTemperature(displayData.temperature)}°
                    {settings.temperatureUnit === 'celsius' ? 'C' : 'F'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Umidade</Text>
                  <Text style={styles.detailValue}>{displayData.humidity}%</Text>
                </View>
                
                {displayData.pressure && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Pressão</Text>
                    <Text style={styles.detailValue}>{displayData.pressure} hPa</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cobertura de Nuvens</Text>
                  <Text style={styles.detailValue}>{displayData.clouds}%</Text>
                </View>
                
                {displayData.visibility && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Visibilidade</Text>
                    <Text style={styles.detailValue}>
                      {convertVisibility(displayData.visibility)} {settings.visibilityUnit}
                    </Text>
                  </View>
                )}
              </View>

              {displayData.sunrise && displayData.sunset && (
                <View style={styles.sunTimesCard}>
                  <View style={styles.sunTimeRow}>
                    <Text style={styles.sunTimeLabel}>Nascer do Sol</Text>
                    <Text style={styles.sunTimeValue}>
                      {displayData.sunrise.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  
                  <View style={styles.sunTimeRow}>
                    <Text style={styles.sunTimeLabel}>Pôr do Sol</Text>
                    <Text style={styles.sunTimeValue}>
                      {displayData.sunset.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: COLORS.conditionsAccent,
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  tabTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  tabTextDisabled: {
    color: COLORS.textSecondary,
  },
  emptyDayContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  subtitleContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  weatherDetails: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderColor: COLORS.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sunTimesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderColor: COLORS.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sunTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sunTimeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sunTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FlightConditionsScreen;

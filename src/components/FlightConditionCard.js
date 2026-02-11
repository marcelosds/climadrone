import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { assessFlightConditions } from '../utils/flightAssessment';

const FlightConditionCard = ({ weatherData, settings, convertWindSpeed }) => {
  if (!weatherData) return null;

  // Garantir que os dados tenham os campos necessários
  const safeWeatherData = {
    windSpeed: weatherData.windSpeed || 0,
    windGust: weatherData.windGust || 0,
    windDirection: weatherData.windDirection || 0,
    visibility: weatherData.visibility || 10,
    clouds: weatherData.clouds || 0,
    weather: weatherData.weather || { main: 'Clear', description: 'Céu limpo' },
    ...weatherData
  };

  const assessment = assessFlightConditions(safeWeatherData, settings, settings.droneModel);
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return (
    <View style={[styles.container, { borderColor: assessment.color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{assessment.icon}</Text>
        <Text style={[styles.status, { color: assessment.color }]}>
          {assessment.message}
        </Text>
      </View>
      <Text style={styles.timeText}>Agora: {hh}:{mm}</Text>

      {assessment.issues.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Problemas detectados:</Text>
          {assessment.issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>• {issue}</Text>
          ))}
        </View>
      )}

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vento:</Text>
          <Text style={styles.detailValue}>
            {convertWindSpeed ? convertWindSpeed(assessment.details.windSpeed) : Math.round(assessment.details.windSpeed)} {settings.windSpeedUnit || 'km/h'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rajadas:</Text>
          <Text style={styles.detailValue}>
            {convertWindSpeed ? convertWindSpeed(assessment.details.windGust) : Math.round(assessment.details.windGust)} {settings.windSpeedUnit || 'km/h'}
          </Text>
        </View>
        {assessment.details.visibility !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Visibilidade:</Text>
            <Text style={styles.detailValue}>
              {assessment.details.visibility.toFixed(1)} km
            </Text>
          </View>
        )}
        {assessment.details.weather && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tempo:</Text>
            <Text style={styles.detailValue}>
              {assessment.details.weather.description || 'N/A'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12
  },
  issuesContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  issueText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
});

export default FlightConditionCard;

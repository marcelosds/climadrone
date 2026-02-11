import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants';

const HourlyForecastTimeline = ({ forecast, selectedDayIndex, weatherData, convertTemperature, convertWindSpeed, getWindDirectionText, windSpeedUnit }) => {
  // Filtrar e interpolar previsões para o dia selecionado até 23:59 (a cada 1 hora)
  const hourlyForecast = useMemo(() => {
    if (!forecast || !Array.isArray(forecast)) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    let targetDate;
    if (selectedDayIndex === 0) {
      targetDate = today;
    } else if (selectedDayIndex === 1) {
      targetDate = tomorrow;
    } else {
      targetDate = dayAfterTomorrow;
    }

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Filtrar previsões do dia selecionado
    let dayForecast = forecast.filter((item) => {
      const itemDate = new Date(item.time);
      return itemDate >= targetDate && itemDate <= endOfDay;
    });

    // Se for hoje, adicionar dados atuais no início se disponível
    if (selectedDayIndex === 0 && weatherData) {
      const currentHour = new Date();
      currentHour.setMinutes(0, 0, 0);
      
      // Verificar se já não existe uma previsão para a hora atual
      const hasCurrentHour = dayForecast.some((item) => {
        const itemDate = new Date(item.time);
        return itemDate.getHours() === currentHour.getHours() && 
               itemDate.getDate() === currentHour.getDate();
      });

      if (!hasCurrentHour) {
        dayForecast.unshift({
          time: currentHour,
          temperature: weatherData.temperature,
          windSpeed: weatherData.windSpeed,
          windDirection: weatherData.windDirection,
          windGust: weatherData.windGust || 0,
          humidity: weatherData.humidity,
          clouds: weatherData.clouds,
          weather: weatherData.weather,
          visibility: weatherData.visibility,
        });
      }
    }

    // Ordenar por hora
    dayForecast = dayForecast.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Interpolar para criar previsões a cada 1 hora
    const hourlyData = [];
    const startHour = selectedDayIndex === 0 ? now.getHours() : 0;
    
    for (let hour = startHour; hour <= 23; hour++) {
      const targetTime = new Date(targetDate);
      targetTime.setHours(hour, 0, 0, 0);
      
      // Encontrar a previsão mais próxima ou interpolar entre duas
      let closest = null;
      let before = null;
      let after = null;
      
      dayForecast.forEach((item) => {
        const itemTime = new Date(item.time);
        const diff = Math.abs(itemTime.getTime() - targetTime.getTime());
        
        if (!closest || diff < Math.abs(new Date(closest.time).getTime() - targetTime.getTime())) {
          closest = item;
        }
        
        if (itemTime <= targetTime && (!before || itemTime > new Date(before.time))) {
          before = item;
        }
        
        if (itemTime >= targetTime && (!after || itemTime < new Date(after.time))) {
          after = item;
        }
      });

      let interpolated;
      if (before && after && before !== after) {
        // Interpolar entre dois pontos
        const beforeTime = new Date(before.time).getTime();
        const afterTime = new Date(after.time).getTime();
        const targetTimeMs = targetTime.getTime();
        const ratio = (targetTimeMs - beforeTime) / (afterTime - beforeTime);
        
        interpolated = {
          time: targetTime,
          temperature: Math.round(before.temperature + (after.temperature - before.temperature) * ratio),
          windSpeed: before.windSpeed + (after.windSpeed - before.windSpeed) * ratio,
          windDirection: before.windDirection + (after.windDirection - before.windDirection) * ratio,
          windGust: (before.windGust || 0) + ((after.windGust || 0) - (before.windGust || 0)) * ratio,
          humidity: Math.round(before.humidity + (after.humidity - before.humidity) * ratio),
          clouds: Math.round(before.clouds + (after.clouds - before.clouds) * ratio),
          visibility: (before.visibility || 10) + ((after.visibility || 10) - (before.visibility || 10)) * ratio,
          pressure: Math.round((before.pressure || 1013) + ((after.pressure || 1013) - (before.pressure || 1013)) * ratio),
          weather: ratio < 0.5 ? before.weather : after.weather, // Usar o mais próximo
        };
      } else if (closest) {
        // Usar o mais próximo
        interpolated = {
          ...closest,
          time: targetTime,
        };
      } else {
        continue; // Pular se não houver dados
      }
      
      hourlyData.push(interpolated);
    }

    return hourlyData;
  }, [forecast, selectedDayIndex, weatherData]);

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
    };
    return icons[weatherMain] || '🌤️';
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentHour = (date) => {
    if (selectedDayIndex !== 0) return false;
    const now = new Date();
    const itemDate = new Date(date);
    return now.getHours() === itemDate.getHours() && 
           now.getDate() === itemDate.getDate();
  };

  if (hourlyForecast.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma previsão horária disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previsão Horária</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourlyForecast.map((item, index) => {
          const isCurrent = isCurrentHour(item.time);
          return (
            <View 
              key={index} 
              style={[
                styles.hourCard,
                isCurrent && styles.hourCardCurrent
              ]}
            >
              <Text style={[styles.timeText, isCurrent && styles.timeTextCurrent]}>
                {formatTime(item.time)}
              </Text>
              {isCurrent && (
                <Text style={styles.currentLabel}>Agora</Text>
              )}
              <Text style={styles.weatherIcon}>
                {getWeatherIcon(item.weather?.main)}
              </Text>
              <Text style={styles.temperatureText}>
                {convertTemperature(item.temperature)}°
              </Text>
              <View style={styles.windContainer}>
                <Text style={styles.windSpeed}>
                  {convertWindSpeed(item.windSpeed)}
                </Text>
                <Text style={styles.windUnit}>
                  {windSpeedUnit || 'km/h'}
                </Text>
              </View>
              <Text style={styles.windDirection}>
                {getWindDirectionText(item.windDirection)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  hourCard: {
    width: 90,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hourCardCurrent: {
    backgroundColor: COLORS.conditionsAccent,
    borderWidth: 2,
    borderColor: COLORS.conditionsAccent,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timeTextCurrent: {
    color: COLORS.surface,
  },
  currentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.surface,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  weatherIcon: {
    fontSize: 24,
    marginVertical: 8,
  },
  temperatureText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  windContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  windSpeed: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  windUnit: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  windDirection: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default HourlyForecastTimeline;

/**
 * Agrupa dados de forecast por dia
 * @param {Array} forecast - Array de previsões horárias
 * @returns {Object} Objeto com chaves sendo as datas e valores sendo arrays de previsões
 */
export const groupForecastByDay = (forecast) => {
  if (!forecast || !Array.isArray(forecast)) {
    return {};
  }

  const grouped = {};
  
  forecast.forEach((item) => {
    const date = new Date(item.time);
    const dateKey = date.toDateString(); // Formato: "Mon Jan 01 2024"
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(item);
  });

  return grouped;
};

/**
 * Formata o nome do dia da semana em português (ex: "Sexta-feira")
 */
const getWeekdayName = (date) => {
  return date.toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase());
};

/**
 * Obtém a data de hoje, amanhã e depois de amanhã
 * @returns {Array} Array com objetos contendo label e dateKey
 */
export const getDayTabs = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  return [
    {
      label: 'Hoje',
      dateKey: today.toDateString(),
      date: today,
      index: 0
    },
    {
      label: getWeekdayName(tomorrow),
      dateKey: tomorrow.toDateString(),
      date: tomorrow,
      index: 1
    },
    {
      label: getWeekdayName(dayAfterTomorrow),
      dateKey: dayAfterTomorrow.toDateString(),
      date: dayAfterTomorrow,
      index: 2
    }
  ];
};

/**
 * Calcula dados médios para um dia baseado nas previsões horárias
 * @param {Array} dayForecast - Array de previsões para um dia específico
 * @returns {Object} Objeto com dados médios do dia
 */
export const calculateDayAverage = (dayForecast) => {
  if (!dayForecast || dayForecast.length === 0) {
    return null;
  }

  const averages = {
    temperature: 0,
    windSpeed: 0,
    windGust: 0,
    windDirection: 0,
    humidity: 0,
    clouds: 0,
    visibility: 0,
    weather: null,
    pressure: 0,
    times: []
  };

  let totalWindDirectionSin = 0;
  let totalWindDirectionCos = 0;

  dayForecast.forEach((item) => {
    averages.temperature += item.temperature || 0;
    averages.windSpeed += item.windSpeed || 0;
    averages.windGust += item.windGust || 0;
    averages.humidity += item.humidity || 0;
    averages.clouds += item.clouds || 0;
    averages.visibility += item.visibility || 10; // Default 10km if not available
    averages.pressure += item.pressure || 1013; // Default sea level pressure
    averages.times.push(item.time);

    // Calcular direção média do vento usando vetores
    const rad = (item.windDirection * Math.PI) / 180;
    totalWindDirectionSin += Math.sin(rad);
    totalWindDirectionCos += Math.cos(rad);
  });

  const count = dayForecast.length;
  averages.temperature = Math.round(averages.temperature / count);
  averages.windSpeed = averages.windSpeed / count;
  averages.windGust = averages.windGust / count;
  averages.humidity = Math.round(averages.humidity / count);
  averages.clouds = Math.round(averages.clouds / count);
  averages.visibility = averages.visibility / count || 10; // Ensure minimum visibility
  averages.pressure = Math.round(averages.pressure / count) || 1013;

  // Calcular direção média do vento
  const avgSin = totalWindDirectionSin / count;
  const avgCos = totalWindDirectionCos / count;
  let avgDirection = Math.atan2(avgSin, avgCos) * (180 / Math.PI);
  if (avgDirection < 0) avgDirection += 360;
  averages.windDirection = Math.round(avgDirection);

  // Pegar o clima mais comum (moda)
  const weatherCounts = {};
  dayForecast.forEach((item) => {
    const key = item.weather?.main || 'Unknown';
    weatherCounts[key] = (weatherCounts[key] || 0) + 1;
  });
  const mostCommonWeather = Object.keys(weatherCounts).reduce((a, b) =>
    weatherCounts[a] > weatherCounts[b] ? a : b
  );
  const mostCommonWeatherItem = dayForecast.find(
    (item) => item.weather?.main === mostCommonWeather
  );
  averages.weather = mostCommonWeatherItem?.weather || dayForecast[0].weather;

  // Adicionar dados de localização se disponíveis (do primeiro item)
  if (dayForecast[0].location) {
    averages.location = dayForecast[0].location;
  }

  return averages;
};

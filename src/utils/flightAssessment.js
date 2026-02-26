import { FLIGHT_CONDITIONS, DRONE_MODELS } from '../constants/index.js';

export const assessFlightConditions = (weatherData, settings, droneModel) => {
  const droneLimits = DRONE_MODELS[droneModel] || DRONE_MODELS['DJI Mini 4K'];
  
  let score = 0;
  let issues = [];

  // Wind speed assessment (high weight)
  if (weatherData.windSpeed > droneLimits.maxWindSpeed) {
    score -= 3;
    issues.push(`Vento acima do limite (${Math.round(weatherData.windSpeed)} km/h)`);
  } else if (weatherData.windSpeed > droneLimits.maxWindSpeed * 0.8) {
    score -= 1;
    issues.push(`Vento próximo ao limite`);
  }

  // Wind gusts assessment (very high weight)
  if (weatherData.windGust > droneLimits.maxGustSpeed) {
    score -= 4;
    issues.push(`Rajadas acima do limite (${Math.round(weatherData.windGust)} km/h)`);
  } else if (weatherData.windGust > droneLimits.maxGustSpeed * 0.8) {
    score -= 2;
    issues.push(`Rajadas próximas ao limite`);
  }

  // Visibility assessment
  if (weatherData.visibility < droneLimits.minVisibility) {
    score -= 2;
    issues.push(`Visibilidade baixa (${weatherData.visibility.toFixed(1)} km)`);
  } else if (weatherData.visibility < droneLimits.minVisibility * 1.5) {
    score -= 1;
    issues.push(`Visibilidade reduzida`);
  }

  // Precipitation assessment
  if (weatherData.weather.main === 'Rain' || weatherData.weather.main === 'Drizzle') {
    score -= 2;
    issues.push('Chuva leve');
  } else if (weatherData.weather.main === 'Thunderstorm') {
    score -= 4;
    issues.push('Tempestade');
  }

  // Cloud coverage assessment
  if (weatherData.clouds > 90) {
    score -= 1;
    issues.push('Cobertura de nuvens muito alta');
  }

  // Geomagnetic activity (Kp index) assessment
  const kp = typeof weatherData.kpIndex === 'number' ? weatherData.kpIndex : null;
  if (kp !== null) {
    if (kp >= 5) {
      score -= 3;
      issues.push(`Atividade geomagnética alta (Kp ${kp.toFixed?.(1) ?? kp})`);
    } else if (kp >= 3) {
      score -= 1;
      issues.push(`Atividade geomagnética moderada (Kp ${kp.toFixed?.(1) ?? kp})`);
    }
  }

  // Determine flight condition based on score
  let condition;
  let color;
  let icon;
  let message;

  if (score <= -4) {
    condition = FLIGHT_CONDITIONS.NOT_RECOMMENDED;
    color = '#ef4444';
    icon = '🔴';
    message = 'Voo não recomendado';
  } else if (score <= -1) {
    condition = FLIGHT_CONDITIONS.CAUTION;
    color = '#f59e0b';
    icon = '🟡';
    message = 'Voo com atenção';
  } else {
    condition = FLIGHT_CONDITIONS.GOOD;
    color = '#10b981';
    icon = '🟢';
    message = 'Boas condições para voo';
  }

  // Force severity based on Kp classification (if present)
  if (kp !== null) {
    if (kp >= 5) {
      condition = FLIGHT_CONDITIONS.NOT_RECOMMENDED;
      color = '#ef4444';
      icon = '🔴';
      message = 'Voo não recomendado';
    } else if (kp >= 3 && condition === FLIGHT_CONDITIONS.GOOD) {
      condition = FLIGHT_CONDITIONS.CAUTION;
      color = '#f59e0b';
      icon = '🟡';
      message = 'Voo com atenção';
    }
  }

  return {
    condition,
    color,
    icon,
    message,
    score,
    issues,
    details: {
      windSpeed: weatherData.windSpeed,
      windGust: weatherData.windGust,
      windDirection: weatherData.windDirection,
      visibility: weatherData.visibility,
      clouds: weatherData.clouds,
      weather: weatherData.weather,
      temperature: weatherData.temperature
    }
  };
};

export const getFlightConditionColor = (condition) => {
  switch (condition) {
    case FLIGHT_CONDITIONS.GOOD:
      return '#10b981';
    case FLIGHT_CONDITIONS.CAUTION:
      return '#f59e0b';
    case FLIGHT_CONDITIONS.NOT_RECOMMENDED:
      return '#ef4444';
    default:
      return '#64748b';
  }
};

export const getFlightConditionIcon = (condition) => {
  switch (condition) {
    case FLIGHT_CONDITIONS.GOOD:
      return '🟢';
    case FLIGHT_CONDITIONS.CAUTION:
      return '🟡';
    case FLIGHT_CONDITIONS.NOT_RECOMMENDED:
      return '🔴';
    default:
      return '⚪';
  }
};

export const getFlightConditionMessage = (condition) => {
  switch (condition) {
    case FLIGHT_CONDITIONS.GOOD:
      return 'Boas condições para voo';
    case FLIGHT_CONDITIONS.CAUTION:
      return 'Voo com atenção';
    case FLIGHT_CONDITIONS.NOT_RECOMMENDED:
      return 'Voo não recomendado';
    default:
      return 'Condições desconhecidas';
  }
};

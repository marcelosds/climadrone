import axios from 'axios';
import { WEATHER_API_KEY, WEATHER_API_BASE_URL } from '../constants';
import logger from '../utils/logger';

class WeatherService {
  ensureApiKey() {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_WEATHER_API_KEY') {
      logger.error('Weather', 'OPENWEATHER_API_KEY ausente ou inválida');
      return false;
    }
    return true;
  }

  async getCurrentWeather(lat, lon) {
    try {
      const ok = this.ensureApiKey();
      if (!ok) {
        return {
          temperature: 0,
          windSpeed: 0,
          windDirection: 0,
          windGust: 0,
          visibility: 10,
          humidity: 0,
          pressure: null,
          weather: { main: 'Unknown', description: 'Indisponível' },
          clouds: 0,
          sunrise: new Date(),
          sunset: new Date(),
          location: { name: 'Local atual', country: 'BR', lat, lon }
        };
      }
      logger.info('Weather', 'Solicitando clima atual', { lat, lon });
      const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric',
          lang: 'pt_br'
        }
      });

      logger.success('Weather', 'Clima atual recebido', {
        name: response.data?.name,
        wind: response.data?.wind
      });
      return this.parseWeatherData(response.data);
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      logger.error('Weather', 'Erro ao buscar clima atual', { status, data, msg: error?.message });
      return {
        temperature: 0,
        windSpeed: 0,
        windDirection: 0,
        windGust: 0,
        visibility: 10,
        humidity: 0,
        pressure: null,
        weather: { main: 'Unknown', description: 'Indisponível' },
        clouds: 0,
        sunrise: new Date(),
        sunset: new Date(),
        location: { name: 'Local atual', country: 'BR', lat, lon }
      };
    }
  }

  async getForecast(lat, lon) {
    try {
      const ok = this.ensureApiKey();
      if (!ok) {
        return [];
      }
      logger.info('Weather', 'Solicitando previsão', { lat, lon });
      const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric',
          lang: 'pt_br'
        }
      });

      logger.success('Weather', 'Previsão recebida', {
        count: response.data?.list?.length
      });
      return this.parseForecastData(response.data);
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      logger.error('Weather', 'Erro ao buscar previsão', { status, data, msg: error?.message });
      return [];
    }
  }

  parseWeatherData(data) {
    return {
      temperature: Math.round(data.main.temp),
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      windDirection: data.wind.deg || 0,
      windGust: data.wind.gust ? data.wind.gust * 3.6 : 0, // Convert m/s to km/h
      visibility: data.visibility / 1000, // Convert meters to km
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      weather: data.weather[0],
      clouds: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      location: {
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };
  }

  parseForecastData(data) {
    return data.list.map(item => ({
      time: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      windSpeed: item.wind.speed * 3.6,
      windDirection: item.wind.deg || 0,
      windGust: item.wind.gust ? item.wind.gust * 3.6 : 0,
      visibility: item.visibility ? item.visibility / 1000 : 10, // Default 10km if not available
      humidity: item.main.humidity,
      clouds: item.clouds.all,
      pressure: item.main.pressure,
      weather: item.weather[0],
      location: data.city ? {
        name: data.city.name,
        country: data.city.country,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon
      } : null
    }));
  }

  getWindDirectionText(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  convertWindSpeed(speed, unit) {
    switch (unit) {
      case 'm/s':
        return (speed / 3.6).toFixed(1);
      case 'km/h':
      default:
        return Math.round(speed);
    }
  }

  convertTemperature(temp, unit) {
    switch (unit) {
      case 'fahrenheit':
        return Math.round((temp * 9/5) + 32);
      case 'celsius':
      default:
        return Math.round(temp);
    }
  }

  convertVisibility(visibility, unit) {
    switch (unit) {
      case 'miles':
        return (visibility * 0.621371).toFixed(1);
      case 'km':
      default:
        return visibility.toFixed(1);
    }
  }
}

export default new WeatherService();

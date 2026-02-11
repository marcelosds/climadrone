import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import weatherService from '../services/weatherService';
import locationService from '../services/locationService';
import logger from '../utils/logger';

export const useWeather = () => {
  const { 
    weatherData, 
    location, 
    settings, 
    updateWeatherData, 
    updateLocation, 
    setLoadingState, 
    setErrorState 
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const fetchWeatherData = useCallback(async (lat, lon) => {
    try {
      setLoadingState(true);
      setErrorState(null);
      logger.info('Init', 'Buscando clima', { lat, lon });

      const currentWeather = await weatherService.getCurrentWeather(lat, lon);
      let forecast = [];
      try {
        forecast = await weatherService.getForecast(lat, lon);
      } catch (forecastError) {
        logger.warn('Init', 'Falha em forecast, usando apenas clima atual', forecastError?.message);
      }

      const weatherDataWithForecast = {
        ...currentWeather,
        forecast
      };

      updateWeatherData(weatherDataWithForecast);
      logger.success('Init', 'Clima atualizado com previsão');
      return weatherDataWithForecast;
    } catch (error) {
      logger.error('Init', 'Erro ao buscar clima', error?.message);
      setErrorState(error.message || 'Failed to fetch weather data');
      throw error;
    } finally {
      setLoadingState(false);
    }
  }, [updateWeatherData, setLoadingState, setErrorState]);

  const getCurrentLocationAndWeather = useCallback(async () => {
    try {
      setLoadingState(true);
      setErrorState(null);
      logger.info('Init', 'Obtendo localização e clima');

      // Get current location
      const currentLocation = await locationService.getCurrentLocation();
      updateLocation(currentLocation);
      logger.success('Init', 'Localização obtida', currentLocation);

      // Fetch weather for current location
      const weather = await fetchWeatherData(currentLocation.latitude, currentLocation.longitude);
      logger.success('Init', 'Clima obtido para localização atual');
      
      return { location: currentLocation, weather };
    } catch (error) {
      logger.error('Init', 'Erro ao obter localização e clima', error?.message);
      setErrorState(error.message || 'Failed to get location and weather data');
      throw error;
    } finally {
      setLoadingState(false);
    }
  }, [fetchWeatherData, updateLocation, setLoadingState, setErrorState]);

  const refreshWeather = useCallback(async () => {
    try {
      setRefreshing(true);
      setErrorState(null);
       logger.info('Init', 'Atualizando clima');

      let lat, lon;

      if (location) {
        lat = location.latitude;
        lon = location.longitude;
      } else {
        // Get current location if not available
        const currentLocation = await locationService.getCurrentLocation();
        updateLocation(currentLocation);
        lat = currentLocation.latitude;
        lon = currentLocation.longitude;
      }

      await fetchWeatherData(lat, lon);
      logger.success('Init', 'Atualização de clima concluída');
    } catch (error) {
      logger.error('Init', 'Erro ao atualizar clima', error?.message);
      setErrorState(error.message || 'Failed to refresh weather data');
    } finally {
      setRefreshing(false);
    }
  }, [location, fetchWeatherData, updateLocation, setErrorState]);

  const getWeatherForLocation = useCallback(async (lat, lon) => {
    try {
      setErrorState(null);
      logger.info('Init', 'Buscando clima para localização', { lat, lon });
      return await fetchWeatherData(lat, lon);
    } catch (error) {
      logger.error('Init', 'Erro ao buscar clima para localização', error?.message);
      setErrorState(error.message || 'Failed to get weather data for location');
      throw error;
    }
  }, [fetchWeatherData, setErrorState]);

  const convertWindSpeed = (speed) => {
    return weatherService.convertWindSpeed(speed, settings.windSpeedUnit);
  };

  const convertTemperature = (temp) => {
    return weatherService.convertTemperature(temp, settings.temperatureUnit);
  };

  const convertVisibility = (visibility) => {
    return weatherService.convertVisibility(visibility, settings.visibilityUnit);
  };

  const getWindDirectionText = (degrees) => {
    return weatherService.getWindDirectionText(degrees);
  };

  return {
    weatherData,
    location,
    settings,
    refreshing,
    fetchWeatherData,
    getCurrentLocationAndWeather,
    refreshWeather,
    getWeatherForLocation,
    convertWindSpeed,
    convertTemperature,
    convertVisibility,
    getWindDirectionText
  };
};

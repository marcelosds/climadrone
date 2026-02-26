import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SETTINGS: '@climadrone_settings',
  LAST_WEATHER_DATA: '@climadrone_last_weather',
  LAST_LOCATION: '@climadrone_last_location',
  FAVORITE_LOCATIONS: '@climadrone_favorite_locations',
  USER_AVATAR_URI: '@climadrone_user_avatar_uri'
};

const MIGRATION_KEYS = {
  WEATHER_DATE_FIX_V1: '@climadrone_migration_weather_date_fix_v1',
  LOCATION_CLEAR_V1: '@climadrone_migration_location_clear_v1'
};

export const StorageService = {
  async runMigrations() {
    try {
      const doneWeather = await AsyncStorage.getItem(MIGRATION_KEYS.WEATHER_DATE_FIX_V1);
      const doneLocation = await AsyncStorage.getItem(MIGRATION_KEYS.LOCATION_CLEAR_V1);
      let weatherDateFix = false;
      let locationCleared = false;
      if (!doneWeather) {
        await AsyncStorage.removeItem(STORAGE_KEYS.LAST_WEATHER_DATA);
        await AsyncStorage.setItem(MIGRATION_KEYS.WEATHER_DATE_FIX_V1, new Date().toISOString());
        weatherDateFix = true;
      }
      if (!doneLocation) {
        await AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOCATION);
        await AsyncStorage.setItem(MIGRATION_KEYS.LOCATION_CLEAR_V1, new Date().toISOString());
        locationCleared = true;
      }
      return { weatherDateFix, locationCleared };
    } catch (error) {
      return { weatherDateFix: false, locationCleared: false, error: String(error) };
    }
  },
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },

  async saveLastWeatherData(weatherData) {
    try {
      const dataToSave = {
        ...weatherData,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_WEATHER_DATA, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('Error saving weather data:', error);
      return false;
    }
  },

  async getLastWeatherData() {
    try {
      const weatherData = await AsyncStorage.getItem(STORAGE_KEYS.LAST_WEATHER_DATA);
      const parsed = weatherData ? JSON.parse(weatherData) : null;
      if (parsed) {
        if (parsed.sunrise) parsed.sunrise = new Date(parsed.sunrise);
        if (parsed.sunset) parsed.sunset = new Date(parsed.sunset);
        if (Array.isArray(parsed.forecast)) {
          parsed.forecast = parsed.forecast.map((f) => ({
            ...f,
            time: f?.time ? new Date(f.time) : f?.time
          }));
        }
      }
      return parsed;
    } catch (error) {
      console.error('Error getting weather data:', error);
      return null;
    }
  },

  async saveLastLocation(location) {
    try {
      const locationToSave = {
        ...location,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(locationToSave));
      return true;
    } catch (error) {
      console.error('Error saving location:', error);
      return false;
    }
  },

  async getLastLocation() {
    try {
      const location = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
      return location ? JSON.parse(location) : null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  },

  async saveFavoriteLocations(locations) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_LOCATIONS, JSON.stringify(locations));
      return true;
    } catch (error) {
      console.error('Error saving favorite locations:', error);
      return false;
    }
  },

  async getFavoriteLocations() {
    try {
      const locations = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_LOCATIONS);
      return locations ? JSON.parse(locations) : [];
    } catch (error) {
      console.error('Error getting favorite locations:', error);
      return [];
    }
  },
 
  async saveUserAvatarUri(uri) {
    try {
      if (uri) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_AVATAR_URI, uri);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_AVATAR_URI);
      }
      return true;
    } catch (error) {
      console.error('Error saving user avatar uri:', error);
      return false;
    }
  },
 
  async getUserAvatarUri() {
    try {
      const uri = await AsyncStorage.getItem(STORAGE_KEYS.USER_AVATAR_URI);
      return uri || null;
    } catch (error) {
      console.error('Error getting user avatar uri:', error);
      return null;
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }
};

export default StorageService;

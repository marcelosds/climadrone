import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SETTINGS: '@climadrone_settings',
  LAST_WEATHER_DATA: '@climadrone_last_weather',
  LAST_LOCATION: '@climadrone_last_location',
  FAVORITE_LOCATIONS: '@climadrone_favorite_locations',
  USER_AVATAR_URI: '@climadrone_user_avatar_uri'
};

export const StorageService = {
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
      return weatherData ? JSON.parse(weatherData) : null;
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

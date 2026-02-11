import * as Location from 'expo-location';
import logger from '../utils/logger';

class LocationService {
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      if (granted) {
        logger.success('Location', 'Permissão concedida');
      } else {
        logger.warn('Location', 'Permissão negada');
      }
      return granted;
    } catch (error) {
      logger.error('Location', 'Erro ao solicitar permissão', error?.message);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10
      });

      logger.success('Location', 'Posição atual obtida', {
        lat: location.coords.latitude,
        lon: location.coords.longitude
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: new Date(location.timestamp)
      };
    } catch (error) {
      logger.error('Location', 'Erro ao obter localização atual', error?.message);
      throw error;
    }
  }

  async getLocationUpdates(callback) {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10
        },
        (location) => {
          logger.info('Location', 'Atualização recebida', {
            lat: location.coords.latitude,
            lon: location.coords.longitude
          });
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            altitudeAccuracy: location.coords.altitudeAccuracy,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: new Date(location.timestamp)
          });
        }
      );
    } catch (error) {
      logger.error('Location', 'Erro ao configurar updates', error?.message);
      throw error;
    }
  }

  async getCurrentAddress(latitude, longitude) {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      logger.success('Location', 'Endereço resolvido', { city: address.city, region: address.region });
      return {
        street: address.street,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
        name: address.name
      };
    } catch (error) {
      logger.error('Location', 'Erro ao obter endereço', error?.message);
      return null;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  toRad(value) {
    return value * Math.PI / 180;
  }
}

export default new LocationService();

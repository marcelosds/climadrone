import weatherService from '../weatherService';

describe('WeatherService', () => {
  describe('getWindDirectionText', () => {
    it('should return correct direction for 0° (North)', () => {
      expect(weatherService.getWindDirectionText(0)).toBe('N');
    });

    it('should return correct direction for 90° (East)', () => {
      expect(weatherService.getWindDirectionText(90)).toBe('E');
    });

    it('should return correct direction for 180° (South)', () => {
      expect(weatherService.getWindDirectionText(180)).toBe('S');
    });

    it('should return correct direction for 270° (West)', () => {
      expect(weatherService.getWindDirectionText(270)).toBe('W');
    });

    it('should return correct direction for 45° (NE)', () => {
      expect(weatherService.getWindDirectionText(45)).toBe('NE');
    });

    it('should handle edge cases', () => {
      expect(weatherService.getWindDirectionText(360)).toBe('N');
      expect(weatherService.getWindDirectionText(-10)).toBe('N');
    });
  });

  describe('convertWindSpeed', () => {
    it('should convert km/h to m/s correctly', () => {
      expect(weatherService.convertWindSpeed(36, 'm/s')).toBe('10.0');
      expect(weatherService.convertWindSpeed(18, 'm/s')).toBe('5.0');
    });

    it('should return rounded km/h when unit is km/h', () => {
      expect(weatherService.convertWindSpeed(25.7, 'km/h')).toBe(26);
      expect(weatherService.convertWindSpeed(30.2, 'km/h')).toBe(30);
    });

    it('should default to km/h for unknown units', () => {
      expect(weatherService.convertWindSpeed(25, 'unknown')).toBe(25);
    });
  });

  describe('convertTemperature', () => {
    it('should convert Celsius to Fahrenheit correctly', () => {
      expect(weatherService.convertTemperature(0, 'fahrenheit')).toBe(32);
      expect(weatherService.convertTemperature(25, 'fahrenheit')).toBe(77);
      expect(weatherService.convertTemperature(100, 'fahrenheit')).toBe(212);
    });

    it('should return rounded Celsius when unit is celsius', () => {
      expect(weatherService.convertTemperature(25.7, 'celsius')).toBe(26);
      expect(weatherService.convertTemperature(30.2, 'celsius')).toBe(30);
    });

    it('should default to Celsius for unknown units', () => {
      expect(weatherService.convertTemperature(25, 'unknown')).toBe(25);
    });
  });

  describe('convertVisibility', () => {
    it('should convert km to miles correctly', () => {
      expect(weatherService.convertVisibility(1, 'miles')).toBe('0.6');
      expect(weatherService.convertVisibility(10, 'miles')).toBe('6.2');
    });

    it('should return km with one decimal when unit is km', () => {
      expect(weatherService.convertVisibility(5.75, 'km')).toBe('5.8');
      expect(weatherService.convertVisibility(10.0, 'km')).toBe('10.0');
    });

    it('should default to km for unknown units', () => {
      expect(weatherService.convertVisibility(5, 'unknown')).toBe('5.0');
    });
  });

  describe('parseWeatherData', () => {
    it('should parse weather data correctly', () => {
      const mockApiResponse = {
        main: {
          temp: 25.5,
          humidity: 60,
          pressure: 1013
        },
        wind: {
          speed: 5, // m/s
          deg: 180,
          gust: 7 // m/s
        },
        visibility: 10000, // meters
        clouds: { all: 20 },
        weather: [{ main: 'Clear', description: 'Céu limpo' }],
        sys: {
          sunrise: 1640995200,
          sunset: 1641033600,
          country: 'BR'
        },
        coord: {
          lat: -27.0,
          lon: -52.0
        },
        name: 'Chapecó'
      };

      const result = weatherService.parseWeatherData(mockApiResponse);

      expect(result.temperature).toBe(26); // Rounded
      expect(result.windSpeed).toBe(18); // 5 m/s * 3.6 = 18 km/h
      expect(result.windDirection).toBe(180);
      expect(result.windGust).toBe(25.2); // 7 m/s * 3.6 = 25.2 km/h
      expect(result.visibility).toBe(10); // 10000m / 1000 = 10km
      expect(result.humidity).toBe(60);
      expect(result.pressure).toBe(1013);
      expect(result.clouds).toBe(20);
      expect(result.weather.main).toBe('Clear');
      expect(result.location.name).toBe('Chapecó');
      expect(result.location.country).toBe('BR');
    });
  });
});
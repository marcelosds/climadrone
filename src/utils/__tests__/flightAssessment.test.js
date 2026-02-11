import { assessFlightConditions, getFlightConditionColor, getFlightConditionIcon, getFlightConditionMessage } from '../flightAssessment';
import { FLIGHT_CONDITIONS } from '../../constants';

describe('Flight Assessment', () => {
  const mockWeatherData = {
    windSpeed: 20,
    windGust: 25,
    windDirection: 45,
    visibility: 10,
    clouds: 20,
    weather: { main: 'Clear', description: 'Céu limpo' },
    temperature: 25
  };

  const mockSettings = {
    maxWindSpeed: 35,
    maxGustSpeed: 45,
    minVisibility: 3
  };

  describe('assessFlightConditions', () => {
    it('should return GOOD conditions for ideal weather', () => {
      const result = assessFlightConditions(mockWeatherData, mockSettings, 'DJI Mini 4K');
      
      expect(result.condition).toBe(FLIGHT_CONDITIONS.GOOD);
      expect(result.icon).toBe('🟢');
      expect(result.message).toBe('Boas condições para voo');
      expect(result.issues).toHaveLength(0);
    });

    it('should return CAUTION conditions for moderate wind', () => {
      const highWindData = {
        ...mockWeatherData,
        windSpeed: 30, // 85% of max wind speed
        windGust: 35
      };
      
      const result = assessFlightConditions(highWindData, mockSettings, 'DJI Mini 4K');
      
      expect(result.condition).toBe(FLIGHT_CONDITIONS.CAUTION);
      expect(result.icon).toBe('🟡');
      expect(result.message).toBe('Voo com atenção');
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should return NOT_RECOMMENDED conditions for dangerous wind', () => {
      const dangerousWindData = {
        ...mockWeatherData,
        windSpeed: 40, // Above max wind speed
        windGust: 50  // Above max gust speed
      };
      
      const result = assessFlightConditions(dangerousWindData, mockSettings, 'DJI Mini 4K');
      
      expect(result.condition).toBe(FLIGHT_CONDITIONS.NOT_RECOMMENDED);
      expect(result.icon).toBe('🔴');
      expect(result.message).toBe('Voo não recomendado');
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should handle low visibility conditions', () => {
      const lowVisibilityData = {
        ...mockWeatherData,
        visibility: 2 // Below minimum visibility
      };
      
      const result = assessFlightConditions(lowVisibilityData, mockSettings, 'DJI Mini 4K');
      
      expect(result.condition).toBe(FLIGHT_CONDITIONS.CAUTION);
      expect(result.issues.some(issue => issue.includes('Visibilidade'))).toBe(true);
    });

    it('should handle precipitation conditions', () => {
      const rainyData = {
        ...mockWeatherData,
        weather: { main: 'Rain', description: 'Chuva leve' }
      };
      
      const result = assessFlightConditions(rainyData, mockSettings, 'DJI Mini 4K');
      
      expect(result.condition).toBe(FLIGHT_CONDITIONS.CAUTION);
      expect(result.issues.some(issue => issue.includes('Chuva'))).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should return correct color for each condition', () => {
      expect(getFlightConditionColor(FLIGHT_CONDITIONS.GOOD)).toBe('#10b981');
      expect(getFlightConditionColor(FLIGHT_CONDITIONS.CAUTION)).toBe('#f59e0b');
      expect(getFlightConditionColor(FLIGHT_CONDITIONS.NOT_RECOMMENDED)).toBe('#ef4444');
    });

    it('should return correct icon for each condition', () => {
      expect(getFlightConditionIcon(FLIGHT_CONDITIONS.GOOD)).toBe('🟢');
      expect(getFlightConditionIcon(FLIGHT_CONDITIONS.CAUTION)).toBe('🟡');
      expect(getFlightConditionIcon(FLIGHT_CONDITIONS.NOT_RECOMMENDED)).toBe('🔴');
    });

    it('should return correct message for each condition', () => {
      expect(getFlightConditionMessage(FLIGHT_CONDITIONS.GOOD)).toBe('Boas condições para voo');
      expect(getFlightConditionMessage(FLIGHT_CONDITIONS.CAUTION)).toBe('Voo com atenção');
      expect(getFlightConditionMessage(FLIGHT_CONDITIONS.NOT_RECOMMENDED)).toBe('Voo não recomendado');
    });
  });
});
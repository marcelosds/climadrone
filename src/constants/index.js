import Constants from 'expo-constants';
export const WEATHER_API_KEY =
  Constants?.expoConfig?.extra?.openWeatherApiKey ||
  'YOUR_WEATHER_API_KEY';
export const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const DRONE_MODELS = {
  'DJI Mini 4K': { maxWindSpeed: 35, maxGustSpeed: 45, minVisibility: 3, name: 'DJI Mini 4K' },
  'DJI Mini 4 Pro': { maxWindSpeed: 38, maxGustSpeed: 48, minVisibility: 3, name: 'DJI Mini 4 Pro' },
  'DJI Mini 3 Pro': { maxWindSpeed: 38, maxGustSpeed: 48, minVisibility: 3, name: 'DJI Mini 3 Pro' },
  'DJI Mini 2 SE': { maxWindSpeed: 38, maxGustSpeed: 48, minVisibility: 3, name: 'DJI Mini 2 SE' },
  'DJI Air 2S': { maxWindSpeed: 38, maxGustSpeed: 48, minVisibility: 3, name: 'DJI Air 2S' },
  'DJI Mavic 3 Classic': { maxWindSpeed: 43, maxGustSpeed: 53, minVisibility: 3, name: 'DJI Mavic 3 Classic' },
  'DJI Mavic 3 Enterprise': { maxWindSpeed: 43, maxGustSpeed: 53, minVisibility: 3, name: 'DJI Mavic 3 Enterprise' },
  'DJI Phantom 4 Pro V2.0': { maxWindSpeed: 36, maxGustSpeed: 46, minVisibility: 3, name: 'DJI Phantom 4 Pro V2.0' },
  'DJI Inspire 2': { maxWindSpeed: 36, maxGustSpeed: 46, minVisibility: 3, name: 'DJI Inspire 2' },
  'DJI Inspire 3': { maxWindSpeed: 50, maxGustSpeed: 60, minVisibility: 3, name: 'DJI Inspire 3' },
  'DJI Matrice 300 RTK': { maxWindSpeed: 43, maxGustSpeed: 53, minVisibility: 3, name: 'DJI Matrice 300 RTK' },
  'DJI Matrice 350 RTK': { maxWindSpeed: 43, maxGustSpeed: 53, minVisibility: 3, name: 'DJI Matrice 350 RTK' },
  'DJI Matrice 600': { maxWindSpeed: 29, maxGustSpeed: 39, minVisibility: 3, name: 'DJI Matrice 600' },
  'Autel EVO II Pro': { maxWindSpeed: 61, maxGustSpeed: 71, minVisibility: 3, name: 'Autel EVO II Pro' },
  'Autel EVO II Pro V2/V3 (variações)': { maxWindSpeed: 61, maxGustSpeed: 71, minVisibility: 3, name: 'Autel EVO II Pro V2/V3 (variações)' },
  'Autel EVO Lite / Lite+': { maxWindSpeed: 38, maxGustSpeed: 48, minVisibility: 3, name: 'Autel EVO Lite / Lite+' },
  'Autel EVO Nano / Nano+': { maxWindSpeed: 28, maxGustSpeed: 38, minVisibility: 3, name: 'Autel EVO Nano / Nano+' },
  'Parrot ANAFI': { maxWindSpeed: 50, maxGustSpeed: 60, minVisibility: 3, name: 'Parrot ANAFI' },
  'Parrot ANAFI USA': { maxWindSpeed: 53, maxGustSpeed: 63, minVisibility: 3, name: 'Parrot ANAFI USA' },
  'Skydio 2 / 2+': { maxWindSpeed: 40, maxGustSpeed: 50, minVisibility: 3, name: 'Skydio 2 / 2+' },
  'Skydio X2 (enterprise)': { maxWindSpeed: 37, maxGustSpeed: 47, minVisibility: 3, name: 'Skydio X2 (enterprise)' },
  'Yuneec Typhoon H': { maxWindSpeed: 56, maxGustSpeed: 66, minVisibility: 3, name: 'Yuneec Typhoon H' },
  'Yuneec H520': { maxWindSpeed: 45, maxGustSpeed: 55, minVisibility: 3, name: 'Yuneec H520' },
  'Freefly Alta 8': { maxWindSpeed: 41, maxGustSpeed: 51, minVisibility: 3, name: 'Freefly Alta 8' },
  'Hubsan Zino 2 / Zino Pro': { maxWindSpeed: 38, maxGustSpeed: 48, minVisibility: 3, name: 'Hubsan Zino 2 / Zino Pro' },
  'Holy Stone HS720 / HS720E': { maxWindSpeed: null, maxGustSpeed: null, minVisibility: 3, name: 'Holy Stone HS720 / HS720E' },
  'Ryze Tello (DJI/Ryze)': { maxWindSpeed: null, maxGustSpeed: null, minVisibility: 3, name: 'Ryze Tello (DJI/Ryze)' },
  'Walkera Voyager 4': { maxWindSpeed: 36, maxGustSpeed: 46, minVisibility: 3, name: 'Walkera Voyager 4' },
  'Teledyne FLIR SkyRanger': { maxWindSpeed: 65, maxGustSpeed: 90, minVisibility: 3, name: 'Teledyne FLIR SkyRanger' },
  'DJI FPV (série)': { maxWindSpeed: null, maxGustSpeed: null, minVisibility: 3, name: 'DJI FPV (série)' },
  'senseFly eBee X': { maxWindSpeed: 46, maxGustSpeed: 56, minVisibility: 3, name: 'senseFly eBee X' }
};

export const FLIGHT_CONDITIONS = {
  GOOD: 'good',
  CAUTION: 'caution',
  NOT_RECOMMENDED: 'not_recommended'
};

export const UNITS = {
  WIND_SPEED: {
    KMH: 'km/h',
    MS: 'm/s'
  },
  TEMPERATURE: {
    CELSIUS: 'celsius',
    FAHRENHEIT: 'fahrenheit'
  },
  VISIBILITY: {
    KM: 'km',
    MILES: 'miles'
  }
};

export const COLORS = {
  primary: '#2563eb',
  /** Cor de destaque para abas e hora atual na tela Condições */
  conditionsAccent: '#049DD9',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b'
};

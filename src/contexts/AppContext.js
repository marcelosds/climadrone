import React, { createContext, useState, useContext, useEffect } from 'react';
import { DRONE_MODELS, UNITS } from '../constants';
import StorageService from '../utils/storage';
import logger from '../utils/logger';
import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential, sendPasswordResetEmail, updateProfile } from 'firebase/auth';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    droneModel: 'DJI Mini 4K',
    windSpeedUnit: UNITS.WIND_SPEED.KMH,
    temperatureUnit: UNITS.TEMPERATURE.CELSIUS,
    visibilityUnit: UNITS.VISIBILITY.KM,
    maxWindSpeed: DRONE_MODELS['DJI Mini 4K'].maxWindSpeed,
    maxGustSpeed: DRONE_MODELS['DJI Mini 4K'].maxGustSpeed,
    minVisibility: DRONE_MODELS['DJI Mini 4K'].minVisibility,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  });

  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [localAvatarUri, setLocalAvatarUri] = useState(null);

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
    logger.info('AppContext', 'Provider iniciado');
  }, []);

  useEffect(() => {
    try {
      const cfg = Constants?.expoConfig?.extra?.firebase;
      const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
      const missing = required.filter((k) => !cfg?.[k]);
      if (missing.length > 0) {
        setError(`Firebase não configurado: faltam ${missing.join(', ')}`);
        logger.warn('Auth', 'Firebase config ausente', { missing });
        return;
      }
      logger.info('Auth', 'Inicializando Firebase', { projectId: cfg?.projectId });
      const app = initializeApp(cfg);
      setFirebaseApp(app);
      const a = getAuth(app);
      setAuth(a);
      logger.success('Auth', 'Firebase inicializado');
      onAuthStateChanged(a, (u) => {
        setUser(u || null);
        if (u) {
          logger.success('Auth', 'Usuário autenticado', { uid: u.uid, email: u.email });
        } else {
          logger.info('Auth', 'Nenhum usuário autenticado');
        }
      });
    } catch (e) {
      logger.error('Auth', 'Falha ao inicializar Firebase', e?.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const uri = await StorageService.getUserAvatarUri();
      if (uri) {
        setLocalAvatarUri(uri);
        logger.info('Profile', 'Avatar local carregado', { uri });
      }
    })();
  }, []);
  const coerceBoolean = (v) => (typeof v === 'string' ? v === 'true' : !!v);
  const coerceNumber = (v, fallback) => {
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    }
    return typeof v === 'number' ? v : fallback;
  };
  const sanitizeSettings = (s) => ({
    droneModel: s?.droneModel || 'DJI Mini 4K',
    windSpeedUnit: s?.windSpeedUnit || UNITS.WIND_SPEED.KMH,
    temperatureUnit: s?.temperatureUnit || UNITS.TEMPERATURE.CELSIUS,
    visibilityUnit: s?.visibilityUnit || UNITS.VISIBILITY.KM,
    maxWindSpeed: coerceNumber(s?.maxWindSpeed, DRONE_MODELS['DJI Mini 4K'].maxWindSpeed),
    maxGustSpeed: coerceNumber(s?.maxGustSpeed, DRONE_MODELS['DJI Mini 4K'].maxGustSpeed),
    minVisibility: coerceNumber(s?.minVisibility, DRONE_MODELS['DJI Mini 4K'].minVisibility),
    autoRefresh: coerceBoolean(s?.autoRefresh),
    refreshInterval: coerceNumber(s?.refreshInterval, 300000)
  });
  const getFriendlyAuthError = (error) => {
    const c = error?.code || '';
    if (c === 'auth/wrong-password' || c === 'auth/user-not-found') return 'E-mail ou senha incorretos';
    if (c === 'auth/invalid-email') return 'E-mail inválido';
    if (c === 'auth/too-many-requests') return 'Muitas tentativas. Tente novamente mais tarde';
    if (c === 'auth/network-request-failed') return 'Falha de rede. Verifique sua conexão';
    if (c === 'auth/user-disabled') return 'Conta desativada';
    return error?.message || 'Falha no login';
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      if (savedSettings) {
        const sanitized = sanitizeSettings(savedSettings);
        setSettings(sanitized);
        await StorageService.saveSettings(sanitized);
        logger.success('Settings', 'Carregadas do storage', sanitized);
      }
    } catch (error) {
      logger.error('Settings', 'Erro ao carregar', error?.message);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await StorageService.saveSettings(updatedSettings);
      logger.success('Settings', 'Atualizadas e salvas', updatedSettings);
    } catch (error) {
      logger.error('Settings', 'Erro ao salvar', error?.message);
    }
  };

  const resetSettings = async () => {
    const defaultSettings = {
      droneModel: 'DJI Mini 4K',
      windSpeedUnit: UNITS.WIND_SPEED.KMH,
      temperatureUnit: UNITS.TEMPERATURE.CELSIUS,
      visibilityUnit: UNITS.VISIBILITY.KM,
      maxWindSpeed: DRONE_MODELS['DJI Mini 4K'].maxWindSpeed,
      maxGustSpeed: DRONE_MODELS['DJI Mini 4K'].maxGustSpeed,
      minVisibility: DRONE_MODELS['DJI Mini 4K'].minVisibility,
      autoRefresh: true,
      refreshInterval: 300000
    };
    
    setSettings(defaultSettings);
    await StorageService.saveSettings(defaultSettings);
    logger.success('Settings', 'Restauradas para padrão', defaultSettings);
  };

  const updateWeatherData = (data) => {
    setWeatherData(data);
    setLastUpdate(new Date());
    // Save to storage for offline use
    StorageService.saveLastWeatherData(data);
    logger.success('Weather', 'Dados atualizados', { updatedAt: new Date().toISOString() });
  };

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    // Save to storage
    StorageService.saveLastLocation(newLocation);
    logger.success('Location', 'Localização atualizada', newLocation);
  };

  const setLoadingState = (isLoading) => {
    setLoading(isLoading);
    logger.info('Loading', 'Estado atualizado', { loading: isLoading });
  };

  const setErrorState = (errorMessage) => {
    setError(errorMessage);
    logger.error('Error', 'Estado de erro definido', errorMessage);
  };

  const clearError = () => {
    setError(null);
    logger.info('Error', 'Erro limpo');
  };

  const signInEmailPassword = async (email, password) => {
    if (!auth) throw new Error('Auth não inicializado');
    logger.info('Auth', 'Login por e-mail iniciado', { email });
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      logger.success('Auth', 'Login por e-mail concluído', { uid: res.user.uid, email: res.user.email });
      return res.user;
    } catch (error) {
      logger.error('Auth', 'Falha no login por e-mail', error?.code || error?.message);
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const registerEmailPassword = async (email, password) => {
    if (!auth) throw new Error('Auth não inicializado');
    logger.info('Auth', 'Cadastro iniciado', { email });
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      logger.success('Auth', 'Cadastro concluído', { uid: res.user.uid, email: res.user.email });
      return res.user;
    } catch (error) {
      logger.error('Auth', 'Falha no cadastro', error?.code || error?.message);
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const signOut = async () => {
    if (!auth) return;
    logger.info('Auth', 'Saindo');
    try {
      await firebaseSignOut(auth);
      setUser(null);
      logger.success('Auth', 'Logout concluído');
    } catch (error) {
      logger.error('Auth', 'Falha ao sair', error?.message);
      throw error;
    }
  };

  const signInWithGoogleCredential = async (idToken, accessToken) => {
    if (!auth) throw new Error('Auth não inicializado');
    logger.info('Auth', 'Login com Google iniciado');
    try {
      const cred = GoogleAuthProvider.credential(idToken, accessToken);
      const res = await signInWithCredential(auth, cred);
      setUser(res.user);
      logger.success('Auth', 'Login com Google concluído', { uid: res.user.uid, email: res.user.email });
      return res.user;
    } catch (error) {
      logger.error('Auth', 'Falha no login com Google', error?.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    if (!auth) throw new Error('Auth não inicializado');
    logger.info('Auth', 'Reset de senha iniciado', { email });
    try {
      await sendPasswordResetEmail(auth, email);
      logger.success('Auth', 'E-mail de redefinição enviado', { email });
      return true;
    } catch (error) {
      logger.error('Auth', 'Falha no reset de senha', error?.code || error?.message);
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const value = {
    settings,
    weatherData,
    location,
    loading,
    error,
    lastUpdate,
    user,
    auth,
    firebaseApp,
    localAvatarUri,
    updateSettings,
    resetSettings,
    updateWeatherData,
    updateLocation,
    setLoadingState,
    setErrorState,
    clearError,
    signInEmailPassword,
    registerEmailPassword,
    signOut,
    signInWithGoogleCredential,
    resetPassword
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

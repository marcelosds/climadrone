import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import logger from '../utils/logger';

const CACHE_KEY = '@climadrone_airspace_cache';
const TTL_MS = 5 * 60 * 1000;

const getBboxFromRegion = (region) => {
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLon = region.longitude - region.longitudeDelta / 2;
  const maxLon = region.longitude + region.longitudeDelta / 2;
  return `${minLon},${minLat},${maxLon},${maxLat}`;
};

const typeToColor = (t) => {
  if (t === 4 || t === 13) return { fill: 'rgba(220, 38, 38, 0.28)', stroke: '#b91c1c' };
  if (t === 1) return { fill: 'rgba(249, 115, 22, 0.30)', stroke: '#c2410c' };
  if (t === 3) return { fill: 'rgba(153, 27, 27, 0.32)', stroke: '#7f1d1d' };
  if (t === 2) return { fill: 'rgba(234, 179, 8, 0.28)', stroke: '#d97706' };
  return { fill: 'rgba(59, 130, 246, 0.24)', stroke: '#1d4ed8' };
};

const typeToLabel = (t) => {
  switch (t) {
    case 4: return 'CTR';
    case 13: return 'ATZ';
    case 1: return 'Restricted';
    case 3: return 'Prohibited';
    case 2: return 'Danger';
    case 7: return 'TMA';
    case 10: return 'FIR';
    case 11: return 'UIR';
    case 26: return 'CTA';
    default: return 'Outro';
  }
};

const unitLabel = (u) => {
  if (u === 0) return 'm';
  if (u === 1) return 'ft';
  if (u === 6) return 'FL';
  return '';
};

const refLabel = (r) => {
  if (r === 0) return 'GND';
  if (r === 1) return 'MSL';
  if (r === 2) return 'STD';
  return '';
};

export const useOpenAipAirspace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const inMemoryCache = useRef(new Map());
  const debounceRef = useRef(null);

  const apiKey = Constants?.expoConfig?.extra?.openAipApiKey;

  const loadCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }, []);

  const saveCache = useCallback(async (cacheObj) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch {}
  }, []);

  const fetchAirspaces = useCallback(async (region) => {
    if (!region) return;
    const bbox = getBboxFromRegion(region);
    setLoading(true);
    setError(null);
    try {
      const now = Date.now();
      if (inMemoryCache.current.has(bbox)) {
        const c = inMemoryCache.current.get(bbox);
        if (now - c.ts < TTL_MS) {
          setItems(c.data);
          setLastUpdate(new Date(c.ts));
          setLoading(false);
          return;
        }
      }
      const stored = await loadCache();
      const sEntry = stored[bbox];
      if (sEntry && now - sEntry.ts < TTL_MS) {
        setItems(sEntry.data);
        setLastUpdate(new Date(sEntry.ts));
        inMemoryCache.current.set(bbox, sEntry);
        setLoading(false);
        return;
      }
      const url = 'https://api.core.openaip.net/api/airspaces';
      const params = {
        bbox,
        limit: 1000,
        fields: '_id,name,type,icaoClass,lowerLimit,upperLimit,geometry',
        apiKey: apiKey || undefined
      };
      const headers = apiKey ? { 'x-openaip-api-key': apiKey, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
      logger.info('OpenAIP', 'Consultando airspaces', { bbox, hasKey: !!apiKey });
      const res = await axios.get(url, { params, headers, timeout: 20000 });
      const list = Array.isArray(res?.data?.items) ? res.data.items : [];
      const normalized = list.map((it) => {
        const ring = it?.geometry?.coordinates?.[0] || [];
        const coords = ring.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
        const colors = typeToColor(it?.type);
        return {
          id: it?._id,
          name: it?.name,
          type: it?.type,
          typeLabel: typeToLabel(it?.type),
          icaoClass: it?.icaoClass,
          lowerLimit: it?.lowerLimit,
          upperLimit: it?.upperLimit,
          coordinates: coords,
          fillColor: colors.fill,
          strokeColor: colors.stroke,
          strokeWidth: 1
        };
      }).filter((f) => f.coordinates.length >= 3);
      setItems(normalized);
      setLastUpdate(new Date());
      inMemoryCache.current.set(bbox, { data: normalized, ts: Date.now() });
      const newStored = {
        ...stored,
        [bbox]: { data: normalized, ts: Date.now() }
      };
      const keys = Object.keys(newStored);
      if (keys.length > 5) {
        const sorted = keys.sort((a, b) => newStored[a].ts - newStored[b].ts);
        delete newStored[sorted[0]];
      }
      await saveCache(newStored);
      setLoading(false);
    } catch (e) {
      const status = e?.response?.status;
      if (!apiKey) {
        setLoading(false);
        return;
      }
      if (status === 401 || status === 403) {
        setError('Chave de API inválida ou sem permissão (401/403).');
      } else {
        setError(e?.message || 'Falha ao carregar espaço aéreo');
      }
      setLoading(false);
    }
  }, [apiKey, loadCache, saveCache]);

  const fetchDebounced = useCallback((region) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAirspaces(region), 400);
  }, [fetchAirspaces]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const limitsToText = (limit) => {
    if (!limit) return '';
    return `${limit.value} ${unitLabel(limit.unit)} ${refLabel(limit.referenceDatum)}`;
  };

  return {
    airspaces: items,
    loading,
    error,
    lastUpdate,
    fetchAirspaces,
    fetchDebounced,
    limitsToText
  };
};

export default useOpenAipAirspace;

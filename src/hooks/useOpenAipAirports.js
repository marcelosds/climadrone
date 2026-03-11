import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import logger from '../utils/logger';

const CACHE_KEY = '@climadrone_airports_cache';
const TTL_MS = 5 * 60 * 1000;

const getBboxFromRegion = (region) => {
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLon = region.longitude - region.longitudeDelta / 2;
  const maxLon = region.longitude + region.longitudeDelta / 2;
  return `${minLon},${minLat},${maxLon},${maxLat}`;
};

export const useOpenAipAirports = () => {
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

  const fetchAirports = useCallback(async (region) => {
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
      const url = 'https://api.core.openaip.net/api/airports';
      const params = {
        bbox,
        limit: 500,
        fields: '_id,name,geometry',
        apiKey: apiKey || undefined
      };
      const headers = apiKey ? { 'x-openaip-api-key': apiKey, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
      logger.info('OpenAIP', 'Consultando airports', { bbox, hasKey: !!apiKey });
      const res = await axios.get(url, { params, headers, timeout: 20000 });
      const list = Array.isArray(res?.data?.items) ? res.data.items : [];
      const normalized = list.map((it) => {
        const co = it?.geometry?.coordinates;
        const lon = Array.isArray(co) ? Number(co[0]) : Number(it?.longitude);
        const lat = Array.isArray(co) ? Number(co[1]) : Number(it?.latitude);
        return {
          id: it?._id,
          name: it?.name,
          latitude: lat,
          longitude: lon
        };
      }).filter((a) => !isNaN(a.latitude) && !isNaN(a.longitude));
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
        setError(e?.message || 'Falha ao carregar aeroportos');
      }
      setLoading(false);
    }
  }, [apiKey, loadCache, saveCache]);

  const fetchDebounced = useCallback((region) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAirports(region), 400);
  }, [fetchAirports]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    airports: items,
    loading,
    error,
    lastUpdate,
    fetchAirports,
    fetchDebounced
  };
};

export default useOpenAipAirports;

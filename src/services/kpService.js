import axios from 'axios';
import logger from '../utils/logger';

const BASE_URLS = [
  'https://kp.gfz-potsdam.de/app/json/',
  'https://kp.gfz.de/app/json/'
];

const cache = new Map();

const toUtcDayRange = (date) => {
  const d = new Date(date);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
  return {
    start: start.toISOString().replace('.000Z', 'Z'),
    end: end.toISOString().replace('.000Z', 'Z')
  };
};

const pickLatestValue = (data) => {
  try {
    const times = data?.datetime || [];
    const values = data?.Kp || [];
    const statuses = data?.status || [];
    if (!times.length || !values.length) return null;
    const now = Date.now();
    let idx = values.length - 1;
    for (let i = values.length - 1; i >= 0; i--) {
      const t = Date.parse(times[i]);
      if (!isNaN(t) && t <= now) {
        idx = i;
        break;
      }
    }
    return {
      value: Number(values[idx]),
      time: new Date(times[idx]),
      status: statuses && statuses[idx] !== undefined ? String(statuses[idx]) : null
    };
  } catch {
    return null;
  }
};

class KpService {
  async getLatestKpForDate(date) {
    try {
      const dayKey = new Date(date).toISOString().slice(0, 10);
      if (cache.has(dayKey)) {
        const c = cache.get(dayKey);
        if (Date.now() - c.ts < 5 * 60 * 1000) {
          return c.data;
        }
      }

      const { start, end } = toUtcDayRange(date);
      let lastError = null;
      for (const base of BASE_URLS) {
        try {
          const url = `${base}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&index=Kp`;
          logger.info('Kp', 'Solicitando dados', { url });
          const res = await axios.get(url, { timeout: 15000 });
          const kp = pickLatestValue(res.data);
          if (kp) {
            cache.set(dayKey, { ts: Date.now(), data: kp });
            logger.success('Kp', 'Valor obtido', { v: kp.value, t: kp.time?.toISOString() });
            return kp;
          }
        } catch (e) {
          lastError = e;
        }
      }
      if (lastError) throw lastError;
      return null;
    } catch (e) {
      const status = e?.response?.status;
      logger.error('Kp', 'Falha ao obter Kp', { msg: e?.message, status });
      return null;
    }
  }
}

export default new KpService();

import Constants from 'expo-constants';

const enabled = Constants?.expoConfig?.extra?.debug !== false;

const format = (level, tag, message, payload) => {
  const prefix = `[ClimaDrone][${level}][${tag}]`;
  if (payload !== undefined) {
    console.log(prefix, message, payload);
  } else {
    console.log(prefix, message);
  }
};

const logger = {
  info: (tag, message, payload) => {
    if (!enabled) return;
    format('INFO', tag, message, payload);
  },
  success: (tag, message, payload) => {
    if (!enabled) return;
    format('SUCCESS', tag, message, payload);
  },
  warn: (tag, message, payload) => {
    if (!enabled) return;
    format('WARN', tag, message, payload);
  },
  error: (tag, message, payload) => {
    if (!enabled) return;
    format('ERROR', tag, message, payload);
  }
};

export default logger;

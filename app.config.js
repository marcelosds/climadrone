import 'dotenv/config';

export default ({ config }) => {
  const openWeatherApiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  const appDebug = process.env.APP_DEBUG || process.env.EXPO_PUBLIC_APP_DEBUG;
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  const firebaseAuthDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN;
  const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const firebaseStorageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
  const firebaseMessagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID;
  const firebaseAppId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID;
  const googleOAuthAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID || process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID || '585940739308-2br7ohc7dapvgv5rhhn32i8n1s97lnpt.apps.googleusercontent.com';
  const googleOAuthIosClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID || process.env.GOOGLE_OAUTH_IOS_CLIENT_ID;
  const googleOAuthWebClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID || process.env.GOOGLE_OAUTH_WEB_CLIENT_ID;
  const openAipApiKey = process.env.EXPO_PUBLIC_OPENAIP_API_KEY || process.env.OPENAIP_API_KEY;
  
  const schemeFromClientId = (clientId) => {
    if (!clientId) return null;
    const base = String(clientId).replace('.apps.googleusercontent.com', '');
    return `com.googleusercontent.apps.${base}`;
  };
  const googleAndroidScheme = schemeFromClientId(googleOAuthAndroidClientId);
  const googleIosScheme = schemeFromClientId(googleOAuthIosClientId);
  
  return {
    ...config,
    android: {
      ...(config.android || {}),
      intentFilters: [
        ...(config.android?.intentFilters || []),
        ...(googleAndroidScheme
          ? [
              {
                action: 'VIEW',
                data: [{ scheme: googleAndroidScheme, pathPrefix: '/oauthredirect' }],
                category: ['BROWSABLE', 'DEFAULT']
              }
            ]
          : [])
      ],
      config: {
        ...((config.android && config.android.config) || {}),
        googleMaps: {
          ...(((config.android && config.android.config && config.android.config.googleMaps) || {})),
          apiKey: googleMapsApiKey
        }
      }
    },
    ios: {
      ...(config.ios || {}),
      infoPlist: {
        ...(config.ios?.infoPlist || {}),
        ...(googleIosScheme
          ? {
              CFBundleURLTypes: [
                ...((config.ios?.infoPlist?.CFBundleURLTypes || [])),
                { CFBundleURLSchemes: [googleIosScheme] }
              ]
            }
          : {})
      },
      config: {
        ...((config.ios && config.ios.config) || {}),
        googleMapsApiKey: googleMapsApiKey
      }
    },
    extra: {
      ...(config.extra || {}),
      openWeatherApiKey: openWeatherApiKey,
      googleMapsApiKey: googleMapsApiKey,
      openAipApiKey: openAipApiKey,
      firebase: {
        apiKey: firebaseApiKey,
        authDomain: firebaseAuthDomain,
        projectId: firebaseProjectId,
        storageBucket: firebaseStorageBucket,
        messagingSenderId: firebaseMessagingSenderId,
        appId: firebaseAppId
      },
      googleOAuth: {
        androidClientId: googleOAuthAndroidClientId,
        iosClientId: googleOAuthIosClientId,
        webClientId: googleOAuthWebClientId
      },
      debug: appDebug === 'false' ? false : true
    }
  };
};

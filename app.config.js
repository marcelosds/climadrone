module.exports = ({ config }) => {
  const firebase = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const openWeatherApiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  const openAipApiKey = process.env.EXPO_PUBLIC_OPENAIP_API_KEY || process.env.EXPO_PUBLIC_OPENAIP_KEY || process.env.OPENAIP_API_KEY;
  const googleOAuthAndroidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID ||
    process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID ||
    '585940739308-2br7ohc7dapvgv5rhhn32i8n1s97lnpt.apps.googleusercontent.com';
  const googleOAuthIosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID || process.env.GOOGLE_OAUTH_IOS_CLIENT_ID || null;
  const googleOAuthWebClientId =
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID || process.env.GOOGLE_OAUTH_WEB_CLIENT_ID || null;
  const android = {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#2bc15e"
    },
    edgeToEdgeEnabled: true,
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "INTERNET"
    ],
    package: "com.climadrone.app",
    config: googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : undefined
  };
  return {
    ...config,
    name: "ClimaDrone",
    slug: "climadrone",
    owner: "marcelotkd2010",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.climadrone.app"
    },
    android,
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Permitir que o ClimaDrone acesse sua localização para fornecer condições climáticas e de voo precisas."
        }
      ]
    ],
    scheme: "climadrone",
    extra: {
      eas: {
        projectId: "f7acdeeb-71bc-472c-97a6-ccf6935fca33"
      },
      buildProfile: process.env.EAS_BUILD_PROFILE || null,
      googleMapsApiKey,
      openWeatherApiKey,
      openAipApiKey,
      firebase,
      googleOAuth: {
        androidClientId: googleOAuthAndroidClientId,
        iosClientId: googleOAuthIosClientId,
        webClientId: googleOAuthWebClientId
      }
    }
  };
};

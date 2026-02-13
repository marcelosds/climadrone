module.exports = ({ config }) => {
  const firebase = {
    apiKey: "AIzaSyAvbLAXOirE8Vbg_hJ6n4YMlr5hG2wkXpc",
    authDomain: "climadrone-937bc.firebaseapp.com",
    projectId: "climadrone-937bc",
    storageBucket: "climadrone-937bc.appspot.com",
    messagingSenderId: "325954666614",
    appId: "1:325954666614:android:7187df09954be281f8df57"
  };
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const openWeatherApiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  const openAipApiKey = process.env.EXPO_PUBLIC_OPENAIP_API_KEY || process.env.EXPO_PUBLIC_OPENAIP_KEY || process.env.OPENAIP_API_KEY;
  const googleOAuthAndroidClientId = '325954666614-bdqu2umjmcpila5nrpgslqb3304dll3l.apps.googleusercontent.com';
  const googleOAuthIosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID || process.env.GOOGLE_OAUTH_IOS_CLIENT_ID || null;
  const googleOAuthWebClientId = "325954666614-eddjjgvodoab41am68dv2nd13npv1a3l.apps.googleusercontent.com"
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
    owner: "cameraip",
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
    scheme: "com.climadrone.app",
    extra: {
      eas: {
        projectId: "e7b3d673-441c-4e5c-b053-f481452e0fb4"
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

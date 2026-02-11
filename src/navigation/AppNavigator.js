import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Share, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import logger from '../utils/logger';
import { useApp } from '../contexts/AppContext';
import LoginScreen from '../screens/LoginScreen';

// Import screens
import WindCompassScreen from '../screens/WindCompassScreen';
import MapScreen from '../screens/MapScreen';
import FlightConditionsScreen from '../screens/FlightConditionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Custom tab icon component
const TabIcon = ({ name, focused, color }) => {
  const getIcon = () => {
    switch (name) {
      case 'WindCompass':
        return focused ? '🧭' : '🧭';
      case 'Map':
        return focused ? '🗺️' : '🗺️';
      case 'FlightConditions':
        return focused ? '✈️' : '✈️';
      case 'Settings':
        return focused ? '⚙️' : '⚙️';
      default:
        return '❓';
    }
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color }]}>{getIcon()}</Text>
      <Text style={[styles.label, { color }]}>
        {name === 'WindCompass'}
        {name === 'Map'}
        {name === 'FlightConditions'}
        {name === 'Settings'}
      </Text>
    </View>
  );
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="FlightConditions"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="WindCompass"
        component={WindCompassScreen}
        options={{ title: 'Bússola' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Mapa' }}
      />
      <Tab.Screen
        name="FlightConditions"
        component={FlightConditionsScreen}
        options={{ title: 'Condições' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
    </Tab.Navigator>
  );
};

const CustomDrawerContent = ({ navigation }) => {
  const { user, signOut } = useApp();
  const displayName = user?.displayName || user?.email || 'Usuário';
  const secondaryEmail =
    (Array.isArray(user?.providerData)
      ? user.providerData.find((p) => p?.email && p.email !== user?.email)?.email
      : null) || user?.email || '';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase();
  return (
    <DrawerContentScrollView>
      <View style={styles.drawerHeader}>
        <View style={styles.avatarWrapper}>
          <Image source={require('../../assets/icon.png')} style={styles.avatarImage} />
        </View>
        <View style={styles.drawerHeaderText}>
          <Text style={styles.drawerUserName}>{displayName}</Text>
          {!!secondaryEmail && <Text style={styles.drawerSubtitle}>{secondaryEmail}</Text>}
        </View>
      </View>
      <DrawerItem
        label="Bússola"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="compass" color={color} size={size} />
        )}
        onPress={() => navigation.navigate('MainTabs', { screen: 'WindCompass' })}
      />
      <DrawerItem
        label="Mapa"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="map" color={color} size={size} />
        )}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}
      />
      <DrawerItem
        label="Condições"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="airplane" color={color} size={size} />
        )}
        onPress={() => navigation.navigate('MainTabs', { screen: 'FlightConditions' })}
      />
      <DrawerItem
        label="Configurações"
        icon={({ color, size }) => (
          <AntDesign name="setting" color={color} size={size} />
        )}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}
      />
      <View style={styles.drawerDivider} />
      <DrawerItem
        label="Compartilhar com Amigos"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="share-variant" color={color} size={size} />
        )}
        onPress={async () => {
          try {
            await Share.share({
              title: 'ClimaDrone',
              message: 'Conheça o ClimaDrone! Baixe e avalie condições de voo para seu drone. https://play.google.com/store/apps/details?id=com.climadrone.app',
            });
          } catch (e) {
            logger.error('Share', 'Falha ao compartilhar', { error: String(e) });
          }
        }}
      />
      <DrawerItem
        label="Sobre"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="information-outline" color={color} size={size} />
        )}
        onPress={() => navigation.navigate('Sobre')}
      />
      <View style={styles.drawerDivider} />
      <DrawerItem
        label="Sair"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="logout" color={color} size={size} />
        )}
        onPress={async () => {
          try {
            await signOut();
          } catch (e) {
            logger.error('Auth', 'Erro ao sair', { error: String(e) });
          }
        }}
      />
    </DrawerContentScrollView>
  );
};

const AppNavigator = () => {
  const { user } = useApp();
  
  useEffect(() => {
    logger.success('Navigation', 'Container iniciado');
  }, []);
  
  return (
    <NavigationContainer>
      {!user ? (
        <LoginScreen />
      ) : (
      <Drawer.Navigator
        screenOptions={{ headerShown: false, swipeEnabled: true, drawerPosition: 'left' }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="MainTabs" component={MainTabs} />
        <Drawer.Screen name="Sobre" component={AboutScreen} />
      </Drawer.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  drawerUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  drawerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    marginRight: 12,
    position: 'relative',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
  },
  drawerHeaderText: {
    flex: 1,
  },
});

export default AppNavigator;

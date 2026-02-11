import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';
import AppHeader from '../components/AppHeader';
import { DRONE_MODELS, UNITS, COLORS } from '../constants';

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, resetSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [droneDropdownOpen, setDroneDropdownOpen] = useState(false);
  const menuMaxHeight = Math.min(Dimensions.get('window').height * 0.5, 360);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleDroneModelChange = (model) => {
    const drone = DRONE_MODELS[model];
    const newSettings = { ...localSettings, droneModel: model };
    if (drone?.maxWindSpeed != null) newSettings.maxWindSpeed = drone.maxWindSpeed;
    if (drone?.maxGustSpeed != null) newSettings.maxGustSpeed = drone.maxGustSpeed;
    if (drone?.minVisibility != null) newSettings.minVisibility = drone.minVisibility;
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar Padrões',
      'Tem certeza de que deseja restaurar as configurações padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            setLocalSettings({
              droneModel: 'DJI Mini 4K',
              windSpeedUnit: UNITS.WIND_SPEED.KMH,
              temperatureUnit: UNITS.TEMPERATURE.CELSIUS,
              visibilityUnit: UNITS.VISIBILITY.KM,
              maxWindSpeed: DRONE_MODELS['DJI Mini 4K'].maxWindSpeed,
              maxGustSpeed: DRONE_MODELS['DJI Mini 4K'].maxGustSpeed,
              minVisibility: DRONE_MODELS['DJI Mini 4K'].minVisibility,
              autoRefresh: true,
              refreshInterval: 300000,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Configurações" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 20) + 70, // Tab bar height (60) + safe area + extra padding
        }}
      >
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Personalize o aplicativo para suas necessidades</Text>
        </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modelo do Drone</Text>
        <View style={styles.comboBox}>
          <TouchableOpacity style={styles.comboTrigger} onPress={() => setDroneDropdownOpen((v) => !v)}>
            <Text style={styles.comboTriggerText}>{localSettings.droneModel}</Text>
            <Text style={styles.comboArrow}>{droneDropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {droneDropdownOpen && (
            <View style={styles.comboMenu}>
              <ScrollView
                style={{ maxHeight: menuMaxHeight }}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {Object.keys(DRONE_MODELS).map((model) => (
                  <TouchableOpacity
                    key={model}
                    style={[styles.comboItem, localSettings.droneModel === model && styles.comboItemSelected]}
                    onPress={() => {
                      handleDroneModelChange(model);
                      setDroneDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.comboItemText, localSettings.droneModel === model && styles.comboItemTextSelected]}>
                      {model}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Limits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limites</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Limite máximo de vento (km/h)</Text>
          <TextInput
            style={styles.input}
            value={String(localSettings.maxWindSpeed)}
            onChangeText={(value) => handleSettingChange('maxWindSpeed', parseInt(value) || 0)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Limite máximo de rajada (km/h)</Text>
          <TextInput
            style={styles.input}
            value={String(localSettings.maxGustSpeed)}
            onChangeText={(value) => handleSettingChange('maxGustSpeed', parseInt(value) || 0)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Limite mínimo de visibilidade (km)</Text>
          <TextInput
            style={styles.input}
            value={String(localSettings.minVisibility)}
            onChangeText={(value) => handleSettingChange('minVisibility', parseFloat(value) || 0)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Units Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Unidades</Text>
        
        <View style={styles.optionGroup}>
          <Text style={styles.optionLabel}>Velocidade do vento</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionButtonSmall,
                localSettings.windSpeedUnit === UNITS.WIND_SPEED.KMH && styles.optionButtonSelected,
              ]}
              onPress={() => handleSettingChange('windSpeedUnit', UNITS.WIND_SPEED.KMH)}
            >
              <Text
                style={[
                  styles.optionTextSmall,
                  localSettings.windSpeedUnit === UNITS.WIND_SPEED.KMH && styles.optionTextSelected,
                ]}
              >
                km/h
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButtonSmall,
                localSettings.windSpeedUnit === UNITS.WIND_SPEED.MS && styles.optionButtonSelected,
              ]}
              onPress={() => handleSettingChange('windSpeedUnit', UNITS.WIND_SPEED.MS)}
            >
              <Text
                style={[
                  styles.optionTextSmall,
                  localSettings.windSpeedUnit === UNITS.WIND_SPEED.MS && styles.optionTextSelected,
                ]}
              >
                m/s
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionLabel}>Temperatura</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionButtonSmall,
                localSettings.temperatureUnit === UNITS.TEMPERATURE.CELSIUS && styles.optionButtonSelected,
              ]}
              onPress={() => handleSettingChange('temperatureUnit', UNITS.TEMPERATURE.CELSIUS)}
            >
              <Text
                style={[
                  styles.optionTextSmall,
                  localSettings.temperatureUnit === UNITS.TEMPERATURE.CELSIUS && styles.optionTextSelected,
                ]}
              >
                °C
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButtonSmall,
                localSettings.temperatureUnit === UNITS.TEMPERATURE.FAHRENHEIT && styles.optionButtonSelected,
              ]}
              onPress={() => handleSettingChange('temperatureUnit', UNITS.TEMPERATURE.FAHRENHEIT)}
            >
              <Text
                style={[
                  styles.optionTextSmall,
                  localSettings.temperatureUnit === UNITS.TEMPERATURE.FAHRENHEIT && styles.optionTextSelected,
                ]}
              >
                °F
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionLabel}>Visibilidade</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionButtonSmall,
                localSettings.visibilityUnit === UNITS.VISIBILITY.KM && styles.optionButtonSelected,
              ]}
              onPress={() => handleSettingChange('visibilityUnit', UNITS.VISIBILITY.KM)}
            >
              <Text
                style={[
                  styles.optionTextSmall,
                  localSettings.visibilityUnit === UNITS.VISIBILITY.KM && styles.optionTextSelected,
                ]}
              >
                km
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButtonSmall,
                localSettings.visibilityUnit === UNITS.VISIBILITY.MILES && styles.optionButtonSelected,
              ]}
              onPress={() => handleSettingChange('visibilityUnit', UNITS.VISIBILITY.MILES)}
            >
              <Text
                style={[
                  styles.optionTextSmall,
                  localSettings.visibilityUnit === UNITS.VISIBILITY.MILES && styles.optionTextSelected,
                ]}
              >
                milhas
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* General Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações Gerais</Text>
        
        <View style={styles.switchGroup}>
          <Text style={styles.switchLabel}>Atualização automática</Text>
          <Switch
            value={localSettings.autoRefresh}
            onValueChange={(value) => handleSettingChange('autoRefresh', value)}
            trackColor={{ false: '#767577', true: COLORS.conditionsAccent }}
            thumbColor={localSettings.autoRefresh ? COLORS.conditionsAccent : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Reset Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Restaurar Padrões</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  comboBox: {
    marginTop: 8
  },
  comboTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  comboTriggerText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600'
  },
  comboArrow: {
    fontSize: 14,
    color: COLORS.textSecondary
  },
  comboMenu: {
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden'
  },
  comboItem: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  comboItemSelected: {
    backgroundColor: '#f1f5f9'
  },
  comboItemText: {
    fontSize: 14,
    color: COLORS.text
  },
  comboItemTextSelected: {
    fontWeight: '600',
    color: COLORS.conditionsAccent
  },
  scrollView: {
    flex: 1,
  },
  subtitleContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.conditionsAccent,
    borderColor: COLORS.conditionsAccent,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  optionButtonSmall: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.background,
    flex: 1,
  },
  optionTextSmall: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  resetButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;

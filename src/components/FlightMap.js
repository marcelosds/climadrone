import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator, Modal, Pressable } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, Circle, Polygon, PROVIDER_GOOGLE, enableLatestRenderer } from 'react-native-maps';
import logger from '../utils/logger';
import { useOpenAipAirspace } from '../hooks/useOpenAipAirspace';
try { enableLatestRenderer(); } catch (e) {}

const FlightMap = React.forwardRef(({ location, windDirection, windSpeed }, ref) => {
  if (!location) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <Text style={styles.fallbackTitle}>Localização não disponível</Text>
        <Text style={styles.fallbackText}>
          Aguarde enquanto obtemos sua localização.
        </Text>
      </View>
    );
  }
  

  const warningZones = [
    {
      id: 1,
      name: 'Chapecó Airport',
      latitude: location.latitude + 0.01,
      longitude: location.longitude + 0.02,
      radius: 1000, // 1km radius
      type: 'airport'
    },
    {
      id: 2,
      name: 'Área Restrita',
      latitude: location.latitude - 0.015,
      longitude: location.longitude - 0.01,
      radius: 500, // 500m radius
      type: 'restricted'
    }
  ];

  // Validar coordenadas
  const lat = Number(location.latitude);
  const lon = Number(location.longitude);
  
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <Text style={styles.fallbackTitle}>Coordenadas inválidas</Text>
        <Text style={styles.fallbackText}>
          Localização não disponível ou inválida.
        </Text>
      </View>
    );
  }

  const [mapError, setMapError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const googleKey = Constants?.expoConfig?.extra?.googleMapsApiKey;
  const { airspaces, loading: airLoading, error: airError, fetchDebounced, limitsToText } = useOpenAipAirspace();
  const regionRef = useRef(null);

  if (Platform.OS === 'android' && !googleKey) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <Text style={styles.fallbackTitle}>Mapa indisponível</Text>
        <Text style={styles.fallbackText}>
          Chave do Google Maps ausente. Configure GOOGLE_MAPS_API_KEY e gere um build nativo.
        </Text>
      </View>
    );
  }

  const initialRegion = useMemo(() => ({
    latitude: lat,
    longitude: lon,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }), [lat, lon]);

  return (
    <View style={styles.container}>
      <MapView
        ref={ref}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        mapType="terrain"
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        zoomControlEnabled={true}
        toolbarEnabled={true}
        showsTraffic={true}
        showsBuildings={true}
        showsIndoors={true}
        showsIndoorLevelPicker={true}
        showsPointsOfInterest={true}
        liteMode={false}
        maxZoomLevel={20}
        initialRegion={initialRegion}
        onMapReady={() => {
          setMapLoaded(true);
          setMapError(null);
          logger.success('Map', 'MapReady');
          regionRef.current = initialRegion;
          fetchDebounced(initialRegion);
        }}
        onMapLoaded={() => {
          setMapLoaded(true);
          setMapError(null);
          logger.success('Map', 'MapLoaded');
        }}
        onRegionChangeComplete={(region) => {
          regionRef.current = region;
          fetchDebounced(region);
        }}
        onError={(error) => {
          setMapError(error?.message || 'Erro desconhecido');
          logger.error('Map', 'Erro ao carregar mapa', error?.message);
        }}
      >
        <Marker
          coordinate={{
            latitude: lat,
            longitude: lon,
          }}
          title="Localização Atual"
          description="Você está aqui"
          pinColor="#2563eb"
        />

        <Circle
          center={{
            latitude: lat,
            longitude: lon,
          }}
          radius={500}
          fillColor="rgba(14, 165, 233, 0.18)"
          strokeColor="#0ea5e9"
          strokeWidth={2}
        />

        

        {warningZones.map((zone) => {
          const zoneLat = Number(zone.latitude);
          const zoneLon = Number(zone.longitude);
          const zoneRadius = Number(zone.radius);
          
          if (isNaN(zoneLat) || isNaN(zoneLon) || isNaN(zoneRadius)) {
            return null;
          }
          
          return (
            <React.Fragment key={zone.id}>
              <Circle
                center={{
                  latitude: zoneLat,
                  longitude: zoneLon,
                }}
                radius={zoneRadius}
                fillColor={zone.type === 'airport' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                strokeColor={zone.type === 'airport' ? '#f59e0b' : '#ef4444'}
                strokeWidth={2}
              />
              <Marker
                coordinate={{
                  latitude: zoneLat,
                  longitude: zoneLon,
                }}
                title={zone.name}
                description={`Zona de aviso - ${zone.type === 'airport' ? 'Aeroporto' : 'Área restrita'}`}
                pinColor={zone.type === 'airport' ? '#f59e0b' : '#ef4444'}
              />
            </React.Fragment>
          );
        })}
        {airspaces.map((a) => (
          <Polygon
            key={a.id}
            coordinates={a.coordinates}
            fillColor={a.fillColor}
            strokeColor={a.strokeColor}
            strokeWidth={a.strokeWidth}
            tappable={true}
            onPress={() => setSelected(a)}
          />
        ))}
      </MapView>
      {mapError && (
        <View style={styles.overlayError}>
          <Text style={styles.overlayErrorTitle}>Falha ao carregar mapa</Text>
          <Text style={styles.overlayErrorText}>{mapError}</Text>
        </View>
      )}
      {airLoading && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.overlayLoadingText}>Carregando espaço aéreo…</Text>
        </View>
      )}
      {airError && (
        <View style={styles.overlayError}>
          <Text style={styles.overlayErrorTitle}>Falha ao carregar espaço aéreo</Text>
          <Text style={styles.overlayErrorText}>{airError}</Text>
        </View>
      )}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selected?.name || 'Espaço aéreo'}</Text>
            <Text style={styles.modalText}>Tipo: {selected?.typeLabel}</Text>
            <Text style={styles.modalText}>Classe ICAO: {selected?.icaoClass ?? 'N/A'}</Text>
            <Text style={styles.modalText}>Limite inferior: {limitsToText(selected?.lowerLimit)}</Text>
            <Text style={styles.modalText}>Limite superior: {limitsToText(selected?.upperLimit)}</Text>
            <Pressable style={styles.modalButton} onPress={() => setSelected(null)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 360,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  },
  overlayError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.8)'
  },
  overlayLoading: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  overlayLoadingText: {
    marginTop: 6,
    fontSize: 12,
    color: '#374151'
  },
  overlayErrorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 6
  },
  overlayErrorText: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center'
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  fallbackText: {
    fontSize: 14,
    marginTop: 8
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  modalText: {
    fontSize: 14,
    marginBottom: 4
  },
  modalButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default FlightMap;

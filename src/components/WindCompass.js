import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const WindCompass = ({ windSpeed, windDirection, windGust, unit, convertWindSpeed, heading = 0, isFixed = true }) => {
  const directionText = getWindDirection(windDirection);
  const arrowRotation = isFixed ? windDirection : windDirection + heading;
  
  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <View style={styles.compass}>
          {/* Compass Circle */}
          <View style={[styles.compassCircle, !isFixed ? { transform: [{ rotate: `${-heading}deg` }] } : null]}>
            {/* Degree markings */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => (
              <View
                key={degree}
                style={[
                  styles.degreeMark,
                  {
                    transform: [
                      { rotate: `${degree}deg` },
                      { translateY: -80 }
                    ]
                  }
                ]}
              >
                <Text style={styles.degreeText}>{degree}</Text>
              </View>
            ))}
            
            {/* Cardinal directions */}
            <Text style={[styles.cardinal, styles.north]}>N</Text>
            <Text style={[styles.cardinal, styles.east]}>E</Text>
            <Text style={[styles.cardinal, styles.south]}>S</Text>
            <Text style={[styles.cardinal, styles.west]}>W</Text>
            
            {/* Wind direction arrow */}
            <View
              style={[
                styles.windArrow,
                {
                  transform: [{ rotate: `${arrowRotation}deg` }]
                }
              ]}
            >
              <View style={styles.arrowHead} />
              <View style={styles.arrowShaft} />
            </View>
            
            {/* Center dot */}
            <View style={styles.centerDot} />
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.directionText}>
            Vento soprando para {Math.round(windDirection)}° {directionText}
          </Text>
          <View style={styles.speedContainer}>
            <View style={styles.speedItem}>
              <Text style={styles.speedLabel}>Velocidade</Text>
              <Text style={styles.speedValue}>
                {convertWindSpeed ? convertWindSpeed(windSpeed) : Math.round(windSpeed)} {unit || 'km/h'}
              </Text>
            </View>
            <View style={styles.speedItem}>
              <Text style={styles.speedLabel}>Rajadas</Text>
              <Text style={styles.speedValue}>
                {convertWindSpeed ? convertWindSpeed(windGust) : Math.round(windGust)} {unit || 'km/h'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compassContainer: {
    alignItems: 'center',
  },
  compass: {
    marginBottom: 20,
  },
  compassCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  degreeMark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -8,
  },
  degreeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardinal: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  north: {
    top: 28,
    left: '50%',
    marginLeft: -8,
  },
  east: {
    right: 28,
    top: '50%',
    marginTop: -8,
  },
  south: {
    bottom: 28,
    left: '50%',
    marginLeft: -8,
  },
  west: {
    left: 28,
    top: '50%',
    marginTop: -8,
  },
  windArrow: {
    position: 'absolute',
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.danger,
    marginBottom: -2,
  },
  arrowShaft: {
    width: 4,
    height: 60,
    backgroundColor: COLORS.danger,
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: 'absolute',
  },
  infoContainer: {
    alignItems: 'center',
  },
  directionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  speedItem: {
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  speedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default WindCompass;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AboutScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 100 }]}>
        <Image source={require('../../assets/icon.png')} style={styles.appIcon} />
        <Text style={styles.title}>Sobre o ClimaDrone</Text>
        <Text style={styles.description}>
          O ClimaDrone ajuda pilotos de drone a avaliar rapidamente condições de voo,
          combinando dados meteorológicos com limites configuráveis por modelo.
        </Text>
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="compass-outline" size={18} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Bússola do vento e direção detalhada</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="map-outline" size={18} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Mapa interativo com área de operação</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="airplane" size={18} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Avaliação de condições de voo</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="tune" size={18} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Configurações com modelos de drones</Text>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 12) + 32 }]}>
        <Text style={styles.footer}>Desenvolvido por MS Solutions</Text>
        <Text
          style={styles.footerContact}
          onPress={() => Linking.openURL('mailto:mstecnologiaesistemas@gmail.com')}
        >
          Email: mstecnologiaesistemas@gmail.com
        </Text>
        <Text style={styles.footerVersion}>Versão 1.0.0 2026 ClimaDrone</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 600,
  },
  features: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingHorizontal: 16
  },
  footer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '700'
  },
  footerVersion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  footerContact: {
    fontSize: 14,
    color: COLORS.conditionsAccent,
    marginTop: 6,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default AboutScreen;

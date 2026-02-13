import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../constants';
import logger from '../utils/logger';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

const PALETTE = {
  bgTop: '#5EA6F0',
  bgMid: '#9ED4FF',
  bgBottom: '#FFD6C5',
  welcome: '#214F7E',
  brandClima: '#2CA2FF',
  brandDrone: '#2BC15E',
  inputText: '#1C3B5A',
  placeholder: '#8FB0D6',
  emailIcon: '#69A9F0',
  lockIcon: '#8AA3CC',
  dividerText: '#3B5A7A',
  googleText: '#3B5574',
  loginGradLeft: '#0E79FF',
  loginGradRight: '#23C0AA',
  signupText: '#4C5E7A'
};
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { signInEmailPassword, registerEmailPassword, signInWithGoogleCredential, resetPassword, loading, setErrorState, clearError, error, auth } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const googleCfg = Constants?.expoConfig?.extra?.googleOAuth || {};
  const firebaseCfg = Constants?.expoConfig?.extra?.firebase || {};


  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleCfg.androidClientId,
    iosClientId: googleCfg.iosClientId,
    webClientId: googleCfg.webClientId,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true
  });

   useEffect(() => {
  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      try {
        const idToken = response.authentication?.idToken;

        if (!idToken) {
          setErrorState('Não foi possível obter token do Google');
          return;
        }

        await signInWithGoogleCredential(idToken);
      } catch (e) {
        setErrorState('Falha no login com Google');
      }
    }
  };

  handleGoogleResponse();
  }, [response]);

  const onSignIn = async () => {
    try {
      clearError();
      const e = email.trim();
      const p = password;
      logger.info('Login', 'Entrar iniciado', { email: e ? true : false });
      if (!auth) return;
      if (!e || !p) {
        setErrorState('Informe e-mail e senha');
        logger.warn('Login', 'Campos obrigatórios ausentes');
        return;
      }
      setLocalLoading(true);
      const u = await signInEmailPassword(e, p);
      logger.success('Login', 'Autenticado', { uid: u?.uid, email: u?.email });
    } catch (e) {
      setErrorState(e?.message || 'Falha no login');
      logger.error('Login', 'Falha no login', e?.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const onRegister = async () => {
    try {
      clearError();
      const e = email.trim();
      const p = password;
      logger.info('Cadastro', 'Cadastro iniciado', { email: e ? true : false });
      if (!auth) return;
      if (!e || !p) {
        setErrorState('Informe e-mail e senha');
        logger.warn('Cadastro', 'Campos obrigatórios ausentes');
        return;
      }
      if (p.length < 6) {
        setErrorState('Senha precisa ter pelo menos 6 caracteres');
        logger.warn('Cadastro', 'Senha muito curta');
        return;
      }
      setLocalLoading(true);
      const u = await registerEmailPassword(e, p);
      logger.success('Cadastro', 'Conta criada', { uid: u?.uid, email: u?.email });
    } catch (e) {
      setErrorState(e?.message || 'Falha no cadastro');
      logger.error('Cadastro', 'Falha no cadastro', e?.message);
    } finally {
      setLocalLoading(false);
    }
  };

const onGoogleSignIn = async () => {
  try {
    await promptAsync();
  } catch (e) {
    setErrorState('Erro ao iniciar login Google');
  }
  };

  const onForgotPassword = async () => {
    try {
      clearError();
      const e = email.trim();
      if (!auth) return;
      if (!e) {
        setErrorState('Informe seu e-mail para resetar a senha');
        return;
      }
      setLocalLoading(true);
      await resetPassword(e);
      Alert.alert('Verifique seu e-mail', 'Enviamos um link para redefinir sua senha.');
    } catch (err) {
      setErrorState(err?.message || 'Falha ao enviar e-mail de redefinição');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <LinearGradient
        colors={[PALETTE.bgTop, PALETTE.bgMid, PALETTE.bgBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bg}
      />
      <View style={styles.header}>
        <Text style={styles.welcome}>Seja Bem Vindo ao</Text>
        <View style={styles.headerIconWrapper}>
          <Image source={require('../../assets/icon.png')} style={styles.headerIcon} />
        </View>
        <View style={styles.brandRow}>
          <Text style={styles.brandClima}>Clima</Text>
          <Text style={styles.brandDrone}>Drone</Text>
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{String(error)}</Text> : null}
      
      <View style={styles.inputsContainer}>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="email-outline" size={22} color={PALETTE.emailIcon} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Digite seu e-mail"
            placeholderTextColor={PALETTE.placeholder}
          />
        </View>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="lock-outline" size={22} color={PALETTE.lockIcon} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            placeholder="Digite sua senha"
            placeholderTextColor={PALETTE.placeholder}
          />
          <TouchableOpacity style={styles.toggleButton} onPress={() => setPasswordVisible((v) => !v)}>
            <MaterialCommunityIcons name={passwordVisible ? 'eye' : 'eye-off'} size={22} color={PALETTE.lockIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.forgotButton} onPress={onForgotPassword} disabled={localLoading || loading || !auth}>
          <Text style={styles.forgotButtonText}>Esqueci minha senha!</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.loginButton} onPress={onSignIn}>
          <LinearGradient colors={[PALETTE.loginGradLeft, PALETTE.loginGradRight]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.loginButtonGradient}>
            <Text style={styles.loginButtonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={onRegister} disabled={localLoading || loading || !auth}>
          <Text style={styles.signupButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} disabled={!request || !auth} onPress={onGoogleSignIn}>
        <View style={styles.googleInner}>
          <AntDesign name="google" size={20} color="#EA4335" />
          <Text style={styles.googleButtonText}>Login com Google</Text>
        </View>
      </TouchableOpacity>

      {(localLoading || loading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.surface} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9ed4ff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  bg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  header: {
    alignItems: 'center',
    marginBottom: 18
  },
  welcome: {
    fontSize: 16,
    color: PALETTE.welcome,
    fontWeight: '600',
    marginBottom: 2
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  brandClima: {
    fontSize: 44,
    color: PALETTE.brandClima,
    fontWeight: '800',
    marginRight: 6
  },
  brandDrone: {
    fontSize: 44,
    color: PALETTE.brandDrone,
    fontWeight: '800'
  },
  headerIcon: {
    width: 110,
    height: 110,
    resizeMode: 'cover'
  },
  headerIconWrapper: {
    width: 80,
    height: 80,
    marginVertical: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputsContainer: { marginBottom: 10 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginBottom: 12
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: PALETTE.inputText
  },
  toggleButton: {
    paddingLeft: 8,
    height: 48,
    justifyContent: 'center'
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  loginButton: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 6
  },
  loginButtonGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  signupButton: {
    flex: 1,
    height: 48,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginLeft: 6
  },
  signupButtonText: {
    color: PALETTE.signupText,
    fontSize: 16,
    fontWeight: '700'
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dividerText: {
    marginHorizontal: 8,
    color: PALETTE.dividerText,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 6
  },
  forgotButtonText: {
    color: PALETTE.loginGradLeft,
    fontSize: 14,
    fontWeight: '600'
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  googleButton: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  googleButtonText: {
    color: PALETTE.googleText,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10
  },
  googleInner: { flexDirection: 'row', alignItems: 'center' },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;

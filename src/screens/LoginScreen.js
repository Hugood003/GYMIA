import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { RADIUS, SPACING } from '../tokens';
import { CTA, Hairline } from '../components/UI';
import { IconShield, IconCheck, IconChevRight, IconEye } from '../components/Icons';

WebBrowser.maybeCompleteAuthSession();

// ─── Reemplaza con tus credenciales de Google Cloud Console ───
const GOOGLE_WEB_CLIENT_ID    = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID    || null;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || null;
const GOOGLE_IOS_CLIENT_ID    = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID    || null;
// ──────────────────────────────────────────────────────────────

const ACCOUNTS_KEY = 'gymia_accounts';

async function getAccounts() {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveAccount(email, password, name) {
  const accounts = await getAccounts();
  accounts.push({ email: email.toLowerCase().trim(), password, name });
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function BrandMark({ T }) {
  return (
    <View style={{ width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: T.ink, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: T.accent, fontSize: 18, fontWeight: '800' }}>G</Text>
    </View>
  );
}

function SegSwitch({ T, mode, setMode }) {
  return (
    <View style={{ flexDirection: 'row', padding: 4, gap: 2, backgroundColor: T.surface, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline }}>
      {[['signin', 'Entrar'], ['signup', 'Crear']].map(([id, label]) => {
        const on = mode === id;
        return (
          <TouchableOpacity key={id} onPress={() => setMode(id)} style={{ backgroundColor: on ? T.ink : 'transparent', paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.pill }}>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: on ? '600' : '500', color: on ? T.bg : T.ink3 }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FieldInput({ T, label, value, onChangeText, placeholder, secureTextEntry, right, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: error ? T.alert : focused ? T.ink : T.hairline, borderRadius: RADIUS.lg, padding: SPACING.md }}>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: error ? T.alert : T.ink3, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            value={value} onChangeText={onChangeText} placeholder={placeholder}
            placeholderTextColor={T.ink3} secureTextEntry={secureTextEntry}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ flex: 1, color: T.ink, fontSize: 16, fontWeight: '500', padding: 0 }}
          />
          {right}
        </View>
      </View>
      {!!error && <Text style={{ fontFamily: 'System', fontSize: 12, color: T.alert, marginTop: 6, marginLeft: 4 }}>{error}</Text>}
    </View>
  );
}

function validate(mode, email, pass, name) {
  const errors = {};
  if (mode === 'signup' && name.trim().length < 2) errors.name = 'Escribe tu nombre (mínimo 2 caracteres)';
  if (!email.includes('@') || !email.includes('.')) errors.email = 'Introduce un email válido';
  if (pass.length < 6) errors.pass = 'La contraseña debe tener al menos 6 caracteres';
  return errors;
}

export default function LoginScreen({ navigation, T }) {
  const [mode, setMode]         = useState('signin');
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [name, setName]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const isSignup = mode === 'signup';

  // ── Google OAuth ──────────────────────────────────────────────
  const [googleRequest, googleResponse, googlePrompt] = Google.useAuthRequest({
    webClientId:     GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId:     GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    handleGoogleSuccess(googleResponse.authentication.accessToken);
  }, [googleResponse]);

  const handleGoogleSuccess = async (accessToken) => {
    setLoading(true);
    try {
      const res  = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const info = await res.json();
      const email = info.email?.toLowerCase();
      const name  = info.name || info.given_name || 'Usuario';

      const accounts = await getAccounts();
      const exists   = accounts.find(a => a.email === email);
      if (!exists) {
        await saveAccount(email, '__google__', name);
        navigation.replace('Onboarding', { name });
      } else {
        navigation.replace('Main');
      }
    } catch {
      setErrors({ email: 'Error al iniciar con Google. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const errs = validate(mode, email, pass, name);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const accounts = await getAccounts();
      const normalizedEmail = email.toLowerCase().trim();

      if (isSignup) {
        const exists = accounts.find(a => a.email === normalizedEmail);
        if (exists) {
          setErrors({ email: 'Este email ya tiene una cuenta. Inicia sesión.' });
          return;
        }
        await saveAccount(normalizedEmail, pass, name.trim());
        navigation.replace('Onboarding', { name: name.trim() });
      } else {
        const account = accounts.find(a => a.email === normalizedEmail);
        if (!account) {
          setErrors({ email: 'No encontramos esta cuenta. ¿Quieres crearla?' });
          return;
        }
        if (account.password !== pass) {
          setErrors({ pass: 'Contraseña incorrecta.' });
          return;
        }
        navigation.replace('Main');
      }
    } catch {
      setErrors({ email: 'Error al conectar. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, val) => {
    if (field === 'email')  setEmail(val);
    if (field === 'pass')   setPass(val);
    if (field === 'name')   setName(val);
    if (submitted) {
      const next = { email: field === 'email' ? val : email, pass: field === 'pass' ? val : pass, name: field === 'name' ? val : name };
      setErrors(validate(mode, next.email, next.pass, next.name));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BrandMark T={T} />
            <View>
              <Text style={{ fontFamily: 'System', fontSize: 16, fontWeight: '700', color: T.ink, letterSpacing: -0.3 }}>GYMIA</Text>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 2 }}>Coach · IA</Text>
            </View>
          </View>
          <SegSwitch T={T} mode={mode} setMode={(m) => { setMode(m); setErrors({}); setSubmitted(false); }} />
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 40, paddingBottom: 6 }}>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10 }}>
            {isSignup ? 'Empezar · 2 minutos' : 'Bienvenido de vuelta'}
          </Text>
          <Text style={{ fontFamily: 'System', fontSize: 32, fontWeight: '700', color: T.ink, letterSpacing: -0.8, lineHeight: 36 }}>
            {isSignup ? 'Tu coach te\nestá ' : 'Sigamos donde\nlo '}
            <Text style={{ backgroundColor: T.accent, color: T.accentInk }}>{isSignup ? 'esperando' : 'dejaste'}</Text>.
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.md, gap: 10 }} keyboardShouldPersistTaps="handled">
          {isSignup && (
            <FieldInput T={T} label="Nombre" value={name} onChangeText={v => handleChange('name', v)} placeholder="Tu nombre" error={errors.name} />
          )}
          <FieldInput T={T} label="Email" value={email} onChangeText={v => handleChange('email', v)} placeholder="tu@email.com" error={errors.email} />
          <FieldInput
            T={T} label="Contraseña" value={pass} onChangeText={v => handleChange('pass', v)}
            placeholder="Mínimo 6 caracteres" secureTextEntry={!showPass} error={errors.pass}
            right={
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <IconEye size={18} color={T.ink3} open={showPass} />
              </TouchableOpacity>
            }
          />

          {!isSignup && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 }}>
              <TouchableOpacity onPress={() => setRemember(!remember)} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                <View style={{ width: 18, height: 18, borderRadius: 6, borderWidth: 1.5, borderColor: remember ? T.accent : T.hairline, backgroundColor: remember ? T.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {remember && <IconCheck size={12} color={T.accentInk} />}
                </View>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: T.ink2 }}>Recordarme</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: T.ink, fontWeight: '500', textDecorationLine: 'underline' }}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
          )}

          {isSignup && (
            <View style={{ marginTop: 4, padding: 14, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.lg, flexDirection: 'row', gap: 10 }}>
              <IconShield size={16} color={T.accent} />
              <Text style={{ flex: 1, fontFamily: 'System', fontSize: 12, color: T.ink2, lineHeight: 18 }}>
                Al crear tu cuenta aceptas los <Text style={{ color: T.ink, fontWeight: '600' }}>Términos</Text> y la <Text style={{ color: T.ink, fontWeight: '600' }}>Política de privacidad</Text>.
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <Hairline T={T} style={{ flex: 1 }} />
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.8, textTransform: 'uppercase' }}>O continúa con</Text>
            <Hairline T={T} style={{ flex: 1 }} />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Text style={{ fontFamily: 'System', fontSize: 14, fontWeight: '600', color: T.ink }}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => GOOGLE_WEB_CLIENT_ID ? googlePrompt() : setErrors({ email: 'Configura EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en .env' })}
              disabled={loading}
              style={{ flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading
                ? <ActivityIndicator size="small" color={T.ink} />
                : <Text style={{ fontFamily: 'System', fontSize: 14, fontWeight: '600', color: T.ink }}>Google</Text>
              }
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, paddingTop: SPACING.sm, backgroundColor: T.bg }}>
          <CTA T={T} onPress={handleSubmit} disabled={loading}
            icon={loading ? <ActivityIndicator size="small" color={T.accentInk} /> : <IconChevRight size={18} color={T.accentInk} />}>
            {loading ? 'Verificando…' : isSignup ? 'Crear cuenta' : 'Iniciar sesión'}
          </CTA>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14, gap: 4 }}>
            <Text style={{ fontFamily: 'System', fontSize: 13, color: T.ink2 }}>
              {isSignup ? '¿Ya tienes cuenta?' : '¿Eres nuevo en GYMIA?'}
            </Text>
            <TouchableOpacity onPress={() => { setMode(isSignup ? 'signin' : 'signup'); setErrors({}); setSubmitted(false); }}>
              <Text style={{ fontFamily: 'System', fontSize: 13, fontWeight: '600', color: T.ink, textDecorationLine: 'underline' }}>
                {isSignup ? 'Inicia sesión' : 'Crea tu cuenta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

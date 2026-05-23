import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { RADIUS, SPACING } from '../tokens';
import { PageHeader, IconBtn, Toggle } from '../components/UI';
import { IconSettings, IconFlame, IconTarget, IconDumb, IconCalendar, IconTimer, IconSpark, IconBell, IconChart, IconBolt, IconShield } from '../components/Icons';
import { useApp } from '../context/AppContext';

const GOAL_LABELS = { hipertrofia: 'Hipertrofia', fuerza: 'Fuerza', definicion: 'Definición', salud: 'Salud y forma' };
const LEVEL_LABELS = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };
const EQUIP_LABELS = { barra: 'Barra', mancuernas: 'Mancuernas', maquinas: 'Máquinas', racks: 'Rack/Banco', kettlebell: 'Kettlebells', cardio: 'Cardio' };

function ListGroup({ T, title, children }) {
  return (
    <View style={{ paddingHorizontal: SPACING.md, paddingTop: 14 }}>
      <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', paddingHorizontal: 4, paddingBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.lg, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}

function Row({ T, icon, label, value, last, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: T.hairline }}>
      <View>{icon}</View>
      <Text style={{ flex: 1, fontFamily: 'System', fontSize: 15, color: T.ink, letterSpacing: -0.2 }}>{label}</Text>
      {typeof value === 'string'
        ? <Text style={{ fontFamily: 'SpaceMono', fontSize: 12, color: T.ink3, letterSpacing: 0.4 }}>{value}</Text>
        : value}
    </TouchableOpacity>
  );
}

const REST_OPTIONS = ['60 seg', '90 seg', '2 min', '3 min'];

export default function ProfileScreen({ navigation, T, dark, setDark }) {
  const { state, streak } = useApp();
  const user = state.user;

  const [aiPrefs, setAiPrefs] = useState({ autoAdapt: true, sessionSuggestions: true, weeklyAnalysis: false });
  const [defaultRest, setDefaultRest] = useState('2 min');
  const [infoModal, setInfoModal] = useState(null); // { title, body }

  const toggleAI = key => setAiPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleRestChange = () => {
    const cur = REST_OPTIONS.indexOf(defaultRest);
    setDefaultRest(REST_OPTIONS[(cur + 1) % REST_OPTIONS.length]);
  };

  const handlePrivacy = () =>
    setInfoModal({
      title: 'Privacidad y datos',
      body: 'Tus datos se almacenan únicamente en este dispositivo. GYMIA no comparte información con terceros ni sube datos a servidores externos.\n\nPara eliminar todos tus datos, desinstala la aplicación.',
    });

  const handleNotifications = () =>
    setInfoModal({
      title: 'Notificaciones',
      body: 'Las notificaciones se gestionan desde los ajustes de tu dispositivo.\n\nVe a Ajustes → GYMIA → Notificaciones para activarlas o desactivarlas.',
    });

  const firstName = user?.name || 'Usuario';
  const initial = firstName[0]?.toUpperCase() || 'U';
  const goalLabel = GOAL_LABELS[user?.goal] || 'Sin definir';
  const levelLabel = LEVEL_LABELS[user?.level] || 'Sin definir';
  const equipLabel = user?.equip?.map(e => EQUIP_LABELS[e] || e).join(', ') || '—';
  const daysLabel = user?.days ? `${user.days} / semana` : '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PageHeader T={T} kicker="Perfil" title={firstName}
          right={
            <IconBtn T={T} onPress={() => navigation.navigate('Onboarding')}>
              <IconSettings size={20} color={T.ink} />
            </IconBtn>
          } />

        {/* Profile card */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 18 }}>
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: T.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'System', fontSize: 26, fontWeight: '700', color: T.bg }}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'System', fontSize: 18, fontWeight: '700', color: T.ink, letterSpacing: -0.4 }}>{firstName}</Text>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ink3, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 }}>{levelLabel} · {goalLabel}</Text>
              </View>
            </View>
            <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.hairline, flexDirection: 'row', justifyContent: 'space-around' }}>
              {[
                [user?.weight ? String(user.weight) : '—', 'kg', 'Peso'],
                [user?.height ? String(user.height) : '—', 'cm', 'Altura'],
                [user?.age ? String(user.age) : '—', '', 'Años'],
              ].map(([v, u, l]) => (
                <View key={l} style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                    <Text style={{ fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '500', color: T.ink, letterSpacing: -0.4 }}>{v}</Text>
                    {!!u && <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>{u}</Text>}
                  </View>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 4 }}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Streak */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 18 }}>
          <View style={{ backgroundColor: T.ink, borderRadius: RADIUS.xl, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
              <IconFlame size={26} color={T.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.4, textTransform: 'uppercase' }}>Racha actual</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 32, fontWeight: '500', color: '#fff', letterSpacing: -1, lineHeight: 36 }}>{streak}</Text>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>días</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.4, textTransform: 'uppercase' }}>Sesiones</Text>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 16, fontWeight: '500', color: '#fff', marginTop: 4 }}>{state.sessions.length} total</Text>
            </View>
          </View>
        </View>

        <ListGroup T={T} title="Entreno">
          <Row T={T} icon={<IconTarget size={18} color={T.ink2} />}   label="Objetivo"              value={goalLabel} />
          <Row T={T} icon={<IconDumb size={18} color={T.ink2} />}     label="Equipamiento"          value={user?.equip?.length ? `${user.equip.length} elementos` : '—'} />
          <Row T={T} icon={<IconCalendar size={18} color={T.ink2} />} label="Días activos"          value={daysLabel} />
          <Row T={T} icon={<IconTimer size={18} color={T.ink2} />}    label="Descanso por defecto"  value={defaultRest} onPress={handleRestChange} last />
        </ListGroup>

        <ListGroup T={T} title="Asistente IA">
          <Row T={T} icon={<IconSpark size={18} color={T.ink2} />}  label="Adaptación automática"  value={<Toggle T={T} on={aiPrefs.autoAdapt}          onPress={() => toggleAI('autoAdapt')} />}          onPress={() => toggleAI('autoAdapt')} />
          <Row T={T} icon={<IconBell size={18} color={T.ink2} />}   label="Sugerencias por sesión"  value={<Toggle T={T} on={aiPrefs.sessionSuggestions} onPress={() => toggleAI('sessionSuggestions')} />} onPress={() => toggleAI('sessionSuggestions')} />
          <Row T={T} icon={<IconChart size={18} color={T.ink2} />}  label="Análisis semanal"        value={<Toggle T={T} on={aiPrefs.weeklyAnalysis}     onPress={() => toggleAI('weeklyAnalysis')} />}     onPress={() => toggleAI('weeklyAnalysis')} last />
        </ListGroup>

        <ListGroup T={T} title="App">
          <Row T={T} icon={<IconBolt size={18} color={T.ink2} />}   label="Modo oscuro"        value={<Toggle T={T} on={dark} onPress={() => setDark(!dark)} />} onPress={() => setDark(!dark)} />
          <Row T={T} icon={<IconShield size={18} color={T.ink2} />} label="Privacidad y datos"  onPress={handlePrivacy} />
          <Row T={T} icon={<IconBell size={18} color={T.ink2} />}   label="Notificaciones"      onPress={handleNotifications} last />
        </ListGroup>

        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>GYMIA v1.0 · build 001</Text>
        </View>
      </ScrollView>

      {/* Info modal (web-compatible) */}
      {infoModal && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setInfoModal(null)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ backgroundColor: T.surface, borderRadius: RADIUS.xl, padding: 24, width: '100%', maxWidth: 360 }}>
            <Text style={{ fontFamily: 'System', fontSize: 17, fontWeight: '700', color: T.ink, letterSpacing: -0.3, marginBottom: 12 }}>{infoModal.title}</Text>
            <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink2, lineHeight: 22 }}>{infoModal.body}</Text>
            <TouchableOpacity onPress={() => setInfoModal(null)} style={{ marginTop: 20, backgroundColor: T.ink, borderRadius: RADIUS.pill, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'System', fontSize: 15, fontWeight: '600', color: T.bg }}>Entendido</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

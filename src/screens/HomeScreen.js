import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { RADIUS, SPACING } from '../tokens';
import { Section, PageHeader, IconBtn, Pill } from '../components/UI';
import { IconBell, IconPlay, IconCalendar, IconArrowUp, IconFlame, IconScale, IconSpark } from '../components/Icons';
import { useApp } from '../context/AppContext';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function StatBlock({ label, value, T, light }) {
  return (
    <View>
      <Text style={{ fontFamily: 'SpaceMono', fontSize: 28, fontWeight: '500', color: light ? '#fff' : T.ink, letterSpacing: -1 }}>{value}</Text>
      <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: light ? 'rgba(255,255,255,0.55)' : T.ink3, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 }}>{label}</Text>
    </View>
  );
}

function KpiCard({ T, kicker, big, unit, foot, icon }) {
  return (
    <View style={{ flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.lg, padding: SPACING.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>{kicker}</Text>
        {icon}
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 26, fontWeight: '500', color: T.ink, letterSpacing: -0.8, lineHeight: 28 }}>{big}</Text>
        {unit && <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ink3, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>{unit}</Text>}
      </View>
      <Text style={{ marginTop: 6, fontFamily: 'System', fontSize: 12, color: T.ink3 }}>{foot}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation, T }) {
  const { state, streak, sessionsThisWeek, volumeThisWeek } = useApp();
  const user = state.user;
  const plan = state.plan;
  const todaySession = plan?.find(d => d.status === 'today') || {};

  const now   = new Date();
  const dateStr = `${DAYS_ES[now.getDay()]} · ${now.getDate()} ${MONTHS_ES[now.getMonth()]}`;
  const firstName = user?.name?.split(' ')[0] || 'Atleta';
  const initial = firstName[0]?.toUpperCase() || 'A';
  const weekDone = sessionsThisWeek();
  const weekGoal = user?.days || 4;
  const volT = volumeThisWeek();

  const handleBell = () => {
    if (state.sessions.length === 0) {
      Alert.alert('Sin notificaciones', 'Completa tu primer entreno para recibir sugerencias personalizadas del coach.', [{ text: 'OK' }]);
    } else {
      const last = state.sessions[0];
      const mins = last.durationSec ? Math.round(last.durationSec / 60) : 0;
      const pending = weekGoal - weekDone;
      Alert.alert(
        'Actividad reciente',
        `Último entreno: ${last.label} (${mins} min · ${last.completedSets} series)\n\n${pending > 0 ? `Te quedan ${pending} sesión${pending > 1 ? 'es' : ''} para completar tu meta semanal.` : '¡Meta semanal completada! 🎯'}`,
        [{ text: 'Ver progreso', onPress: () => navigation.navigate('Progreso') }, { text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Greeting */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 8, paddingBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.6, textTransform: 'uppercase' }}>{dateStr}</Text>
            <Text style={{ fontFamily: 'System', fontSize: 28, fontWeight: '700', color: T.ink, letterSpacing: -0.6, marginTop: 4, lineHeight: 32 }}>{getGreeting()}, {firstName}.</Text>
            <Text style={{ fontFamily: 'System', fontSize: 15, color: T.ink2, marginTop: 2 }}>
              Hoy toca <Text style={{ color: T.ink, fontWeight: '700' }}>{(todaySession.label || 'Pierna').toLowerCase()}</Text>. {todaySession.exercises || 5} ejercicios, ~{todaySession.minutes || 70} min.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <IconBtn T={T} onPress={handleBell}><IconBell size={20} color={T.ink} /></IconBtn>
            <View style={{ width: 44, height: 44, borderRadius: RADIUS.pill, backgroundColor: T.ink, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'System', fontWeight: '600', fontSize: 16, color: T.bg }}>{initial}</Text>
            </View>
          </View>
        </View>

        {/* Today hero card */}
        <View style={{ paddingHorizontal: SPACING.md }}>
          <TouchableOpacity onPress={() => navigation.navigate('Session')} activeOpacity={0.9} style={{ backgroundColor: T.ink, borderRadius: RADIUS.xl, padding: 22, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pill T={T} tone="accent">SESIÓN DE HOY</Pill>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>04 / 12 sem</Text>
            </View>
            <Text style={{ marginTop: 18, fontFamily: 'System', fontSize: 22, fontWeight: '600', color: '#fff', letterSpacing: -0.4, lineHeight: 26 }}>
              {todaySession.label || 'Pierna · Cuádriceps dominante'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 18, marginTop: 16, marginBottom: 18, alignItems: 'flex-end' }}>
              <StatBlock label="Ejercicios" value={String(todaySession.exercises || 5)}  T={T} light />
              <View style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <StatBlock label="Minutos"   value={String(todaySession.minutes || 70)} T={T} light />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Session')} activeOpacity={0.85} style={{ backgroundColor: T.accent, borderRadius: RADIUS.pill, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <IconPlay size={18} color={T.accentInk} />
              <Text style={{ fontFamily: 'System', fontSize: 15, fontWeight: '600', color: T.accentInk }}>Empezar entreno</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Week strip */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
          <Section T={T} kicker="Semana 04" title="Tu plan" action="Ver todo" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {plan.map(d => {
              const isToday = d.status === 'today';
              const done    = d.status === 'done';
              const rest    = d.status === 'rest';
              return (
                <TouchableOpacity key={d.d} onPress={() => isToday ? navigation.navigate('Session') : navigation.navigate('Plan')} activeOpacity={0.75}
                  style={{ flex: 1, backgroundColor: isToday ? T.ink : T.surface, borderWidth: 1, borderColor: isToday ? T.ink : T.hairline, borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: isToday ? 'rgba(255,255,255,0.55)' : T.ink3 }}>{d.d}</Text>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 17, fontWeight: '600', color: isToday ? '#fff' : T.ink, marginTop: 4 }}>{d.date}</Text>
                  <View style={{ marginTop: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: done ? T.accent : rest ? 'transparent' : isToday ? T.accent : T.surface3, borderWidth: rest ? 1 : 0, borderColor: T.ink3 }} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* KPI cards */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
          <Section T={T} kicker="Estado" title="Esta semana" />
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <KpiCard T={T} kicker="Sesiones" big={`${weekDone}/${weekGoal}`} foot={weekDone >= weekGoal ? '¡Meta completada!' : `${weekGoal - weekDone} sesión${weekGoal - weekDone > 1 ? 'es' : ''} por delante`} icon={<IconCalendar size={16} color={T.accent} />} />
            <KpiCard T={T} kicker="Volumen"  big={volT > 0 ? String(volT) : '—'} unit={volT > 0 ? 't' : ''} foot="Esta semana" icon={<IconArrowUp size={16} color={T.ok} />} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <KpiCard T={T} kicker="Racha"  big={String(streak)} unit="d" foot={streak > 0 ? 'Mantén el ritmo 🔥' : 'Empieza hoy'} icon={<IconFlame size={16} color={T.warn} />} />
            <KpiCard T={T} kicker="Peso"   big={user?.weight ? String(user.weight) : '—'} unit={user?.weight ? 'kg' : ''} foot="Desde el perfil" icon={<IconScale size={16} color={T.ink2} />} />
          </View>
        </View>

        {/* AI suggestion */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
          <TouchableOpacity onPress={() => navigation.navigate('AI')} activeOpacity={0.85} style={{ borderWidth: 1, borderColor: state.sessions.length > 0 ? T.accent : T.hairline, borderStyle: state.sessions.length > 0 ? 'dashed' : 'solid', borderRadius: RADIUS.xl, padding: 18, backgroundColor: state.sessions.length > 0 ? T.accentSoft : T.surface }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                <IconSpark size={20} color={T.accentInk} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 }}>Coach GYMIA</Text>
                {state.sessions.length === 0 ? (
                  <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                    Bienvenido. <Text style={{ fontWeight: '700' }}>Completa tu primer entreno</Text> y empezaré a analizar tu progreso para darte sugerencias personalizadas.
                  </Text>
                ) : (
                  <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                    Llevas <Text style={{ fontWeight: '700' }}>{state.sessions.length} sesión{state.sessions.length > 1 ? 'es' : ''}</Text> registradas. Habla conmigo para ajustar tu plan.
                  </Text>
                )}
                <Text style={{ marginTop: 10, fontFamily: 'SpaceMono', fontSize: 11, color: T.ink2, letterSpacing: 0.8, textTransform: 'uppercase' }}>Tocar para abrir el chat →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

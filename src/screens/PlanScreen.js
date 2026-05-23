import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { RADIUS, SPACING } from '../tokens';
import { Pill, Section, PageHeader, IconBtn } from '../components/UI';
import { IconSettings, IconChevRight, IconSpark } from '../components/Icons';
import { useApp } from '../context/AppContext';

function DayRow({ T, d, onPress }) {
  const done  = d.status === 'done';
  const today = d.status === 'today';
  const rest  = d.status === 'rest';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={rest ? 1 : 0.8} style={{
      backgroundColor: today ? T.ink : T.surface,
      borderWidth: 1, borderColor: today ? T.ink : T.hairline,
      borderRadius: RADIUS.lg, padding: 14,
      flexDirection: 'row', alignItems: 'center', gap: 14,
      opacity: rest ? 0.7 : 1,
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: RADIUS.md,
        backgroundColor: today ? 'rgba(255,255,255,0.08)' : T.surface2,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase', color: today ? 'rgba(255,255,255,0.55)' : T.ink3 }}>{d.d}</Text>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 15, fontWeight: '600', color: today ? '#fff' : T.ink, lineHeight: 18 }}>{d.date}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'System', fontSize: 15, fontWeight: '600', color: today ? '#fff' : T.ink, letterSpacing: -0.2 }}>{d.label}</Text>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: today ? 'rgba(255,255,255,0.55)' : T.ink3, letterSpacing: 1, textTransform: 'uppercase', marginTop: 3 }}>
          {rest ? 'Día libre · movilidad opcional' : `${d.exercises} ejercicios · ${d.minutes} min`}
        </Text>
      </View>
      {done  && <Pill T={T} tone="soft">✓ Hecho</Pill>}
      {today && <Pill T={T} tone="accent">HOY</Pill>}
      {!done && !today && !rest && <IconChevRight size={16} color={T.ink3} />}
    </TouchableOpacity>
  );
}

export default function PlanScreen({ navigation, T }) {
  const { state } = useApp();
  const WEEK = state.plan;
  const [hint, setHint] = React.useState('pending'); // 'pending' | 'accepted' | 'dismissed'

  const activeDays = WEEK.filter(d => d.status !== 'rest').length;
  const totalMin   = WEEK.reduce((s, d) => s + (d.minutes || 0), 0);
  const totalHours = Math.floor(totalMin / 60);
  const remMin     = totalMin % 60;
  const timeLabel  = `${totalHours}h ${remMin > 0 ? remMin + 'm' : ''}`.trim();
  const hasHistory = state.sessions.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PageHeader T={T} kicker="Plan adaptativo" title="Semana 04"
          right={
            <IconBtn T={T} onPress={() => navigation.navigate('Onboarding')}>
              <IconSettings size={20} color={T.ink} />
            </IconBtn>
          } />

        {/* Summary */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 18 }}>
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-around' }}>
            {[[String(activeDays),'Días'], [hasHistory ? `${state.sessions.length}` : '—','Sesiones'], [timeLabel,'Tiempo']].map(([v, l]) => (
              <View key={l} style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '500', color: T.ink, letterSpacing: -0.5 }}>{v}</Text>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 }}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Phase pill */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pill T={T} tone="ink">Hipertrofia · Bloque 2</Pill>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ink3 }}>↑ +12% vol.</Text>
        </View>

        {/* Day list */}
        <View style={{ paddingHorizontal: SPACING.md, gap: 8 }}>
          {WEEK.map((d, i) => (
            <DayRow key={i} T={T} d={d} onPress={() => d.status !== 'rest' && navigation.navigate('Session')} />
          ))}
        </View>

        {/* Volume chart block */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
          <Section T={T} kicker="Periodización" title="Bloque actual" action="12 semanas" />
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
              <View>
                <Text style={{ fontFamily: 'System', fontSize: 16, fontWeight: '600', color: T.ink }}>Acumulación → Intensificación</Text>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ink3, marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>Semana 4 de 6 · desload en sem 6</Text>
              </View>
              <Pill T={T} tone="accent">EN CURSO</Pill>
            </View>
            {/* Mini bar chart */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {[60, 72, 78, 88, 92, 50].map((h, i) => {
                const cur = i === 3;
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6, height: 80, justifyContent: 'flex-end' }}>
                    <View style={{ width: '100%', height: h * 0.7, borderRadius: 6, backgroundColor: cur ? T.accent : i < 3 ? T.ink : T.surface2, opacity: cur ? 1 : i < 3 ? 0.85 : 1 }} />
                    <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: cur ? T.ink : T.ink3, letterSpacing: 0.8 }}>S{i+1}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* AI hint — solo visible tras al menos una sesión */}
        {hint !== 'dismissed' && hasHistory && (
          <View style={{ paddingHorizontal: SPACING.md, paddingTop: 18 }}>
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: hint === 'accepted' ? T.accent : T.hairline, borderRadius: RADIUS.xl, padding: SPACING.md, flexDirection: 'row', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                <IconSpark size={16} color={T.accentInk} />
              </View>
              <View style={{ flex: 1 }}>
                {hint === 'pending' ? (
                  <>
                    <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                      Detecté que <Text style={{ fontWeight: '700' }}>hombro</Text> aparece en 3 sesiones seguidas. ¿Quieres que lo redistribuya?
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => setHint('accepted')} style={{ backgroundColor: T.ink, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill }}>
                        <Text style={{ fontFamily: 'System', fontSize: 12, fontWeight: '600', color: T.bg }}>Sí, redistribuir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setHint('dismissed')} style={{ borderWidth: 1, borderColor: T.hairline, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill }}>
                        <Text style={{ fontFamily: 'System', fontSize: 12, fontWeight: '600', color: T.ink }}>No, mantener</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                    ✓ <Text style={{ fontWeight: '700' }}>Hombro redistribuido.</Text> He movido el trabajo de hombro al viernes para dejar 48 h de recuperación entre sesiones.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

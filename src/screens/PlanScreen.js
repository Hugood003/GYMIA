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

const TIPS = [
  'La progresión de carga es clave. Sube el peso solo cuando completes todas las series con buena técnica.',
  'El descanso es parte del entrenamiento. Dormir 7-9 h acelera la recuperación muscular.',
  'La hidratación afecta el rendimiento. Bebe agua antes, durante y después del entreno.',
  'Varía los ángulos de trabajo para estimular más fibras musculares en cada grupo.',
  'El calentamiento reduce lesiones. Dedica 5-10 min antes de la primera serie pesada.',
];

function computeHint(sessions) {
  const n = sessions.length;
  if (n === 0) return null;

  if (n < 3) {
    const left = 3 - n;
    return {
      type: 'onboarding',
      body: `Llevas ${n} sesión${n > 1 ? 'es' : ''} registrada${n > 1 ? 's' : ''}. Completa ${left} más y empezaré a detectar patrones en tu entrenamiento.`,
    };
  }

  // Count label categories in last 5 sessions
  const recent = sessions.slice(0, 5);
  const counts = {};
  for (const s of recent) {
    const key = s.label?.split('·')[0]?.trim() || s.label || 'Entreno';
    counts[key] = (counts[key] || 0) + 1;
  }
  const overloaded = Object.entries(counts).filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]);

  if (overloaded.length > 0) {
    const [label, count] = overloaded[0];
    return { type: 'warning', label, count };
  }

  return { type: 'tip', body: TIPS[n % TIPS.length] };
}

export default function PlanScreen({ navigation, T }) {
  const { state } = useApp();
  const WEEK = state.plan;
  const [dismissed, setDismissed] = React.useState(false);
  const [acted, setActed]         = React.useState(false);

  const activeDays = WEEK.filter(d => d.status !== 'rest').length;
  const totalMin   = WEEK.reduce((s, d) => s + (d.minutes || 0), 0);
  const totalHours = Math.floor(totalMin / 60);
  const remMin     = totalMin % 60;
  const timeLabel  = `${totalHours}h ${remMin > 0 ? remMin + 'm' : ''}`.trim();
  const hasHistory = state.sessions.length > 0;
  const hint = computeHint(state.sessions);

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

        {/* AI hint — dinámico según historial real */}
        {!dismissed && hint && (
          <View style={{ paddingHorizontal: SPACING.md, paddingTop: 18 }}>
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: (hint.type === 'warning' && acted) ? T.accent : T.hairline, borderRadius: RADIUS.xl, padding: SPACING.md, flexDirection: 'row', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                <IconSpark size={16} color={T.accentInk} />
              </View>
              <View style={{ flex: 1 }}>

                {hint.type === 'onboarding' && (
                  <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                    {hint.body}
                  </Text>
                )}

                {hint.type === 'tip' && (
                  <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                    💡 {hint.body}
                  </Text>
                )}

                {hint.type === 'warning' && !acted && (
                  <>
                    <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                      Detecté que <Text style={{ fontWeight: '700' }}>{hint.label}</Text> aparece en {hint.count} de tus últimas sesiones. ¿Quieres que el coach lo redistribuya?
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <TouchableOpacity
                        onPress={() => { setActed(true); navigation.navigate('AI'); }}
                        style={{ backgroundColor: T.ink, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill }}>
                        <Text style={{ fontFamily: 'System', fontSize: 12, fontWeight: '600', color: T.bg }}>Sí, redistribuir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setDismissed(true)}
                        style={{ borderWidth: 1, borderColor: T.hairline, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill }}>
                        <Text style={{ fontFamily: 'System', fontSize: 12, fontWeight: '600', color: T.ink }}>No, mantener</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {hint.type === 'warning' && acted && (
                  <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink, lineHeight: 20 }}>
                    ✓ Hablando con el coach sobre <Text style={{ fontWeight: '700' }}>{hint.label}</Text>. Revisa el chat de IA para ver los cambios.
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

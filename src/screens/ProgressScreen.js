import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Svg, { Path, Line, Circle, LinearGradient, Stop, Defs } from 'react-native-svg';
import { RADIUS, SPACING } from '../tokens';
import { Section, PageHeader, IconBtn } from '../components/UI';
import { IconHistory, IconTarget, IconArrowUp } from '../components/Icons';
import { useApp } from '../context/AppContext';

// ── Helpers de cálculo ────────────────────────────────────────

// Epley 1RM estimate
const epley = (kg, reps) => reps === 1 ? kg : Math.round(kg * (1 + reps / 30));

function computePRs(sessions) {
  const best = {};
  for (const session of sessions) {
    if (!Array.isArray(session.exercises)) continue;
    for (const ex of session.exercises) {
      const done = ex.sets?.filter(s => s.done && s.kg > 0 && s.reps > 0) || [];
      if (!done.length) continue;
      const maxKg = Math.max(...done.map(s => s.kg));
      if (!best[ex.name] || maxKg > best[ex.name].value) {
        best[ex.name] = { lift: ex.name, value: maxKg, unit: 'kg', date: session.date };
      }
    }
  }
  return Object.values(best).sort((a, b) => b.value - a.value).slice(0, 5);
}

function computeLiftHistory(sessions, keyword) {
  const points = [...sessions]
    .reverse()
    .flatMap(s => {
      if (!Array.isArray(s.exercises)) return [];
      const ex = s.exercises.find(e => e.name?.toLowerCase().includes(keyword));
      if (!ex) return [];
      const done = ex.sets?.filter(s => s.done && s.kg > 0 && s.reps > 0) || [];
      if (!done.length) return [];
      return [Math.max(...done.map(s => epley(s.kg, s.reps)))];
    });
  return points.length >= 2 ? points : null;
}

function computeWeeklyVolume(sessions, weeks = 8) {
  const now = new Date();
  const buckets = Array(weeks).fill(0);
  for (const s of sessions) {
    const weeksAgo = Math.floor((now - new Date(s.date)) / (7 * 86400000));
    if (weeksAgo >= 0 && weeksAgo < weeks) {
      buckets[weeks - 1 - weeksAgo] += (s.totalVolKg || 0) / 1000; // → toneladas
    }
  }
  return buckets;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'hace 1 día';
  if (diff < 7) return `hace ${diff} días`;
  if (diff < 14) return 'hace 1 sem';
  return `hace ${Math.floor(diff / 7)} sem`;
}

// ── Gráficas ──────────────────────────────────────────────────

function LineChart({ data, T, height = 130 }) {
  const w = 300, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 20) - 10,
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const areaD = pathD + ` L ${w} ${h} L 0 ${h} Z`;
  const c = T.accent;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={c} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={c} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {[0.25, 0.5, 0.75].map(p => (
        <Line key={p} x1="0" x2={w} y1={h * p} y2={h * p} stroke={T.hairline} strokeDasharray="3 4" />
      ))}
      <Path d={areaD} fill="url(#grad)" />
      <Path d={pathD} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="6" fill={T.surface} stroke={c} strokeWidth="2.5" />
      <Circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2" fill={c} />
    </Svg>
  );
}

function BarChart({ data, T }) {
  const max = Math.max(...data) || 1;
  const totalT = data.reduce((s, v) => s + v, 0).toFixed(1);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 110 }}>
        {data.map((v, i) => {
          const cur = i === data.length - 1;
          return (
            <View key={i} style={{ flex: 1, height: `${Math.max((v / max) * 90, v > 0 ? 4 : 0)}%`, borderRadius: 4, backgroundColor: cur ? T.accent : T.ink, opacity: cur ? 1 : 0.3 + (i / data.length) * 0.5 }} />
          );
        })}
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase' }}>Sem 1</Text>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase' }}>Sem {data.length} · {totalT}t</Text>
      </View>
    </View>
  );
}

// ── Pantalla ──────────────────────────────────────────────────

const LIFT_KEYWORDS = { bench: 'banca', squat: 'sentadilla', dead: 'muerto' };
const LIFT_LABELS   = { bench: 'Banca', squat: 'Sentadilla', dead: 'Peso muerto' };

export default function ProgressScreen({ navigation, T }) {
  const { state } = useApp();
  const sessions = state.sessions;
  const hasData  = sessions.length > 0;

  const [lift, setLift] = useState('bench');

  const prs         = computePRs(sessions);
  const liftHistory = hasData ? computeLiftHistory(sessions, LIFT_KEYWORDS[lift]) : null;
  const weeklyVol   = computeWeeklyVolume(sessions, 8);
  const hasVolume   = weeklyVol.some(v => v > 0);

  const cur   = liftHistory ? liftHistory[liftHistory.length - 1] : null;
  const delta = liftHistory ? cur - liftHistory[0] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PageHeader T={T} kicker="Progreso" title="Tus marcas"
          right={<IconBtn T={T} onPress={() => navigation.navigate('History')}><IconHistory size={20} color={T.ink} /></IconBtn>} />

        {!hasData ? (
          <View style={{ paddingHorizontal: SPACING.md, paddingTop: 60, alignItems: 'center', gap: 14 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
              <IconTarget size={30} color={T.ink3} />
            </View>
            <Text style={{ fontFamily: 'System', fontSize: 18, fontWeight: '700', color: T.ink, letterSpacing: -0.4 }}>Sin datos aún</Text>
            <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink3, textAlign: 'center', lineHeight: 20, maxWidth: 280 }}>
              Completa tu primer entreno para registrar tu progreso en fuerza y volumen.
            </Text>
          </View>
        ) : (
          <>
            {/* Selector de levantamiento */}
            <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 14 }}>
              <View style={{ flexDirection: 'row', backgroundColor: T.surface, padding: 4, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline }}>
                {['bench','squat','dead'].map(id => (
                  <TouchableOpacity key={id} onPress={() => setLift(id)} style={{ flex: 1, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: lift === id ? T.ink : 'transparent', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'System', fontSize: 13, fontWeight: '600', color: lift === id ? T.bg : T.ink2 }}>{LIFT_LABELS[id]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Gráfica 1RM */}
            <View style={{ paddingHorizontal: SPACING.md }}>
              <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, padding: 18 }}>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>1RM estimado · {LIFT_LABELS[lift]}</Text>
                {liftHistory ? (
                  <>
                    <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ fontFamily: 'SpaceMono', fontSize: 44, fontWeight: '500', color: T.ink, letterSpacing: -1.5, lineHeight: 48 }}>{cur}</Text>
                      <Text style={{ fontFamily: 'SpaceMono', fontSize: 14, color: T.ink3, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>kg</Text>
                    </View>
                    {delta !== 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, backgroundColor: delta > 0 ? T.accentSoft : T.surface2, gap: 4 }}>
                          <IconArrowUp size={11} color={delta > 0 ? T.accentInk : T.ink3} />
                          <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: delta > 0 ? T.accentInk : T.ink3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6 }}>{delta > 0 ? '+' : ''}{delta} kg</Text>
                        </View>
                        <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ink3, letterSpacing: 0.8 }}>desde el primer registro</Text>
                      </View>
                    )}
                    <View style={{ marginTop: 18 }}>
                      <LineChart data={liftHistory} T={T} />
                    </View>
                  </>
                ) : (
                  <Text style={{ fontFamily: 'System', fontSize: 14, color: T.ink3, marginTop: 12, lineHeight: 20 }}>
                    Aún no hay sesiones con {LIFT_LABELS[lift].toLowerCase()}. Completa un entreno que lo incluya para ver la gráfica.
                  </Text>
                )}
              </View>
            </View>

            {/* PRs */}
            {prs.length > 0 && (
              <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
                <Section T={T} kicker="Récords personales" title="Mejores marcas" />
                <View style={{ gap: 8 }}>
                  {prs.map((p, i) => (
                    <View key={i} style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                        <IconTarget size={18} color={T.accentInk} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'System', fontSize: 15, fontWeight: '600', color: T.ink, letterSpacing: -0.2 }}>{p.lift}</Text>
                        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{timeAgo(p.date)}</Text>
                      </View>
                      <Text style={{ fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '500', color: T.ink, letterSpacing: -0.5 }}>{p.value}<Text style={{ fontSize: 10, color: T.ink3 }}> kg</Text></Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Volumen semanal */}
            {hasVolume && (
              <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
                <Section T={T} kicker="Volumen semanal" title="Carga acumulada" />
                <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, padding: 18 }}>
                  <BarChart data={weeklyVol} T={T} />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Svg, { Path, Line, Circle, LinearGradient, Stop, Defs, Rect } from 'react-native-svg';
import { RADIUS, SPACING } from '../tokens';
import { Section, PageHeader, IconBtn, Pill } from '../components/UI';
import { IconHistory, IconTarget, IconArrowUp, IconSpark } from '../components/Icons';
import { PROGRESS, PRS } from '../data';

function LineChart({ data, T, color, height = 130 }) {
  const w = 300, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 20) - 10,
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const areaD = pathD + ` L ${w} ${h} L 0 ${h} Z`;
  const c = color || T.accent;
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
      {pts.length > 0 && (
        <>
          <Circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="6" fill={T.surface} stroke={c} strokeWidth="2.5" />
          <Circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2" fill={c} />
        </>
      )}
    </Svg>
  );
}

function BarChart({ data, T }) {
  const max = Math.max(...data);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 110 }}>
        {data.map((v, i) => {
          const cur = i === data.length - 1;
          return (
            <View key={i} style={{ flex: 1, height: `${(v / max) * 90}%`, borderRadius: 4, backgroundColor: cur ? T.accent : T.ink, opacity: cur ? 1 : 0.3 + (i / data.length) * 0.5 }} />
          );
        })}
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase' }}>Sem 1</Text>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase' }}>Sem 12 · 22t</Text>
      </View>
    </View>
  );
}

export default function ProgressScreen({ navigation, T }) {
  const [lift, setLift] = useState('bench');
  const data = PROGRESS[lift];
  const cur = data[data.length - 1];
  const delta = cur - data[0];
  const pct = ((delta / data[0]) * 100).toFixed(1);
  const labels = { bench: 'Banca', squat: 'Sentadilla', dead: 'Peso muerto' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PageHeader T={T} kicker="Progreso" title="Tus marcas"
          right={<IconBtn T={T} onPress={() => navigation.navigate('History')}><IconHistory size={20} color={T.ink} /></IconBtn>} />

        {/* Lift selector */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', backgroundColor: T.surface, padding: 4, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline }}>
            {['bench','squat','dead'].map(id => (
              <TouchableOpacity key={id} onPress={() => setLift(id)} style={{ flex: 1, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: lift === id ? T.ink : 'transparent', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'System', fontSize: 13, fontWeight: '600', color: lift === id ? T.bg : T.ink2 }}>{labels[id]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart card */}
        <View style={{ paddingHorizontal: SPACING.md }}>
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, padding: 18 }}>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>1RM estimado</Text>
            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 44, fontWeight: '500', color: T.ink, letterSpacing: -1.5, lineHeight: 48 }}>{cur}</Text>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 14, color: T.ink3, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>kg</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, backgroundColor: T.accentSoft, gap: 4 }}>
                <IconArrowUp size={11} color={T.accentInk} />
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.accentInk, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6 }}>+{delta} kg</Text>
              </View>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ink3, letterSpacing: 0.8 }}>+{pct}% en 12 sem</Text>
            </View>
            <View style={{ marginTop: 18 }}>
              <LineChart data={data} T={T} />
            </View>
          </View>
        </View>

        {/* PRs */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
          <Section T={T} kicker="Récords personales" title="Últimos PRs" />
          <View style={{ gap: 8 }}>
            {PRS.map((p, i) => (
              <View key={i} style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <IconTarget size={18} color={T.accentInk} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'System', fontSize: 15, fontWeight: '600', color: T.ink, letterSpacing: -0.2 }}>{p.lift}</Text>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{p.when}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '500', color: T.ink, letterSpacing: -0.5 }}>{p.value}<Text style={{ fontSize: 10, color: T.ink3 }}> {p.unit}</Text></Text>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ok, letterSpacing: 0.6 }}>{p.delta} kg</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Volume */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
          <Section T={T} kicker="Volumen semanal" title="Carga acumulada" />
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, padding: 18 }}>
            <BarChart data={PROGRESS.volume} T={T} />
          </View>
        </View>

        {/* AI insight */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: 24 }}>
          <View style={{ backgroundColor: T.ink, borderRadius: RADIUS.xl, padding: 18 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <IconSpark size={20} color={T.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.accent, letterSpacing: 1.4, textTransform: 'uppercase' }}>Análisis IA</Text>
                <Text style={{ fontFamily: 'System', fontSize: 14, color: '#fff', marginTop: 6, lineHeight: 20 }}>
                  Tu progresión en banca se está aplanando. Sugiero <Text style={{ fontWeight: '700' }}>3 semanas de fuerza</Text> (rango 3-5 reps) antes de volver a hipertrofia.
                </Text>
                <TouchableOpacity style={{ marginTop: 12, backgroundColor: T.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill, alignSelf: 'flex-start' }}>
                  <Text style={{ fontFamily: 'System', fontSize: 12, fontWeight: '600', color: T.accentInk }}>Aplicar al plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

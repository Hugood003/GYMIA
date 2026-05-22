import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { RADIUS, SPACING } from '../tokens';
import { CTA } from '../components/UI';
import { IconDumb, IconBolt, IconFlame, IconHeart, IconCheck, IconChevRight, IconChevLeft, IconPlus, IconMinus, IconSpark } from '../components/Icons';
import { useApp } from '../context/AppContext';

// ── Reusable stepper ──────────────────────────────────────────
function Stepper({ T, label, value, onInc, onDec, unit, min, max }) {
  return (
    <View style={{ flex: 1, backgroundColor: T.surface, borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: T.hairline }}>
      <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={onDec} disabled={value <= min}
          style={{ width: 34, height: 34, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center', opacity: value <= min ? 0.3 : 1 }}>
          <IconMinus size={14} color={T.ink} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 28, fontWeight: '500', color: T.ink, letterSpacing: -1 }}>{value}</Text>
          {!!unit && <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>{unit}</Text>}
        </View>
        <TouchableOpacity onPress={onInc} disabled={value >= max}
          style={{ width: 34, height: 34, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center', opacity: value >= max ? 0.3 : 1 }}>
          <IconPlus size={14} color={T.ink} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function OptionCard({ T, selected, onPress, icon, title, desc }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{
      backgroundColor: selected ? T.ink : T.surface,
      borderWidth: 1, borderColor: selected ? T.ink : T.hairline,
      borderRadius: RADIUS.lg, padding: SPACING.md,
      flexDirection: 'row', alignItems: 'center', gap: 14,
    }}>
      {icon && (
        <View style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: selected ? 'rgba(255,255,255,0.08)' : T.surface2, alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { color: selected ? T.accent : T.ink })}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'System', fontSize: 16, fontWeight: '600', color: selected ? T.bg : T.ink, letterSpacing: -0.2 }}>{title}</Text>
        <Text style={{ fontFamily: 'System', fontSize: 13, color: selected ? 'rgba(255,255,255,0.6)' : T.ink3, marginTop: 3 }}>{desc}</Text>
      </View>
      <View style={{ width: 22, height: 22, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: selected ? T.accent : T.hairline, backgroundColor: selected ? T.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <IconCheck size={13} color={T.accentInk} />}
      </View>
    </TouchableOpacity>
  );
}

const TOTAL_STEPS = 4;

export default function OnboardingScreen({ navigation, T, route }) {
  const { dispatch } = useApp();
  const prefillName = route?.params?.name || '';

  const [step, setStep] = useState(0);

  // Step 0 — personal data
  const [name, setName]     = useState(prefillName);
  const [age, setAge]       = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [sex, setSex]       = useState('H'); // H | M

  // Step 1 — goal
  const [goal, setGoal] = useState('hipertrofia');

  // Step 2 — level + days
  const [level, setLevel] = useState('intermedio');
  const [days, setDays]   = useState(4);

  // Step 3 — equipment
  const [equip, setEquip] = useState(['barra', 'mancuernas', 'maquinas']);
  const toggleEquip = (id) => setEquip(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  const steps = [
    { kicker: `Paso 1 / ${TOTAL_STEPS}`, title: 'Cuéntanos\nsobre ti.', sub: 'Usamos estos datos para calcular tus cargas y progresión.' },
    { kicker: `Paso 2 / ${TOTAL_STEPS}`, title: '¿Cuál es tu\nobjetivo?', sub: 'Tu plan se adapta automáticamente cada semana.' },
    { kicker: `Paso 3 / ${TOTAL_STEPS}`, title: '¿Tu nivel\nactual?', sub: 'Esto define cargas iniciales y velocidad de progresión.' },
    { kicker: `Paso 4 / ${TOTAL_STEPS}`, title: '¿Qué tienes\ndisponible?', sub: 'Solo verás ejercicios que puedas hacer.' },
  ];

  const canContinue = () => {
    if (step === 0) return name.trim().length >= 2;
    return true;
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      dispatch({
        type: 'SET_USER',
        payload: { name: name.trim(), age, height, weight, sex, goal, level, days, equip },
      });
      navigation.replace('Main');
    }
  };

  const back = () => step > 0 && setStep(step - 1);
  const s = steps[step];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={back} style={{ opacity: step === 0 ? 0 : 1, flexDirection: 'row', alignItems: 'center', gap: 6 }} disabled={step === 0}>
            <IconChevLeft size={14} color={T.ink} />
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: T.ink }}>Atrás</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: T.ink3, letterSpacing: 1.6 }}>{s.kicker.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 18 }}>
          {steps.map((_, i) => (
            <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= step ? T.ink : T.surface3 }} />
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={{ paddingHorizontal: SPACING.md, paddingTop: 30, paddingBottom: 4 }}>
        <Text style={{ fontFamily: 'System', fontSize: 30, fontWeight: '700', color: T.ink, letterSpacing: -0.6, lineHeight: 36 }}>{s.title}</Text>
        <Text style={{ fontFamily: 'System', fontSize: 15, color: T.ink2, marginTop: 8, lineHeight: 21 }}>{s.sub}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.md, gap: 12 }} keyboardShouldPersistTaps="handled">

        {/* ── Step 0: Personal data ── */}
        {step === 0 && (
          <View style={{ gap: 12 }}>
            {/* Name */}
            <View style={{ backgroundColor: T.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: T.hairline }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>Nombre</Text>
              <TextInput
                value={name} onChangeText={setName}
                placeholder="¿Cómo te llamamos?" placeholderTextColor={T.ink3}
                style={{ fontFamily: 'System', fontSize: 17, fontWeight: '500', color: T.ink, padding: 0 }}
              />
            </View>

            {/* Sex */}
            <View style={{ backgroundColor: T.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: T.hairline }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>Sexo biológico</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[['H', 'Hombre'], ['M', 'Mujer']].map(([id, label]) => (
                  <TouchableOpacity key={id} onPress={() => setSex(id)} style={{
                    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
                    backgroundColor: sex === id ? T.ink : T.surface2,
                    borderWidth: 1, borderColor: sex === id ? T.ink : T.hairline,
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontFamily: 'System', fontSize: 15, fontWeight: '600', color: sex === id ? T.bg : T.ink }}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age + Height */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Stepper T={T} label="Edad" value={age} unit="años" min={14} max={80}
                onInc={() => setAge(a => Math.min(80, a + 1))} onDec={() => setAge(a => Math.max(14, a - 1))} />
              <Stepper T={T} label="Altura" value={height} unit="cm" min={130} max={220}
                onInc={() => setHeight(h => Math.min(220, h + 1))} onDec={() => setHeight(h => Math.max(130, h - 1))} />
            </View>

            {/* Weight */}
            <View style={{ backgroundColor: T.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: T.hairline }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>Peso corporal</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => setWeight(w => Math.max(30, Math.round((w - 0.5) * 2) / 2))}
                  style={{ width: 44, height: 44, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
                  <IconMinus size={18} color={T.ink} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 44, fontWeight: '500', color: T.ink, letterSpacing: -1.5, lineHeight: 48 }}>{weight}</Text>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 4 }}>kg</Text>
                </View>
                <TouchableOpacity onPress={() => setWeight(w => Math.min(200, Math.round((w + 0.5) * 2) / 2))}
                  style={{ width: 44, height: 44, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
                  <IconPlus size={18} color={T.ink} />
                </TouchableOpacity>
              </View>
            </View>

            {!canContinue() && (
              <Text style={{ fontFamily: 'System', fontSize: 13, color: T.warn, textAlign: 'center' }}>Escribe tu nombre para continuar</Text>
            )}
          </View>
        )}

        {/* ── Step 1: Goal ── */}
        {step === 1 && [
          { id: 'hipertrofia', t: 'Hipertrofia',   d: 'Ganar masa muscular',              ico: <IconDumb size={22} /> },
          { id: 'fuerza',      t: 'Fuerza',         d: 'Aumentar marcas y potencia',      ico: <IconBolt size={22} /> },
          { id: 'definicion',  t: 'Definición',     d: 'Bajar grasa, mantener músculo',   ico: <IconFlame size={22} /> },
          { id: 'salud',       t: 'Salud y forma',  d: 'Constancia y movilidad',          ico: <IconHeart size={22} /> },
        ].map(o => (
          <OptionCard key={o.id} T={T} selected={goal === o.id} onPress={() => setGoal(o.id)} icon={o.ico} title={o.t} desc={o.d} />
        ))}

        {/* ── Step 2: Level + Days ── */}
        {step === 2 && (
          <View style={{ gap: 10 }}>
            {[
              { id: 'principiante', t: 'Principiante', d: 'Menos de 1 año entrenando' },
              { id: 'intermedio',   t: 'Intermedio',   d: '1-3 años, técnica básica sólida' },
              { id: 'avanzado',     t: 'Avanzado',     d: '+3 años, progresión más lenta' },
            ].map(o => (
              <OptionCard key={o.id} T={T} selected={level === o.id} onPress={() => setLevel(o.id)} title={o.t} desc={o.d} />
            ))}
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>Días por semana</Text>
              <View style={{ backgroundColor: T.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: T.hairline, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => setDays(d => Math.max(2, d - 1))}
                  style={{ width: 44, height: 44, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
                  <IconMinus size={18} color={T.ink} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 44, fontWeight: '500', color: T.ink, letterSpacing: -1.5, lineHeight: 48 }}>{days}</Text>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 4 }}>días / semana</Text>
                </View>
                <TouchableOpacity onPress={() => setDays(d => Math.min(7, d + 1))}
                  style={{ width: 44, height: 44, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
                  <IconPlus size={18} color={T.ink} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Step 3: Equipment ── */}
        {step === 3 && (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { id: 'barra',      t: 'Barra olímpica', d: '20 kg + discos' },
                { id: 'mancuernas', t: 'Mancuernas',     d: 'hasta 40 kg' },
                { id: 'maquinas',   t: 'Máquinas',       d: 'Multi-gym, poleas' },
                { id: 'racks',      t: 'Rack y banco',   d: 'Plano e inclinado' },
                { id: 'kettlebell', t: 'Kettlebells',    d: '8-32 kg' },
                { id: 'cardio',     t: 'Cardio',         d: 'Cinta, bici, remo' },
              ].map(o => {
                const on = equip.includes(o.id);
                return (
                  <TouchableOpacity key={o.id} onPress={() => toggleEquip(o.id)} style={{
                    width: '47%', backgroundColor: on ? T.ink : T.surface,
                    borderWidth: 1, borderColor: on ? T.ink : T.hairline,
                    borderRadius: RADIUS.lg, padding: 14,
                  }}>
                    <Text style={{ fontFamily: 'System', fontSize: 14, fontWeight: '600', color: on ? T.bg : T.ink }}>{o.t}</Text>
                    <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: on ? 'rgba(255,255,255,0.6)' : T.ink3, marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>{o.d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ padding: SPACING.md, backgroundColor: T.accentSoft, borderWidth: 1, borderColor: T.accent, borderRadius: RADIUS.lg, flexDirection: 'row', gap: 10 }}>
              <IconSpark size={18} color={T.accentInk} />
              <Text style={{ flex: 1, fontFamily: 'System', fontSize: 14, color: T.accentInk, lineHeight: 20 }}>
                Con esto puedo armar una rutina <Text style={{ fontWeight: '700' }}>Empuje · Tirón · Pierna · Tirón</Text> de <Text style={{ fontWeight: '700' }}>{days} días</Text>.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, paddingTop: SPACING.sm, backgroundColor: T.bg }}>
        <CTA T={T} onPress={next} icon={<IconChevRight size={18} color={T.accentInk} />}
          style={{ opacity: canContinue() ? 1 : 0.4 }}>
          {step < TOTAL_STEPS - 1 ? 'Continuar' : 'Generar mi plan'}
        </CTA>
      </View>
    </SafeAreaView>
  );
}

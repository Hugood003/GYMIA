import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { RADIUS, SPACING } from '../tokens';
import { Pill } from '../components/UI';
import { IconSpark, IconClose, IconMic, IconSend, IconChevRight } from '../components/Icons';
import { AI_THREAD } from '../data';

// ── AI response engine ────────────────────────────────────────
const RULES = [
  { match: ['plan', 'rutina', 'programa', 'generar', 'diseña', 'arma'],
    text: 'Perfecto, aquí tienes tu plan personalizado:',
    type: 'plan' },
  { match: ['proteína', 'proteina', 'dieta', 'comer', 'caloría', 'caloria', 'nutrición'],
    text: 'Para hipertrofia apunta a 1.8–2.2 g de proteína por kg de peso. Con tus datos, son ~150 g/día. Distribuye en 4–5 comidas.' },
  { match: ['descanso', 'dormir', 'sueño', 'recuperar', 'recuperación'],
    text: 'El sueño es cuando más músculo construyes. 7–9 h optimizan la hormona del crecimiento y la síntesis proteica. ¿Tienes problemas para descansar?' },
  { match: ['dolor', 'lesión', 'lesion', 'molesta', 'duele', 'molestia'],
    text: 'Si es dolor agudo, para el ejercicio y consulta un profesional. Para molestias leves puedo adaptar los ejercicios. ¿En qué zona tienes la molestia?' },
  { match: ['progreso', 'avance', 'resultado', 'mejora'],
    text: 'Llevas 12 días de racha. Sentadilla +4 kg este mes, banca +2 kg, volumen semanal +18%. Vas muy bien — sigue el plan.' },
  { match: ['hoy', 'sesión', 'sesion', 'entreno', 'workout'],
    text: 'Hoy tienes Pierna: sentadilla, peso muerto rumano, prensa 45°, curl femoral y gemelo. ~70 min. ¿Quieres ajustar algo antes de empezar?' },
  { match: ['calentamiento', 'warm up', 'calentar'],
    text: 'Para pierna: 5 min bici suave, 2 × 10 sentadillas con peso corporal, 2 × 10 puente de glúteo. Termina con movilidad de cadera 30 seg por lado.' },
  { match: ['peso', 'bajar', 'grasa', 'perder'],
    text: 'Para reducir grasa manteniendo músculo: déficit de 200–300 kcal, proteína alta, cardio de bajo impacto 2–3 veces/semana. ¿Quieres que ajuste el plan?' },
];

const DEFAULTS = [
  'Entendido. ¿Necesitas algo más para tu entreno de hoy?',
  'Anotado. ¿Quieres ajustar algo en tu plan de esta semana?',
  'Perfecto. La consistencia supera la intensidad — sigue así.',
  '¿Hay algún ejercicio que quieras priorizar o evitar esta semana?',
  'Buena pregunta. ¿Quieres que profundice en algún aspecto concreto?',
];

function getResponse(text) {
  const t = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some(kw => t.includes(kw))) return rule;
  }
  return { text: DEFAULTS[Math.floor(Date.now() % DEFAULTS.length)] };
}

const SUGGESTIONS = [
  'Ajusta el entreno de hoy a 45 min',
  'Sugiere un calentamiento de pierna',
  'Análisis de mi progreso este mes',
  'Dame una rutina para 4 días',
];

// ── Message component ─────────────────────────────────────────
function Msg({ T, m }) {
  const isUser = m.role === 'user';
  return (
    <View style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
      {!isUser && (
        <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4 }}>
          <IconSpark size={14} color={T.accentInk} />
        </View>
      )}
      <View style={{ maxWidth: '78%', padding: 12, backgroundColor: isUser ? T.ink : T.surface, borderWidth: isUser ? 0 : 1, borderColor: T.hairline, borderRadius: 18, borderTopLeftRadius: isUser ? 18 : 6, borderTopRightRadius: isUser ? 6 : 18 }}>
        <Text style={{ fontFamily: 'System', fontSize: 14, lineHeight: 20, color: isUser ? T.bg : T.ink }}>{m.text}</Text>
      </View>
    </View>
  );
}

// ── Plan preview card ─────────────────────────────────────────
function PlanPreview({ T, onActivate }) {
  return (
    <View style={{ backgroundColor: T.ink, borderRadius: RADIUS.xl, padding: SPACING.md, marginLeft: 36 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pill T={T} tone="accent">PLAN GENERADO</Pill>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>4 DÍAS · 6 SEM</Text>
      </View>
      <Text style={{ fontFamily: 'System', fontSize: 17, fontWeight: '600', color: '#fff', marginTop: 10, letterSpacing: -0.4 }}>Empuje · Tirón · Pierna · Tirón</Text>
      {[{ d: 'L', t: 'Empuje', m: '60m' }, { d: 'M', t: 'Tirón', m: '58m' }, { d: 'J', t: 'Pierna', m: '70m' }, { d: 'V', t: 'Tirón', m: '55m' }].map((day, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, marginTop: 6 }}>
          <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, fontWeight: '600', color: '#fff' }}>{day.d}</Text>
          </View>
          <Text style={{ flex: 1, fontFamily: 'System', fontSize: 13, fontWeight: '500', color: '#fff' }}>{day.t}</Text>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.6 }}>{day.m}</Text>
        </View>
      ))}
      <TouchableOpacity onPress={onActivate} style={{ backgroundColor: T.accent, padding: 12, borderRadius: RADIUS.md, marginTop: 12, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'System', fontSize: 13, fontWeight: '600', color: T.accentInk }}>Activar este plan →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AIScreen({ navigation, T }) {
  const [tab, setTab]         = useState('chat');
  const [thread, setThread]   = useState(AI_THREAD);
  const [draft, setDraft]     = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  const send = (text) => {
    if (!text.trim() || thinking) return;
    setThread(t => [...t, { role: 'user', text }]);
    setDraft('');
    setThinking(true);
    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      const resp = getResponse(text);
      setThinking(false);
      setThread(t => [...t, { role: 'ai', text: resp.text, type: resp.type }]);
    }, delay);
  };

  const lastIsAI = !thinking && thread.length > 0 && thread[thread.length - 1].role === 'ai';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                <IconSpark size={18} color={T.accentInk} />
              </View>
              <View>
                <Text style={{ fontFamily: 'System', fontSize: 18, fontWeight: '700', color: T.ink, letterSpacing: -0.4 }}>Coach GYMIA</Text>
                <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ok, letterSpacing: 1.2, textTransform: 'uppercase' }}>● en línea</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
              <IconClose size={20} color={T.ink} />
            </TouchableOpacity>
          </View>
          {/* Tabs */}
          <View style={{ marginTop: 16, flexDirection: 'row', backgroundColor: T.surface, borderRadius: RADIUS.pill, padding: 4, borderWidth: 1, borderColor: T.hairline }}>
            {[['chat', 'Chat libre'], ['gen', 'Generar rutina']].map(([id, label]) => (
              <TouchableOpacity key={id} onPress={() => setTab(id)} style={{ flex: 1, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: tab === id ? T.ink : 'transparent', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'System', fontSize: 13, fontWeight: '600', color: tab === id ? T.bg : T.ink2 }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {tab === 'chat' && (
          <>
            <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.md, gap: 12 }}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
              {thread.map((m, i) =>
                m.type === 'plan'
                  ? <PlanPreview key={i} T={T} onActivate={() => navigation.navigate('Plan')} />
                  : <Msg key={i} T={T} m={m} />
              )}
              {thinking && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSpark size={14} color={T.accentInk} />
                  </View>
                  <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: 18, borderTopLeftRadius: 6, padding: 14, flexDirection: 'row', gap: 4 }}>
                    {[0, 1, 2].map(i => <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.ink3 }} />)}
                  </View>
                </View>
              )}
              {lastIsAI && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>Sugerencias</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {SUGGESTIONS.map(s => (
                      <TouchableOpacity key={s} onPress={() => send(s)} style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.md, padding: 10 }}>
                        <Text style={{ fontFamily: 'System', fontSize: 13, color: T.ink }}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={{ padding: SPACING.md, paddingBottom: 36 }}>
              <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: 24, paddingVertical: 6, paddingLeft: 16, paddingRight: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={() => send(draft)}
                  placeholder="Pregunta lo que sea…" placeholderTextColor={T.ink3}
                  style={{ flex: 1, fontFamily: 'System', fontSize: 15, color: T.ink, paddingVertical: 10 }} />
                <TouchableOpacity style={{ width: 40, height: 40, borderRadius: RADIUS.pill, alignItems: 'center', justifyContent: 'center' }}>
                  <IconMic size={20} color={T.ink3} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => send(draft)} style={{ width: 40, height: 40, borderRadius: RADIUS.pill, backgroundColor: draft.trim() ? T.accent : T.surface2, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSend size={18} color={draft.trim() ? T.accentInk : T.ink3} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {tab === 'gen' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.md, gap: 22, paddingBottom: 40 }}>
            <GeneratorView T={T} onGenerate={() => { setTab('chat'); send('Genera una rutina personalizada para mí'); }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GeneratorView({ T, onGenerate }) {
  const [days, setDays]         = useState(4);
  const [duration, setDuration] = useState(60);
  const [focus, setFocus]       = useState(['pierna']);
  const toggle = (id) => setFocus(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  return (
    <>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>Días por semana</Text>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 24, fontWeight: '500', color: T.ink, letterSpacing: -0.5 }}>{days}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[2, 3, 4, 5, 6].map(n => (
            <TouchableOpacity key={n} onPress={() => setDays(n)} style={{ flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: days === n ? T.ink : T.surface, borderWidth: 1, borderColor: days === n ? T.ink : T.hairline, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 16, fontWeight: '500', color: days === n ? T.bg : T.ink }}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>Duración por sesión</Text>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 24, fontWeight: '500', color: T.ink, letterSpacing: -0.5 }}>{duration}<Text style={{ fontSize: 11, color: T.ink3 }}> min</Text></Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[30, 45, 60, 75, 90].map(n => (
            <TouchableOpacity key={n} onPress={() => setDuration(n)} style={{ flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: duration === n ? T.ink : T.surface, borderWidth: 1, borderColor: duration === n ? T.ink : T.hairline, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 13, fontWeight: '500', color: duration === n ? T.bg : T.ink }}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 12 }}>Prioridades</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {['Pecho', 'Espalda', 'Pierna', 'Glúteo', 'Hombro', 'Brazo', 'Core'].map(o => {
            const id = o.toLowerCase(); const on = focus.includes(id);
            return (
              <TouchableOpacity key={id} onPress={() => toggle(id)} style={{ backgroundColor: on ? T.ink : T.surface, borderWidth: 1, borderColor: on ? T.ink : T.hairline, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 10 }}>
                <Text style={{ fontFamily: 'System', fontSize: 13, fontWeight: '500', color: on ? T.bg : T.ink }}>{o}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity onPress={onGenerate} style={{ backgroundColor: T.accent, borderRadius: RADIUS.pill, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <IconSpark size={18} color={T.accentInk} />
        <Text style={{ fontFamily: 'System', fontSize: 16, fontWeight: '600', color: T.accentInk }}>Generar rutina</Text>
      </TouchableOpacity>
    </>
  );
}

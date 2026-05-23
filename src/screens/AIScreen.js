import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { RADIUS, SPACING } from '../tokens';
import { Pill } from '../components/UI';
import { IconSpark, IconClose, IconMic, IconSend, IconChevRight } from '../components/Icons';
const INITIAL_THREAD = [
  { role: 'ai', text: '¡Hola! Soy Coach GYMIA, tu entrenador personal con IA. Cuéntame qué necesitas: ajustar tu plan, resolver dudas sobre ejercicios o lo que sea.' },
];
import { useApp } from '../context/AppContext';

// ── Gemini API ────────────────────────────────────────────────
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

function buildSystemPrompt(user, plan, sessions) {
  const goal = { hipertrofia: 'hipertrofia (ganar masa muscular)', fuerza: 'fuerza máxima', definicion: 'definición (perder grasa)', salud: 'salud y forma física' }[user?.goal] || 'fitness general';
  const level = { principiante: 'principiante', intermedio: 'nivel intermedio', avanzado: 'nivel avanzado' }[user?.level] || 'nivel intermedio';
  const equip = user?.equip?.join(', ') || 'gimnasio completo';

  const DAY_NAMES_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const DAY_CODES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const jsDay = new Date().getDay();
  const todayName = DAY_NAMES_ES[jsDay];
  const todayCode = DAY_CODES[jsDay];

  const planText = plan?.map(d => `${d.d}: ${d.label} (${d.minutes} min)${d.status === 'today' ? ' ← HOY' : ''}`).join(', ') || '';

  // Formatear historial real de sesiones (últimas 5)
  const recentSessions = (sessions || []).slice(0, 5);
  const sessionHistory = recentSessions.length === 0
    ? 'Sin sesiones registradas aún.'
    : recentSessions.map(s => {
        const date = new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const mins = s.durationSec ? Math.round(s.durationSec / 60) : '?';
        let exSummary = '';
        if (Array.isArray(s.exercises)) {
          exSummary = s.exercises.map(ex => {
            const doneSets = ex.sets?.filter(st => st.done);
            if (!doneSets?.length) return null;
            const maxKg = Math.max(...doneSets.map(st => st.kg || 0));
            const reps = doneSets[0]?.reps || '?';
            return `${ex.name} ${maxKg}kg×${reps}`;
          }).filter(Boolean).join(', ');
        }
        return `• ${date} — ${s.label} (${mins} min, ${s.completedSets}/${s.totalSets} series, ${s.totalVolKg ? (s.totalVolKg/1000).toFixed(1)+'t' : '?'})${exSummary ? ': ' + exSummary : ''}`;
      }).join('\n');

  return `Eres Coach GYMIA, un entrenador personal de IA especializado en fitness y musculación. Responde siempre en español de forma concisa, clara y motivadora. Máximo 3-4 oraciones salvo que te pidan un plan detallado.

HOY ES: ${todayName} (código de día: ${todayCode}). Cuando el usuario diga "hoy", siempre usa el código "${todayCode}" en el bloque [ACTION].

Datos del usuario:
- Nombre: ${user?.name || 'Atleta'}
- Edad: ${user?.age || '—'} años | Peso: ${user?.weight || '—'} kg | Altura: ${user?.height || '—'} cm | Sexo: ${user?.sex === 'M' ? 'Mujer' : 'Hombre'}
- Objetivo: ${goal}
- Nivel: ${level}
- Días disponibles: ${user?.days || 4} por semana
- Equipamiento: ${equip}
- Plan semanal actual: ${planText}

Historial de sesiones registradas:
${sessionHistory}

IMPORTANTE — Cuando el usuario pida modificar el plan o configurar/generar ejercicios para una sesión, incluye AL FINAL de tu respuesta un bloque [ACTION]. Solo un bloque por respuesta.

Usa el código de día exacto: Lun, Mar, Mié, Jue, Vie, Sáb, Dom.
Cuando el usuario diga "hoy" o "el entreno de hoy", usa el día que tenga status "today" en el plan.

Ejemplo para cambiar solo metadata:
[ACTION]{"d":"Vie","changes":{"minutes":50,"label":"Hombro · Prioridad"}}[/ACTION]

Ejemplo para configurar ejercicios completos (cuando el usuario pida "configura mi rutina", "ponme los ejercicios", "genera la sesión"):
[ACTION]{"d":"Vie","changes":{"label":"Tirón · Espalda","minutes":65,"exercisesList":[{"name":"Jalón al Pecho","muscle":"Espalda","sets":[{"reps":10,"kg":50,"rpe":7,"done":false},{"reps":10,"kg":50,"rpe":7,"done":false},{"reps":10,"kg":50,"rpe":8,"done":false},{"reps":8,"kg":55,"rpe":8,"done":false}],"rest":120,"note":"Agarre prono ancho"},{"name":"Remo con Barra","muscle":"Espalda","sets":[{"reps":10,"kg":60,"rpe":7,"done":false},{"reps":10,"kg":60,"rpe":8,"done":false},{"reps":8,"kg":65,"rpe":8,"done":false},{"reps":8,"kg":65,"rpe":9,"done":false}],"rest":120,"note":"Torso a 45°"},{"name":"Remo con Mancuerna","muscle":"Espalda","sets":[{"reps":12,"kg":30,"rpe":7,"done":false},{"reps":12,"kg":30,"rpe":8,"done":false},{"reps":10,"kg":32,"rpe":8,"done":false}],"rest":90,"note":"Unilateral"},{"name":"Face Pull","muscle":"Hombro posterior","sets":[{"reps":15,"kg":20,"rpe":7,"done":false},{"reps":15,"kg":20,"rpe":7,"done":false},{"reps":15,"kg":20,"rpe":8,"done":false}],"rest":60,"note":"Codos altos"},{"name":"Curl de Bíceps","muscle":"Bíceps","sets":[{"reps":12,"kg":14,"rpe":7,"done":false},{"reps":12,"kg":14,"rpe":8,"done":false},{"reps":10,"kg":16,"rpe":8,"done":false}],"rest":60,"note":"Alterno"}]}}[/ACTION]

Reglas para exercisesList: 4-6 ejercicios, 3-4 series por ejercicio, kg basados en el historial del usuario (si no hay historial, usa pesos moderados para su nivel), rest en segundos (60-180).
CRÍTICO: Cuando uses exercisesList en el [ACTION], NO enumeres los ejercicios en el texto de la respuesta. La app ya los mostrará automáticamente en la sesión. Solo di una frase corta de confirmación, por ejemplo: "¡Listo! Tu sesión de espalda está configurada para hoy. Ábrela cuando quieras empezar."
Solo incluye [ACTION] cuando realmente haya cambios. No lo incluyas en respuestas puramente informativas.`;
}

async function callGemini(systemPrompt, history) {
  // Gemini requires: no 'plan' messages, must start with 'user', must alternate roles
  let contents = history
    .filter(m => !m.type)
    .map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));

  // Drop leading 'model' messages (Gemini rejects history that doesn't start with 'user')
  while (contents.length > 0 && contents[0].role === 'model') {
    contents = contents.slice(1);
  }

  // Collapse consecutive same-role messages into one
  const merged = [];
  for (const msg of contents) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role) {
      last.parts[0].text += '\n' + msg.parts[0].text;
    } else {
      merged.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
    }
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: merged,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini ${res.status}: ${errBody}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';
}

async function fetchSuggestions(user, plan) {
  const days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const today = days[new Date().getDay()];
  const todaySession = plan?.find(d => d.status === 'today');
  const sessionLabel = todaySession ? `${todaySession.label} (${todaySession.minutes} min)` : 'descanso';

  const prompt = `Eres un asistente de gym. Genera exactamente 4 mensajes cortos que UN USUARIO le podría enviar a su coach IA hoy ${today}.
Contexto del usuario: entreno de hoy = ${sessionLabel}, objetivo = ${user?.goal || 'fitness'}, nivel = ${user?.level || 'intermedio'}.
Cada mensaje debe ser algo que el usuario ENVIARÍA al coach, como "Ajusta mi entreno de hoy a 45 min" o "¿Qué peso uso hoy en sentadilla?".
Máximo 8 palabras por mensaje. Variados: mezcla peticiones de ajuste, preguntas técnicas y consultas de plan.
Devuelve SOLO un array JSON de 4 strings en español, sin markdown, sin explicación.`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error('error');
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const match = text.match(/\[[\s\S]*?\]/);
  return match ? JSON.parse(match[0]) : [];
}

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
  const { state, dispatch } = useApp();
  const [tab, setTab]           = useState('chat');
  const [thread, setThread]     = useState(INITIAL_THREAD);
  const [draft, setDraft]       = useState('');
  const [thinking, setThinking] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState([]);
  const [suggestions, setSuggestions]         = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchSuggestions(state.user, state.plan)
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  }, []);

  const send = async (text, isSuggestion = false) => {
    if (!text.trim() || thinking) return;
    if (isSuggestion) setUsedSuggestions(u => [...u, text]);
    const userMsg = { role: 'user', text };
    const newThread = [...thread, userMsg];
    setThread(newThread);
    setDraft('');
    setThinking(true);
    try {
      const systemPrompt = buildSystemPrompt(state.user, state.plan, state.sessions);
      const raw = await callGemini(systemPrompt, newThread);

      // Parse and apply [ACTION] blocks
      const actionMatch = raw.match(/\[ACTION\]([\s\S]*?)\[\/ACTION\]/);
      const cleanText = raw.replace(/\[ACTION\][\s\S]*?\[\/ACTION\]/g, '').trim();

      if (actionMatch) {
        try {
          const action = JSON.parse(actionMatch[1]);
          // Auto-sync exercises count when exercisesList is provided
          if (action.changes?.exercisesList) {
            action.changes.exercises = action.changes.exercisesList.length;
          }
          dispatch({ type: 'UPDATE_PLAN_DAY', payload: action });
        } catch (_) {}
      }

      setThread(t => [...t, { role: 'ai', text: cleanText }]);
    } catch (e) {
      console.error('Gemini error:', e.message);
      setThread(t => [...t, { role: 'ai', text: `Error: ${e.message}` }]);
    } finally {
      setThinking(false);
    }
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
              {lastIsAI && (loadingSuggestions || suggestions.filter(s => !usedSuggestions.includes(s)).length > 0) && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>Sugerencias</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {loadingSuggestions
                      ? [80, 120, 100, 90].map((w, i) => (
                          <View key={i} style={{ width: w, height: 38, backgroundColor: T.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.hairline, opacity: 0.5 }} />
                        ))
                      : suggestions.filter(s => !usedSuggestions.includes(s)).map(s => (
                          <TouchableOpacity key={s} onPress={() => send(s, true)} style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.md, padding: 10 }}>
                            <Text style={{ fontFamily: 'System', fontSize: 13, color: T.ink }}>{s}</Text>
                          </TouchableOpacity>
                        ))
                    }
                  </View>
                </View>
              )}
              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={{ padding: SPACING.md, paddingBottom: 100 }}>
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

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { RADIUS, SPACING } from '../tokens';
import { IconBtn, ImageSlot } from '../components/UI';
import { IconClose, IconPause, IconPlay, IconCheck, IconPlus, IconChevLeft, IconChevRight, IconTimer, IconNote } from '../components/Icons';
import { TODAY } from '../data';
import { useApp } from '../context/AppContext';
import Svg, { Circle } from 'react-native-svg';

// ── Rest circle timer ─────────────────────────────────────────
function RestCircle({ total, left, T }) {
  const r = 22, c = 2 * Math.PI * r;
  const off = c * (1 - left / total);
  return (
    <View style={{ width: 54, height: 54 }}>
      <Svg width="54" height="54">
        <Circle cx="27" cy="27" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" />
        <Circle cx="27" cy="27" r={r} stroke={T.accent} strokeWidth="3" fill="none"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 27 27)" />
      </Svg>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <IconTimer size={18} color={T.accent} />
      </View>
    </View>
  );
}

// ── Set row with editable reps/kg ─────────────────────────────
function SetRow({ T, idx, s, active, onComplete, onUndo, onEditReps, onEditKg }) {
  const cellBase = { flex: 1, borderRadius: RADIUS.md, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' };
  const cellBg = s.done ? T.surface2 : T.surface;
  const cellBorder = s.done ? 0 : 1;
  const textStyle = { fontFamily: 'SpaceMono', fontSize: 15, fontWeight: '500', color: s.done ? T.ink3 : T.ink, textDecorationLine: s.done ? 'line-through' : 'none' };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4, borderRadius: RADIUS.md, backgroundColor: active ? T.accentSoft : 'transparent', borderWidth: 1, borderColor: active ? T.accent : 'transparent' }}>
      <Text style={{ width: 24, fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '600', color: s.done ? T.ink3 : T.ink, textAlign: 'center' }}>{idx}</Text>

      {/* Reps — editable when active */}
      <View style={[cellBase, { backgroundColor: cellBg, borderWidth: cellBorder, borderColor: T.hairline }]}>
        {active && !s.done ? (
          <TextInput value={String(s.reps)} onChangeText={onEditReps} keyboardType="numeric" selectTextOnFocus
            style={[textStyle, { textDecorationLine: 'none', textAlign: 'center', padding: 0, minWidth: 30 }]} />
        ) : (
          <Text style={textStyle}>{s.reps}</Text>
        )}
      </View>

      {/* Kg — editable when active */}
      <View style={[cellBase, { backgroundColor: cellBg, borderWidth: cellBorder, borderColor: T.hairline }]}>
        {active && !s.done ? (
          <TextInput value={String(s.kg)} onChangeText={onEditKg} keyboardType="numeric" selectTextOnFocus
            style={[textStyle, { textDecorationLine: 'none', textAlign: 'center', padding: 0, minWidth: 36 }]} />
        ) : (
          <Text style={textStyle}>{s.kg}kg</Text>
        )}
      </View>

      {/* RPE */}
      <View style={[cellBase, { backgroundColor: cellBg, borderWidth: cellBorder, borderColor: T.hairline }]}>
        <Text style={textStyle}>{s.rpe}</Text>
      </View>

      {/* Complete / Undo button */}
      <TouchableOpacity onPress={s.done ? onUndo : onComplete} style={{ width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: s.done ? T.surface2 : active ? T.accent : T.surface, borderWidth: s.done || active ? 0 : 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
        <IconCheck size={18} color={s.done ? T.ink3 : active ? T.accentInk : T.ink3} />
      </TouchableOpacity>
    </View>
  );
}

export default function SessionScreen({ navigation, T }) {
  const { state, dispatch } = useApp();
  const todayPlan = state.plan.find(d => d.status === 'today');
  const sessionLabel = todayPlan?.label || TODAY.label;
  const [exs, setExs] = useState(() => {
    const src = todayPlan?.exercisesList || TODAY.exercises;
    return JSON.parse(JSON.stringify(src));
  });
  const [curIdx, setCurIdx]     = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [paused, setPaused]     = useState(false);
  const [resting, setResting]   = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(150);

  const ex = exs[curIdx];

  // Session clock (counts up)
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [paused]);

  // Rest countdown
  useEffect(() => {
    if (!resting) return;
    if (restLeft <= 0) { setResting(false); return; }
    const t = setTimeout(() => setRestLeft(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resting, restLeft]);

  const timeStr = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  const completeSet = (sIdx) => {
    const next = JSON.parse(JSON.stringify(exs));
    next[curIdx].sets[sIdx].done = true;
    setExs(next);
    setRestTotal(next[curIdx].rest);
    setRestLeft(next[curIdx].rest);
    setResting(true);
  };

  const undoSet = (sIdx) => {
    const next = JSON.parse(JSON.stringify(exs));
    next[curIdx].sets[sIdx].done = false;
    setExs(next);
    setResting(false);
  };

  const editSet = (eIdx, sIdx, field, raw) => {
    const val = parseInt(raw) || 0;
    const next = JSON.parse(JSON.stringify(exs));
    next[eIdx].sets[sIdx][field] = val;
    setExs(next);
  };

  const addSet = () => {
    const next = JSON.parse(JSON.stringify(exs));
    const last = next[curIdx].sets[next[curIdx].sets.length - 1];
    next[curIdx].sets.push({ ...last, done: false });
    setExs(next);
  };

  const handleNextExercise = () => {
    const incomplete = ex.sets.filter(s => !s.done).length;
    if (incomplete > 0) {
      Alert.alert(
        'Series incompletas',
        `Quedan ${incomplete} serie${incomplete > 1 ? 's' : ''} sin completar. ¿Avanzar de todas formas?`,
        [
          { text: 'Quedarme', style: 'cancel' },
          { text: 'Avanzar', onPress: () => { setResting(false); setCurIdx(i => Math.min(exs.length - 1, i + 1)); } },
        ]
      );
    } else {
      setResting(false);
      setCurIdx(i => Math.min(exs.length - 1, i + 1));
    }
  };

  const finishSession = () => {
    const completedSets = exs.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
    const totalSets     = exs.reduce((a, e) => a + e.sets.length, 0);
    const totalVolKg    = exs.reduce((a, e) => a + e.sets.filter(s => s.done).reduce((b, s) => b + s.reps * s.kg, 0), 0);

    dispatch({
      type: 'ADD_SESSION',
      payload: {
        id: Date.now(),
        date: new Date().toISOString(),
        label: sessionLabel,
        exercises: exs,
        completedSets,
        totalSets,
        totalVolKg,
        durationSec: elapsed,
      },
    });
    navigation.goBack();
  };

  const handleFinish = () => {
    const incomplete = exs.reduce((a, e) => a + e.sets.filter(s => !s.done).length, 0);
    if (incomplete > 0) {
      Alert.alert(
        'Terminar entreno',
        `Quedan ${incomplete} series sin completar. ¿Terminar igual?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Terminar', style: 'destructive', onPress: finishSession },
        ]
      );
    } else {
      finishSession();
    }
  };

  const totalSets = exs.reduce((a, e) => a + e.sets.length, 0);
  const doneSets  = exs.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const progress  = doneSets / totalSets;
  const isLastEx  = curIdx + 1 >= exs.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: SPACING.md, paddingTop: 6, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconBtn T={T} onPress={() => navigation.goBack()}><IconClose size={20} color={T.ink} /></IconBtn>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.6, textTransform: 'uppercase' }}>SESIÓN · {sessionLabel.split('·')[0].trim().toUpperCase()}</Text>
            <Text style={{ fontFamily: 'System', fontSize: 16, fontWeight: '600', color: T.ink, marginTop: 2 }}>{timeStr}</Text>
          </View>
          <IconBtn T={T} onPress={() => setPaused(p => !p)}>
            {paused ? <IconPlay size={18} color={T.accent} /> : <IconPause size={18} color={T.ink} />}
          </IconBtn>
        </View>
        <View style={{ marginTop: 14, height: 3, backgroundColor: T.surface3, borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progress * 100}%`, backgroundColor: T.accent }} />
        </View>
        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase' }}>Ej. {curIdx + 1} / {exs.length}</Text>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase' }}>{doneSets} / {totalSets} series</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Exercise hero */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 12 }}>
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.xl, overflow: 'hidden' }}>
            <ImageSlot T={T} label={`técnica · ${ex.name.toLowerCase()}`} height={150} style={{ borderRadius: 0, borderWidth: 0 }} />
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>{ex.muscle}</Text>
                  <Text style={{ fontFamily: 'System', fontSize: 22, fontWeight: '700', color: T.ink, letterSpacing: -0.4, marginTop: 2 }}>{ex.name}</Text>
                </View>
              </View>
              {!!ex.note && (
                <View style={{ marginTop: 12, padding: 10, backgroundColor: T.surface2, borderRadius: RADIUS.md, flexDirection: 'row', gap: 8 }}>
                  <IconNote size={14} color={T.ink3} />
                  <Text style={{ flex: 1, fontFamily: 'System', fontSize: 13, color: T.ink2, lineHeight: 18 }}>{ex.note}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Sets table */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 8, paddingBottom: 8 }}>
            <Text style={{ width: 24, fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>#</Text>
            {['Reps', 'Peso', 'RPE'].map(h => (
              <Text key={h} style={{ flex: 1, fontFamily: 'SpaceMono', fontSize: 9, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', textAlign: 'center' }}>{h}</Text>
            ))}
            <View style={{ width: 44 }} />
          </View>
          <View style={{ gap: 6 }}>
            {ex.sets.map((s, i) => {
              const active = !s.done && (i === 0 || ex.sets[i - 1].done);
              return (
                <SetRow key={i} T={T} idx={i + 1} s={s} active={active}
                  onComplete={() => completeSet(i)} onUndo={() => undoSet(i)}
                  onEditReps={v => editSet(curIdx, i, 'reps', v)}
                  onEditKg={v => editSet(curIdx, i, 'kg', v)} />
              );
            })}
          </View>
          <TouchableOpacity onPress={addSet} style={{ marginTop: 10, borderWidth: 1, borderColor: T.hairline, borderStyle: 'dashed', borderRadius: RADIUS.md, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IconPlus size={14} color={T.ink3} />
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: T.ink3 }}>Añadir serie</Text>
          </TouchableOpacity>
        </View>

        {/* Up next */}
        {!isLastEx && (
          <View style={{ paddingHorizontal: SPACING.md }}>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>A continuación</Text>
            <View style={{ gap: 6 }}>
              {exs.slice(curIdx + 1, curIdx + 4).map((e, i) => (
                <View key={i} style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: RADIUS.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '600', color: T.ink2 }}>{curIdx + i + 2}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'System', fontSize: 14, fontWeight: '600', color: T.ink }}>{e.name}</Text>
                    <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{e.sets.length} × {e.sets[0].reps} reps · {e.sets[0].kg} kg</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Rest timer overlay */}
      {resting && (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 100, backgroundColor: T.ink, borderRadius: RADIUS.xl, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 }}>
          <RestCircle total={restTotal} left={restLeft} T={T} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.4, textTransform: 'uppercase' }}>Descanso</Text>
            <Text style={{ fontFamily: 'SpaceMono', fontSize: 30, fontWeight: '500', color: '#fff', letterSpacing: -1, marginTop: 2 }}>
              {String(Math.floor(restLeft / 60)).padStart(1, '0')}:{String(restLeft % 60).padStart(2, '0')}
            </Text>
          </View>
          <View style={{ gap: 6 }}>
            <TouchableOpacity onPress={() => setRestLeft(r => r + 30)} style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: '#fff', letterSpacing: 0.8 }}>+30s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setResting(false)} style={{ backgroundColor: T.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill }}>
              <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, fontWeight: '600', color: T.accentInk, letterSpacing: 0.8 }}>SKIP</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Footer nav */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: SPACING.md, paddingBottom: 36, flexDirection: 'row', gap: 8, backgroundColor: T.bg }}>
        <TouchableOpacity onPress={() => { setResting(false); setCurIdx(i => Math.max(0, i - 1)); }} disabled={curIdx === 0}
          style={{ width: 54, height: 54, borderRadius: RADIUS.lg, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center', opacity: curIdx === 0 ? 0.3 : 1 }}>
          <IconChevLeft size={20} color={T.ink} />
        </TouchableOpacity>
        <TouchableOpacity onPress={isLastEx ? handleFinish : handleNextExercise}
          style={{ flex: 1, height: 54, borderRadius: RADIUS.lg, backgroundColor: isLastEx ? T.ok : T.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontFamily: 'System', fontSize: 15, fontWeight: '600', color: isLastEx ? '#fff' : T.accentInk }}>
            {isLastEx ? 'Terminar entreno' : 'Siguiente ejercicio'}
          </Text>
          <IconChevRight size={18} color={isLastEx ? '#fff' : T.accentInk} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

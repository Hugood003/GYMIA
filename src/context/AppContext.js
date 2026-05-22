import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'gymia_v1';

const initial = {
  user: null,    // { name, age, height, weight, sex, goal, level, days, equip }
  sessions: [],  // [{ id, date, label, exercises, completedSets, totalSets, totalVolKg, durationSec }]
};

function computeStreak(sessions) {
  if (!sessions.length) return 0;
  const sorted = [...sessions]
    .map(s => new Date(s.date).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const d of sorted) {
    const diff = Math.round((cursor - d) / 86400000);
    if (diff <= 1) { streak++; cursor = d; }
    else break;
  }
  return streak;
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'ADD_SESSION':
      return { ...state, sessions: [action.payload, ...state.sessions] };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) dispatch({ type: 'LOAD', payload: JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const streak = computeStreak(state.sessions);

  const sessionsThisWeek = () => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 86400000);
    return state.sessions.filter(s => new Date(s.date) >= weekAgo).length;
  };

  const volumeThisWeek = () => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 86400000);
    const kg = state.sessions
      .filter(s => new Date(s.date) >= weekAgo)
      .reduce((sum, s) => sum + (s.totalVolKg || 0), 0);
    return Math.round(kg / 100) / 10; // tonnes
  };

  return (
    <AppContext.Provider value={{ state, dispatch, loaded, streak, sessionsThisWeek, volumeThisWeek }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

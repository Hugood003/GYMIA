// Shared UI primitives — Pill, CTA, Section, ImageSlot, etc.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { RADIUS, SPACING } from '../tokens';

// ── Pill ─────────────────────────────────────────────────────
export function Pill({ children, T, tone = 'soft', style }) {
  const tones = {
    soft:   { bg: T.surface2, fg: T.ink2 },
    accent: { bg: T.accent,   fg: T.accentInk },
    ghost:  { bg: 'transparent', fg: T.ink3, border: T.hairline },
    ink:    { bg: T.ink,      fg: T.bg },
  }[tone] || { bg: T.surface2, fg: T.ink2 };

  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 10, paddingVertical: 5,
      borderRadius: RADIUS.pill,
      backgroundColor: tones.bg,
      borderWidth: tones.border ? 1 : 0,
      borderColor: tones.border || 'transparent',
      alignSelf: 'flex-start',
    }, style]}>
      <Text style={{
        fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 0.6,
        textTransform: 'uppercase', fontWeight: '500', color: tones.fg,
      }}>{children}</Text>
    </View>
  );
}

// ── CTA Button ───────────────────────────────────────────────
export function CTA({ children, onPress, T, tone = 'accent', style, icon, disabled }) {
  const tones = {
    accent: { bg: T.accent,       fg: T.accentInk },
    ink:    { bg: T.ink,          fg: T.bg },
    ghost:  { bg: 'transparent',  fg: T.ink, border: T.hairline },
  }[tone] || { bg: T.accent, fg: T.accentInk };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={disabled} style={[{
      backgroundColor: tones.bg,
      opacity: disabled ? 0.6 : 1,
      borderRadius: RADIUS.pill,
      paddingVertical: 16, paddingHorizontal: 22,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10,
      borderWidth: tones.border ? 1 : 0,
      borderColor: tones.border || 'transparent',
    }, style]}>
      <Text style={{
        fontFamily: 'System', fontSize: 16, fontWeight: '600',
        letterSpacing: -0.2, color: tones.fg,
      }}>{children}</Text>
      {icon}
    </TouchableOpacity>
  );
}

// ── Section header ───────────────────────────────────────────
export function Section({ kicker, title, action, onAction, T, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 10 }, style]}>
      <View>
        {kicker && <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: T.ink3, marginBottom: 4 }}>{kicker}</Text>}
        <Text style={{ fontFamily: 'System', fontSize: 20, fontWeight: '600', color: T.ink, letterSpacing: -0.4 }}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={onAction ? 0.6 : 1}>
          <Text style={{ fontFamily: 'SpaceMono', fontSize: 11, color: onAction ? T.ink2 : T.ink3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Icon Button ──────────────────────────────────────────────
export function IconBtn({ children, onPress, T, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[{
      width: 44, height: 44, borderRadius: RADIUS.md,
      backgroundColor: T.surface,
      borderWidth: 1, borderColor: T.hairline,
      alignItems: 'center', justifyContent: 'center',
    }, style]}>
      {children}
    </TouchableOpacity>
  );
}

// ── Image placeholder ────────────────────────────────────────
export function ImageSlot({ T, label = 'foto técnica', height = 140, style }) {
  return (
    <View style={[{
      height, borderRadius: RADIUS.md, overflow: 'hidden',
      backgroundColor: T.surface2,
      borderWidth: 1, borderColor: T.hairline,
      alignItems: 'center', justifyContent: 'center',
    }, style]}>
      <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.4, textTransform: 'uppercase' }}>↳ {label}</Text>
    </View>
  );
}

// ── Hairline divider ─────────────────────────────────────────
export function Hairline({ T, style }) {
  return <View style={[{ height: 1, backgroundColor: T.hairline }, style]} />;
}

// ── PageHeader ───────────────────────────────────────────────
export function PageHeader({ T, kicker, title, right }) {
  return (
    <View style={{ paddingHorizontal: SPACING.md, paddingBottom: 18, paddingTop: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View>
        {kicker && <Text style={{ fontFamily: 'SpaceMono', fontSize: 10, color: T.ink3, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 }}>{kicker}</Text>}
        <Text style={{ fontFamily: 'System', fontSize: 30, fontWeight: '700', color: T.ink, letterSpacing: -0.6, lineHeight: 34 }}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

// ── SubHeader (back button) ──────────────────────────────────
export function SubHeader({ T, title, onBack, action }) {
  const { IconChevLeft } = require('./Icons');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: 14, paddingTop: 6, gap: 12 }}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={{
          width: 38, height: 38, borderRadius: RADIUS.md,
          backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <IconChevLeft size={18} color={T.ink} />
        </TouchableOpacity>
      )}
      <Text style={{ flex: 1, fontFamily: 'System', fontSize: 18, fontWeight: '600', color: T.ink }}>{title}</Text>
      {action}
    </View>
  );
}

// ── Toggle switch ────────────────────────────────────────────
export function Toggle({ T, on, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{
      width: 44, height: 26, borderRadius: RADIUS.pill, padding: 2,
      backgroundColor: on ? T.accent : T.surface3,
      flexDirection: 'row', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
    }}>
      <View style={{
        width: 22, height: 22, borderRadius: RADIUS.pill,
        backgroundColor: on ? T.accentInk : T.bg,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2,
        elevation: 2,
      }} />
    </TouchableOpacity>
  );
}

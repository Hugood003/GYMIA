// GYMIA — Design Tokens
// Electric lime accent, warm off-white surfaces, deep ink.

export const COLORS = {
  // Light theme
  light: {
    bg:          '#F3EFE6',
    surface:     '#FFFFFF',
    surface2:    '#EAE5D8',
    surface3:    '#DCD6C5',
    hairline:    'rgba(11,12,14,0.08)',
    ink:         '#0B0C0E',
    ink2:        '#3F3D36',
    ink3:        '#7A766B',
    accent:      '#C9FF3C',
    accentInk:   '#0B0C0E',
    accentSoft:  '#E9FAB8',
    ok:          '#1E7A4D',
    warn:        '#C8732A',
    alert:       '#B23A2A',
  },
  // Dark theme
  dark: {
    bg:          '#0A0B0E',
    surface:     '#16181C',
    surface2:    '#1F2228',
    surface3:    '#2A2E36',
    hairline:    'rgba(255,255,255,0.08)',
    ink:         '#F2F0E8',
    ink2:        '#C8C6BC',
    ink3:        '#8B897F',
    accent:      '#C9FF3C',
    accentInk:   '#0B0C0E',
    accentSoft:  'rgba(201,255,60,0.16)',
    ok:          '#5BE39A',
    warn:        '#FFB169',
    alert:       '#FF8A75',
  },
};

export const FONTS = {
  ui:       'System',
  mono:     'SpaceMono',  // fallback monospace available in Expo
};

export const RADIUS = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   24,
  pill: 999,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
};

import React from 'react';
import Svg, { Path, Rect, Circle, Polygon, Line } from 'react-native-svg';

const Icon = ({ size = 22, color = 'currentColor', children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const IconHome = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M3 11l9-8 9 8" /><Path d="M5 10v10h14V10" />
  </Icon>
);
export const IconPlan = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Rect x="3" y="5" width="18" height="16" rx="2" />
    <Path d="M3 9h18M8 3v4M16 3v4" />
  </Icon>
);
export const IconSpark = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
    <Path d="M19 15l.8 2 .2.2.2.2 1.8.6-1.8.6-.2.2-.2.2-.8 2-.8-2-.2-.2-.2-.2-1.8-.6 1.8-.6.2-.2.2-.2.8-2z" />
  </Icon>
);
export const IconChart = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M4 20V8M10 20V4M16 20v-6M22 20H2" />
  </Icon>
);
export const IconUser = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Circle cx="12" cy="8" r="4" /><Path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
  </Icon>
);
export const IconCheck = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M4 12l5 5L20 6" />
  </Icon>
);
export const IconPlus = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M12 4v16M4 12h16" />
  </Icon>
);
export const IconMinus = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M4 12h16" />
  </Icon>
);
export const IconClose = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const IconChevRight = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M9 6l6 6-6 6" />
  </Icon>
);
export const IconChevLeft = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M15 6l-6 6 6 6" />
  </Icon>
);
export const IconChevDown = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M6 9l6 6 6-6" />
  </Icon>
);
export const IconArrowUp = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
);
export const IconTimer = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Circle cx="12" cy="13" r="8" /><Path d="M12 9v4l3 2M9 2h6" />
  </Icon>
);
export const IconDumb = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M2 12h2M20 12h2M5 8v8M19 8v8M8 5v14M16 5v14M8 12h8" />
  </Icon>
);
export const IconBolt = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color || '#000'}>
    <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </Svg>
);
export const IconSend = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M4 12l16-8-6 18-2-8-8-2z" />
  </Icon>
);
export const IconMic = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Rect x="9" y="3" width="6" height="12" rx="3" />
    <Path d="M5 11a7 7 0 0014 0M12 18v3" />
  </Icon>
);
export const IconFlame = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M12 3c2 4-1 5 1 8 1 1.5 3 1 3 4a4 4 0 11-8 0c0-3 3-3 1-7 1 0 2-2 3-5z" />
  </Icon>
);
export const IconScale = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M6 4h12M12 4v17M6 21h12M5 9l-3 6a4 4 0 008 0L7 9zM17 9l-3 6a4 4 0 008 0l-3-6z" />
  </Icon>
);
export const IconTarget = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Circle cx="12" cy="12" r="9" /><Circle cx="12" cy="12" r="5" />
    <Circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
  </Icon>
);
export const IconHistory = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" />
    <Path d="M3 3v5h5M12 7v5l3 2" />
  </Icon>
);
export const IconSettings = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.7 1.7 0 00.4 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.4-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.4-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.4H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.4l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.4 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
  </Icon>
);
export const IconHeart = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M12 20s-7-4.3-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.7-9 9-9 9z" />
  </Icon>
);
export const IconBell = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0" />
  </Icon>
);
export const IconShield = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
  </Icon>
);
export const IconCalendar = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Rect x="3" y="5" width="18" height="16" rx="2" />
    <Path d="M3 9h18M8 3v4M16 3v4" />
  </Icon>
);
export const IconNote = ({ size, color }) => (
  <Icon size={size} color={color}>
    <Path d="M5 3h14v18l-7-3-7 3V3z" />
  </Icon>
);
export const IconPause = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color || '#000'}>
    <Rect x="6" y="4" width="4" height="16" /><Rect x="14" y="4" width="4" height="16" />
  </Svg>
);
export const IconPlay = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color || '#000'}>
    <Polygon points="6,4 20,12 6,20" />
  </Svg>
);
export const IconEye = ({ size, color, open = true }) => open ? (
  <Icon size={size} color={color}>
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <Circle cx="12" cy="12" r="3" />
  </Icon>
) : (
  <Icon size={size} color={color}>
    <Path d="M3 3l18 18M10.6 6.2A9 9 0 0112 6c6.5 0 10 6 10 6a17 17 0 01-3.4 4M6.2 7.6A17 17 0 002 12s3.5 6 10 6a9 9 0 003.4-.7" />
    <Path d="M9.9 9.9a3 3 0 004.2 4.2" />
  </Icon>
);

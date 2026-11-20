/**
 * CANDY_SWEET — claymorphism design system for SweetCandyVoyage.
 * Puffy dense candy blocks, radius 24-32, outer soft shadow + inner light line.
 */
import type {TextStyle, ViewStyle} from 'react-native';

export const colors = {
  bg: '#FFF0F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F8E8F0',
  surfaceDeep: '#FFE0EB',
  surfaceMute: '#F6EEF3',

  primary: '#FF69B4',
  primaryDark: '#FF4FA3',
  primaryLight: '#FF8FC8',
  secondary: '#9B59B6',
  loaderDeep: '#4E1D5E',

  lemon: '#FFC23C',
  mint: '#3ED6B5',
  berry: '#FF4D6D',
  grape: '#9B59B6',
  strawberry: '#FF69B4',

  syrup: '#C97B3C',
  syrupRim: '#7A4A1E',
  syrupPale: '#F2EAE0',

  text: '#4A2040',
  textSoft: '#8A6B86',
  textMute: '#B39BB0',
  onDark: '#FFFFFF',
  onDarkSoft: '#FFD9EC',

  border: '#F2DCE8',
  borderDeep: '#E8D7E2',
  success: '#1FA98C',
  successSoft: '#D9F7EE',
  danger: '#FF4D6D',
  disabled: '#E8E8EC',
} as const;

/** The five candy tints, indexed by CandyType 0..4 */
export const CANDY_TINTS = [
  colors.strawberry,
  colors.lemon,
  colors.mint,
  colors.berry,
  colors.grape,
] as const;

export const gradients = {
  loader: ['#4E1D5E', '#9B59B6', '#FF69B4'],
  loaderBar: ['#FFC23C', '#FF69B4', '#9B59B6'],
  menu: ['rgba(255,240,245,0.90)', 'rgba(255,224,235,0.94)', 'rgba(248,232,240,0.97)'],
  board: ['rgba(255,240,245,0.92)', 'rgba(248,232,240,0.95)'],
  map: ['rgba(255,240,245,0.88)', 'rgba(217,247,238,0.92)'],
  sheet: ['rgba(255,240,245,0.93)', 'rgba(255,224,235,0.96)'],
  primary: ['#FF8FC8', '#FF4FA3'],
  mint: ['#3ED6B5', '#1FA98C'],
  grape: ['#B678D1', '#9B59B6'],
  resultWin: ['#FFD9EC', '#FF8FC8', '#9B59B6'],
  resultLose: ['#F2EAE0', '#D7A978', '#8A5A3B'],
} as const;

export const spacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32} as const;

export const radius = {sm: 12, md: 18, lg: 24, xl: 30, xxl: 32, pill: 100} as const;

export const type = {
  hero: {fontSize: 34, lineHeight: 42, fontWeight: '900', letterSpacing: 1.4} as TextStyle,
  title: {fontSize: 22, lineHeight: 28, fontWeight: '900', letterSpacing: 0.4} as TextStyle,
  section: {fontSize: 16, lineHeight: 22, fontWeight: '800', letterSpacing: 0.2} as TextStyle,
  body: {fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0.1} as TextStyle,
  caption: {fontSize: 10, lineHeight: 14, fontWeight: '800', letterSpacing: 1.6} as TextStyle,
  label: {fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 1.4} as TextStyle,
  number: {fontSize: 22, lineHeight: 26, fontWeight: '900', fontVariant: ['tabular-nums']} as TextStyle,
};

/** Claymorph surface: dense fill + coloured outer shadow. The inner light line is a <ClayHighlight/>. */
export function clay(tint: string = colors.secondary, depth: number = 8): ViewStyle {
  return {
    shadowColor: tint,
    shadowOffset: {width: 0, height: depth},
    shadowOpacity: 0.28,
    shadowRadius: depth * 2.4,
    elevation: Math.round(depth * 0.9),
  };
}

export const shadows = {
  card: clay(colors.secondary, 7),
  button: clay(colors.primaryDark, 9),
  soft: clay(colors.secondary, 4),
};

export const theme = {
  name: 'CANDY_SWEET',
  colors,
  gradients,
  spacing,
  radius,
  type,
  shadows,
  clay,
  CANDY_TINTS,
};

export default theme;

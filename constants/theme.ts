const colors = {
  // Flatly brand palette (neutral–blue)
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#121829',
  secondaryDark: '#0E1525',
  accent: '#3B82F6',
  accentDark: '#2563EB',

  // Blue gradients
  gradientBlue: ['#2563EB', '#3B82F6'],
  gradientLightBlue: ['#60A5FA', '#3B82F6'],
  gradientNavy: ['#121829', '#0E1525'],
  gradientSky: ['#93C5FD', '#60A5FA'],
  gradientDeep: ['#0E1525', '#121829'],
  gradientSoft: ['#DBEAFE', '#BFDBFE'],

  // Legacy aliases (kept to avoid crashes, mapped to new palette)
  lavender: '#3B82F6',
  mint: '#2563EB',
  babyBlue: '#93C5FD',
  peach: '#121829',
  softLilac: '#F2F6FC',

  // Text and surfaces
  textPrimary: '#121829',
  textSecondary: '#667085',
  textLight: '#98A2B3',
  white: '#FFFFFF',
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Status colors
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F5A524',
  info: '#2563EB',

  // Borders and dividers
  border: '#E6EAF2',
  borderLight: '#EEF2F8',
} as const;

const shadows = {
  // Modern elevated shadows tuned for light surfaces
  card: {
    shadowColor: '#121829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },
  button: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: '#121829',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  soft: {
    shadowColor: '#121829',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Legacy shadows for compatibility
  clay: {
    shadowColor: '#121829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },
  clayInner: {
    shadowColor: '#121829',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

const radius = {
  xs: 8,
  small: 12,
  medium: 16,
  large: 20,
  xl: 24,
  xxl: 32,
  round: 999,
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Modern gradient utilities
const gradients = {
  primary: colors.gradientBlue,
  secondary: colors.gradientLightBlue,
  navy: colors.gradientNavy,
  sky: colors.gradientSky,
  deep: colors.gradientDeep,
  soft: colors.gradientSoft,
} as const;

// Consolidated theme object
export const theme = {
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    surface: colors.surface,
    background: colors.background,
    border: colors.border,
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    success: colors.success,
    danger: colors.danger,
    info: colors.info,
  },
  typography: {
    fontFamily: {
      regular: 'Montserrat-Regular',
      semiBold: 'Montserrat-SemiBold',
      bold: 'Montserrat-Bold',
    },
    fontSize: {
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      body: 16,
      bodyLarge: 17,
      small: 14,
      tiny: 12,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    card: shadows.card,
    input: shadows.soft,
    button: shadows.button,
  },
  borderRadius: radius.large,
  spacing,
  gradients,
} as const;

// Export individual parts for flexibility
export { colors, shadows, radius, spacing, gradients };
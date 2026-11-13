// Mirror of tailwind.config.js — used in StyleSheet.create and animated values
// where NativeWind class strings can't reach. Keep in sync with the Tailwind config.
export const colors = {
  primary: {
    DEFAULT: "#0064EC",
    dark: "#0052C4",
    light: "#E5F0FE",
  },
  brand: {
    DEFAULT: "#0064EC",
    dark: "#0052C4",
    light: "#E5F0FE",
    navy: "#1E3A8A",
    navyDark: "#163284",
  },
  ink: {
    DEFAULT: "#1A2230",
    soft: "#3A4F64",
    muted: "#6B7F94",
  },
  accent: "#0064EC",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#0064EC",
  surface: "#FFFFFF",
  background: "#F6F8FB",
  border: "#E5E9F0",
  borderStrong: "#CBD3DD",
  text: {
    primary: "#1A2230",
    secondary: "#3A4F64",
    muted: "#6B7F94",
    inverse: "#FFFFFF",
  },
} as const;

// Mirror of tailwind.config.js — used in StyleSheet.create and animated values
// where NativeWind class strings can't reach. Keep in sync with the Tailwind config.
export const colors = {
  primary: {
    DEFAULT: "#0064EC",
    dark: "#0050C7",
    light: "#E5F0FE",
  },
  brand: {
    DEFAULT: "#0064EC",
    dark: "#0050C7",
    light: "#E5F0FE",
    navy: "#0A2540",
    navyDark: "#061A2E",
  },
  ink: {
    DEFAULT: "#1A2230",
    soft: "#3A4F64",
    muted: "#6B7F94",
  },
  accent: "#0064EC",
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
  info: "#3B82F6",
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

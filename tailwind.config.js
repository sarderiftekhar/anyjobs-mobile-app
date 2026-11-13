/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // The app is light-only (app.json userInterfaceStyle). With the default
  // "media" mode NativeWind throws on web when it applies that fixed scheme.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand primary — single-source per the web design guide §0 rule #3
        // All shades come from this hex; opacity tiers (primary/10, /20, /30) for tints.
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
          "navy-dark": "#163284",
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
        "border-strong": "#CBD3DD",
        // Legacy aliases so existing className usages don't break mid-migration.
        // Remove these once all references are migrated to ink-* / primary tokens.
        "text-primary": "#1A2230",
        "text-secondary": "#6B7F94",
      },
      fontFamily: {
        satoshi: ["Satoshi-Variable"],
        "satoshi-italic": ["Satoshi-VariableItalic"],
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
    },
  },
  plugins: [],
};

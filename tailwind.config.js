/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary uses the web's brand-navy (--brand-500)
        primary: {
          DEFAULT: "#1E3A8A",
          dark: "#1338CB",
          light: "#E0E7FF",
        },
        // Brand tokens mirror resources/css/app.css vars on the web
        brand: {
          DEFAULT: "#1842E9",
          dark: "#1338CB",
          navy: "#1E3A8A",
          "navy-dark": "#163284",
        },
        ink: {
          DEFAULT: "#1a2230",
          soft: "#3A4F64",
          muted: "#6B7F94",
        },
        accent: "#1842E9",
        success: "#22C55E",
        warning: "#EAB308",
        danger: "#EF4444",
        info: "#3B82F6",
        surface: "#FFFFFF",
        background: "#F8F9FA",
        border: "#E5E7EB",
        "text-primary": "#1F2937",
        "text-secondary": "#6B7280",
      },
      fontFamily: {
        satoshi: ["Satoshi-Variable"],
        "satoshi-italic": ["Satoshi-VariableItalic"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};

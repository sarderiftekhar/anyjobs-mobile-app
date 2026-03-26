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
        primary: {
          DEFAULT: "#574BA6",
          dark: "#4B498C",
          light: "#E8E5FF",
        },
        accent: "#A79AFF",
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

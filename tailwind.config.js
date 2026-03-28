/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09111f",
        panel: "#0f172a",
        mist: "#dbe4ff",
        accent: "#7dd3fc",
        glow: "#f59e0b",
        success: "#34d399"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["'DM Sans'", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        focus: "0 20px 60px rgba(14, 165, 233, 0.18)"
      }
    }
  },
  plugins: []
};

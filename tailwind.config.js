/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	darkMode: "class",
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				border: "#334155",
				input: "#334155",
				ring: "hsl(var(--ring))",
				background: {
					DEFAULT: "#0F172A",
					card: "#1E293B",
					foreground: "hsl(var(--background))",
				},
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "#8B5CF6",
					dark: "#7C3AED",
					light: "#A78BFA",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "#94A3B8",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				text: {
					DEFAULT: "#F8FAFC",
					primary: "#8B5CF6",
					muted: "#94A3B8",
				},
			},
			spacing: {
				safeTop: "48px",
				screenPadding: "16px",
			},
		},
	},
	plugins: [],
};

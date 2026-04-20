import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#F8FAFC', // Ghost White
                foreground: '#1A237E', // Deep Navy
                muted: '#f4f4f5',
                'muted-foreground': '#71717a',
                border: '#e4e4e7',
                accent: '#1A237E', // Deep Navy
                success: '#00C853',
                danger: '#ef4444',
                navy: {
                    deep: '#1A237E',
                },
                blue: {
                    royal: '#0D47A1',
                },
                gray: {
                    light: '#F8FAFC', // Ghost White
                },
                white: '#FFFFFF', // Pure White
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
                roboto: ['Roboto', 'system-ui', 'sans-serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
                'card': '0 8px 30px rgba(0, 0, 0, 0.08)',
                'glow': '0 0 25px rgba(13, 71, 161, 0.35)',
            }
        },
    },
    plugins: [],
};
export default config;
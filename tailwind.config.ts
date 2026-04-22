import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#3b82f6",
                background: {
                    DEFAULT: '#ffffff',
                    dark: '#0f172a'
                },
                foreground: {
                    DEFAULT: '#1A1A1B',
                    dark: '#f8fafc'
                },
                muted: {
                    DEFAULT: '#64748b',
                    dark: '#64748b'
                },
                'muted-foreground': {
                    DEFAULT: '#475569',
                    dark: '#94a3b8'
                },
                accent: {
                    DEFAULT: '#1a237e',
                    dark: '#3b82f6'
                },
                border: {
                    DEFAULT: '#e2e8f0',
                    dark: '#334155'
                },
                card: {
                    DEFAULT: '#ffffff',
                    dark: '#1e293b'
                },
                success: '#10B981',
                danger: '#EF4444',
                warning: '#F59E0B',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-heading)', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
                'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
                '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
                'soft': '0 2px 4px rgba(0, 0, 0, 0.06)',
                'card': '0 4px 6px rgba(0, 0, 0, 0.07)',
                'glow': '0 10px 25px rgba(59, 130, 246, 0.15)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
        },
    },
    plugins: [],
};
export default config;
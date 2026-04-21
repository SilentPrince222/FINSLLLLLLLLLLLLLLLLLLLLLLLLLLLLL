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
                background: '#ffffff',
                foreground: '#1A1A1B',
                muted: '#64748b',
                border: '#e2e8f0',
                card: '#ffffff',
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
            },
        },
    },
    plugins: [],
};
export default config;
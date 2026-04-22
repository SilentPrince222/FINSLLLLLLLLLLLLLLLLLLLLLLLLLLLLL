// Design Tokens - Centralized design system configuration
// Use these tokens to maintain consistency across the app

export const colors = {
    // Primary
    primary: '#1A237E',
    primaryLight: '#3949AB',
    primaryDark: '#0D1642',
    
    // Semantic
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Neutral
    white: '#FFFFFF',
    slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
    },
    
    // Brand specific
    navy: {
        deep: '#1A237E',
        light: '#3949AB',
    },
} as const

export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',  // 48px
} as const

export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem',// 30px
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
} as const

export const borderRadius = {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
} as const

export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
} as const

export const transitions = {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
} as const

// Utility functions for common patterns
export const getGradeColor = (score: number): string => {
    if (score < 0 || score > 100) return colors.slate[400]
    if (score >= 90) return colors.success
    if (score >= 80) return colors.primary
    if (score >= 70) return colors.warning
    return colors.danger
}

export const getStatusColor = (status: 'active' | 'inactive'): { bg: string; text: string } => {
    if (status === 'active') {
        return { bg: `${colors.success}15`, text: colors.success }
    }
    if (status === 'inactive') {
        return { bg: colors.slate[100], text: colors.slate[500] }
    }
    throw new Error(`Unknown status: ${status}`)
}
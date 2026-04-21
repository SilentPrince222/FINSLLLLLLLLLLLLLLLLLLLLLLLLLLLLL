import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    children: ReactNode
    loading?: boolean
}

const variants = {
    primary: `
        bg-primary text-white
        hover:bg-navy-light
        active:bg-navy-deep
        disabled:bg-slate-400 disabled:text-white/80
    `,
    secondary: `
        bg-transparent text-primary border border-slate-300
        hover:bg-slate-50 hover:border-primary
        active:bg-slate-100
        disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
    `,
    danger: `
        bg-red-600 text-white
        hover:bg-red-700
        active:bg-red-800
        disabled:bg-slate-400 disabled:text-white/80
    `,
    text: `
        bg-transparent text-primary
        hover:bg-slate-100
        active:bg-slate-200
        disabled:text-slate-400 disabled:cursor-not-allowed
    `,
}

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
}

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2
                font-medium rounded-lg
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                disabled:opacity-60 disabled:cursor-not-allowed
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    )
}
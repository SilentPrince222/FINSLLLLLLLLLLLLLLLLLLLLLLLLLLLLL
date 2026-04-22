'use client'

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', id, ...props }, ref) => {
    // Bug 5.10: generate a stable id so aria-describedby matches the error element
    const inputId = id ?? (props.name ? `input-${props.name}` : undefined)
    const errorId = inputId ? `${inputId}-error` : undefined

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                aria-describedby={error && errorId ? errorId : undefined}
                aria-invalid={error ? true : undefined}
                className={`
                    w-full px-3 py-2 bg-background border border-border rounded-lg
                    text-sm text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                    disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
                    transition-all duration-150
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && <p id={errorId} className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
})

Input.displayName = 'Input'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, options, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-foreground mb-1">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
                    w-full px-3 py-2 bg-background border border-border rounded-lg
                    text-sm text-foreground
                    focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                    disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
                    transition-all duration-150
                    ${className}
                `}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
})

Select.displayName = 'Select'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-foreground mb-1">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={`
                    w-full px-3 py-2 bg-background border border-border rounded-lg
                    text-sm text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                    disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
                    transition-all duration-150 resize-none
                    ${error ? 'border-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
})

Textarea.displayName = 'Textarea'

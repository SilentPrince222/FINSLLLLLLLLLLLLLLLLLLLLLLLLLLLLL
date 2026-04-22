interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-10 h-10 border-3'
    }

    return (
        // Bug 5.19: add role="status" so screen readers announce "Loading"
        <div role="status" aria-label="Loading" className={`flex items-center justify-center ${className}`}>
            <div className={`${sizes[size]} rounded-full border-slate-200 border-t-indigo-600 animate-spin`} />
            <span className="sr-only">Loading...</span>
        </div>
    )
}
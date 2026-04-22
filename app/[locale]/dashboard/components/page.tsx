'use client'

import Button from '@/components/Button'

export default function ComponentsPage() {
    return (
        <div className="max-w-4xl">
            <h1 className="text-lg font-medium text-primary mb-6">Button Component</h1>

            {/* Variants */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                <h2 className="text-sm font-medium text-primary mb-4">Variants</h2>
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="text">Text</Button>
                </div>
            </div>

            {/* Sizes */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                <h2 className="text-sm font-medium text-primary mb-4">Sizes</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                </div>
            </div>

            {/* States */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                <h2 className="text-sm font-medium text-primary mb-4">States</h2>
                <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </div>

            {/* All combinations */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-sm font-medium text-primary mb-4">All Combinations</h2>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <span className="w-20 text-sm text-slate-500">Primary:</span>
                        <Button variant="primary" size="sm">sm</Button>
                        <Button variant="primary" size="md">md</Button>
                        <Button variant="primary" size="lg">lg</Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className="w-20 text-sm text-slate-500">Secondary:</span>
                        <Button variant="secondary" size="sm">sm</Button>
                        <Button variant="secondary" size="md">md</Button>
                        <Button variant="secondary" size="lg">lg</Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className="w-20 text-sm text-slate-500">Danger:</span>
                        <Button variant="danger" size="sm">sm</Button>
                        <Button variant="danger" size="md">md</Button>
                        <Button variant="danger" size="lg">lg</Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className="w-20 text-sm text-slate-500">Text:</span>
                        <Button variant="text" size="sm">sm</Button>
                        <Button variant="text" size="md">md</Button>
                        <Button variant="text" size="lg">lg</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

type SupabaseContextType = {
    supabase: ReturnType<typeof createClientComponentClient<Database>>;
    isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClientComponentClient<Database>());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                await supabase.auth.getSession();
            } catch (error) {
                console.error('Failed to get supabase session:', error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [supabase]);

    return React.createElement(
        SupabaseContext.Provider,
        {
            value: {
                supabase,
                isLoading
            }
        },
        children
    );
}

export function useSupabase() {
    const context = useContext(SupabaseContext);
    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
}

export function createClient() {
    return createClientComponentClient<Database>();
}

export const supabase = createClient();

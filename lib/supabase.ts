'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';

type SupabaseContextType = {
    supabase: SupabaseClient<Database>;
    isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClientComponentClient<Database>());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await supabase.auth.getSession();
            setIsLoading(false);
        };
        init();
    }, [supabase]);

    // @ts-ignore - Known type conflict bug in supabase auth helpers version
    return React.createElement(SupabaseContext.Provider, { value: { supabase, isLoading } }, children);
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
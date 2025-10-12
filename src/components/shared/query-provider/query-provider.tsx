"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { iQueryProviderProps } from './query-provider.types';
import { useState } from 'react';


export function QueryProvider(props: iQueryProviderProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {props.children}
        </QueryClientProvider>
    );
};
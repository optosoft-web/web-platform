'use client'

import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicialmente, definimos um estado de carregamento
    setIsLoading(true);
    const supabase = createClient();

    // 1. Tenta obter o usuário da sessão atual imediatamente
    const checkInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkInitialUser();

    // 2. Cria um "ouvinte" para futuras mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`); // Ótimo para depuração
      
      setUser(session?.user ?? null);
      
      setIsLoading(false); 
    });

    // 3. Função de limpeza: quando o componente que usa o hook for desmontado,
    // o "ouvinte" é removido para evitar vazamentos de memória.
    return () => {
      subscription.unsubscribe();
    };
  }, []); // O array vazio ainda está correto aqui, pois só queremos configurar o ouvinte uma vez.

  return { user, isLoading };
}
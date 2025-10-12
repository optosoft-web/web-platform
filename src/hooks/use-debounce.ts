import { useState, useEffect } from 'react';

// O hook recebe um valor (que muda rapidamente, como o texto da busca)
// e um delay (quanto tempo de inatividade esperar).
export function useDebounce<T>(value: T, delay: number): T {
  // 1. Criamos um estado interno para guardar o valor "atrasado" (debounced).
  // É este valor que será retornado no final.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // 2. Usamos useEffect para reagir sempre que o `value` original mudar.
  useEffect(() => {
    // 3. Quando `value` muda (usuário digitou uma letra), nós INICIAMOS UM TIMER.
    const handler = setTimeout(() => {
      // 4. APENAS QUANDO O TIMER TERMINAR (após o 'delay'), nós atualizamos
      // o nosso estado `debouncedValue` com o valor mais recente.
      setDebouncedValue(value);
    }, delay);

    // 5. AQUI ESTÁ A MÁGICA DO DEBOUNCE!
    // A função de "cleanup" do useEffect é executada ANTES da próxima
    // vez que o efeito rodar, ou quando o componente for desmontado.
    return () => {
      // Se o usuário digitar outra letra antes do 'delay' de 300ms terminar,
      // o `value` muda, o useEffect vai rodar de novo. Antes disso,
      // esta função de cleanup CANCELA O TIMER ANTERIOR.
      clearTimeout(handler);
    };
  }, [value, delay]); // A dependência é o valor que muda rapidamente.

  // 6. O hook retorna o valor que só é atualizado após a pausa.
  return debouncedValue;
}
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hasMounted, setHasMounted] = useState(false);

  // Read from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setValue(JSON.parse(saved) as T);
      } catch (e) {
        console.error(e);
      }
    }
    setHasMounted(true);
  }, [key]);

  // Persist to localStorage only after initial mount
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, hasMounted]);

  return [value, setValue];
}
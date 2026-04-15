"use client";

import { useCallback, useEffect, useState } from "react";
import type { Prescription, PrescriptionFormData } from "./types";

const STORAGE_KEY = "optosoft_prescriptions";

function generateId(): string {
  return crypto.randomUUID();
}

function loadFromStorage(): Prescription[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Prescription[];
  } catch {
    return [];
  }
}

function saveToStorage(prescriptions: Prescription[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
}

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrescriptions(loadFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage(prescriptions);
    }
  }, [prescriptions, loaded]);

  const create = useCallback((data: PrescriptionFormData) => {
    const newPrescription: Prescription = {
      ...data,
      id: generateId(),
      odAdicao: data.odAdicao ?? 0,
      oeAdicao: data.oeAdicao ?? 0,
    };
    setPrescriptions((prev) => [newPrescription, ...prev]);
  }, []);

  const update = useCallback((id: string, data: PrescriptionFormData) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...data,
              id,
              odAdicao: data.odAdicao ?? 0,
              oeAdicao: data.oeAdicao ?? 0,
            }
          : p
      )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { prescriptions, loaded, create, update, remove };
}

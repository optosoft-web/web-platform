import { create } from 'zustand';

type AuthModalState = {
  isOpen: boolean;
  priceIdToGo?: string;
  open: () => void;
  close: () => void;
  setPriceId: (priceId: string) => void;
  clearPriceId: () => void;
};

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  priceIdToGo: undefined,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setPriceId: (priceId) => set({ priceIdToGo: priceId }),
  clearPriceId: () => set({ priceIdToGo: undefined }),
}));
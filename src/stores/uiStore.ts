import { create } from "zustand";

interface UIState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  hasSeenOnboarding: false,
  setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
}));

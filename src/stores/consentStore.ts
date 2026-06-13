import { create } from "zustand";
import { storage } from "../lib/storage";
import { config } from "../constants/config";

interface ConsentState {
  /** Whether the user has accepted AI data processing. null = not yet loaded. */
  aiConsented: boolean | null;
  loadConsent: () => Promise<void>;
  acceptAiConsent: () => Promise<void>;
}

export const useConsentStore = create<ConsentState>((set) => ({
  aiConsented: null,

  loadConsent: async () => {
    try {
      const value = await storage.get(config.AI_CONSENT_KEY);
      set({ aiConsented: value === "true" });
    } catch {
      // Treat read failures as "not consented" so the prompt is shown rather
      // than silently skipped.
      set({ aiConsented: false });
    }
  },

  acceptAiConsent: async () => {
    set({ aiConsented: true });
    await storage.set(config.AI_CONSENT_KEY, "true").catch(() => {});
  },
}));

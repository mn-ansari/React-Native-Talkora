import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LanguageCode } from "@/types/learning";

type LanguageStore = {
  selectedLanguageCode: LanguageCode | null;
  hasHydrated: boolean;
  setSelectedLanguage: (languageCode: LanguageCode) => void;
  clearSelectedLanguage: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

type PersistedLanguageState = Pick<
  LanguageStore,
  "selectedLanguageCode"
>;

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      selectedLanguageCode: null,
      hasHydrated: false,
      setSelectedLanguage: (selectedLanguageCode) =>
        set({ selectedLanguageCode }),
      clearSelectedLanguage: () => set({ selectedLanguageCode: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "talkora-language",
      storage: createJSONStorage<PersistedLanguageState>(() => AsyncStorage),
      partialize: (state): PersistedLanguageState => ({
        selectedLanguageCode: state.selectedLanguageCode,
      }),
      onRehydrateStorage: (state) => () => state.setHasHydrated(true),
    },
  ),
);

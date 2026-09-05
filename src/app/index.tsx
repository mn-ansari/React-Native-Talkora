import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

import { useLanguageStore } from "@/store/language-store";

/**
 * Routes the learner through auth and language selection into the main tabs.
 */
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const hasLanguageStoreHydrated = useLanguageStore(
    (state) => state.hasHydrated,
  );
  if (!isLoaded || !hasLanguageStoreHydrated) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageCode) {
    return <Redirect href="/language-selection" />;
  }

  return <Redirect href="./home" />;
}

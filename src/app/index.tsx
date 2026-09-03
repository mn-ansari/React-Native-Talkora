import AsyncStorage from "@react-native-async-storage/async-storage";
import { useClerk, useUser } from "@clerk/expo";
import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { AppText } from "@/components/app-text";
import { useLanguageStore } from "@/store/language-store";

/**
 * Landing screen that displays the app name and a link to onboarding.
 * @returns The index/landing screen component
 */
export default function Index() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const hasLanguageStoreHydrated = useLanguageStore(
    (state) => state.hasHydrated,
  );
  const clearSelectedLanguage = useLanguageStore(
    (state) => state.clearSelectedLanguage,
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isClearingStorage, setIsClearingStorage] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/onboarding");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleClearStorage = async () => {
    if (isClearingStorage) {
      return;
    }

    setIsClearingStorage(true);

    try {
      await AsyncStorage.clear();
      clearSelectedLanguage();
    } finally {
      setIsClearingStorage(false);
    }
  };

  if (!isLoaded || !hasLanguageStoreHydrated) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageCode) {
    return <Redirect href="/language-selection" />;
  }

  const displayName =
    user.fullName?.trim() ||
    user.firstName?.trim() ||
    user.primaryEmailAddress?.emailAddress ||
    "Talkora learner";

  return (
    <View className="layout--screen items-center justify-center">
      <AppText variant="h1" className="text-talkora-deep-purple">
        {displayName}
      </AppText>
      <Link href="/language-selection" asChild>
        <TouchableOpacity
          activeOpacity={0.86}
          accessibilityRole="link"
          accessibilityLabel="Choose a language"
          className="mt-md h-12 items-center justify-center rounded-full bg-talkora-deep-purple px-xl shadow-raised"
        >
          <AppText className="font-poppins-semibold text-white">
            Choose a language
          </AppText>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel="Clear async storage"
        disabled={isClearingStorage}
        onPress={() => void handleClearStorage()}
        className="mt-md h-12 items-center justify-center rounded-full bg-talkora-deep-purple px-xl shadow-raised"
      >
        <AppText className="font-poppins-semibold text-white">
          {isClearingStorage ? "Clearing..." : "Clear Async Storage"}
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        disabled={isSigningOut}
        onPress={() => void handleSignOut()}
        className="mt-md h-12 items-center justify-center rounded-full bg-talkora-deep-purple px-xl shadow-raised"
      >
        <AppText className="font-poppins-semibold text-white">
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

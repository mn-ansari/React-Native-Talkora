


import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";

import { ClerkSSOProvider } from "@/components/clerk-sso-provider";
import { useLanguageStore } from "@/store/language-store";
import { colors, fontAssets } from "@/theme";
import { View } from "@/tw";
import "../global.css";

if (__DEV__) {
  LogBox.ignoreLogs([
    "Clerk: Clerk has been loaded with development keys.",
  ]);
}

void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error(
    "Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the project .env file.",
  );
}

type RootNavigatorProps = {
  fontsReady: boolean;
};

function RootNavigator({ fontsReady }: RootNavigatorProps) {
  const { isLoaded: isAuthLoaded } = useAuth();
  const hasLanguageStoreHydrated = useLanguageStore(
    (state) => state.hasHydrated,
  );

  useEffect(() => {
    if (fontsReady && isAuthLoaded && hasLanguageStoreHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady, hasLanguageStoreHydrated, isAuthLoaded]);

  if (!fontsReady || !isAuthLoaded || !hasLanguageStoreHydrated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.neutral.background },
        headerShown: false,
      }}
    />
  );
}

/**
 * Loads app fonts and provides Clerk authentication to the root navigator.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  if (fontError) {
    throw fontError;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkSSOProvider>
        <RootNavigator fontsReady={fontsLoaded} />
      </ClerkSSOProvider>
      <View nativeID="clerk-captcha" />
    </ClerkProvider>
  );
}

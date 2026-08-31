import { useClerk, useUser } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { AppText } from "@/components/app-text";

/**
 * Landing screen that displays the app name and a link to onboarding.
 * @returns The index/landing screen component
 */
export default function Index() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
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

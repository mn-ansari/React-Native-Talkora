import { useAuth } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { AppText } from "@/components/app-text";
import { useClerkSSO } from "@/components/clerk-sso-provider";
import { TouchableOpacity, View } from "@/tw";

const CALLBACK_TIMEOUT_MS = 20000;

export default function SSOCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { errorMessage, resetGoogleSSO, status } = useClerkSSO();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (status !== "pending") {
      return;
    }

    const timeout = setTimeout(() => {
      setHasTimedOut(true);
    }, CALLBACK_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [status]);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/" />;
  }

  const callbackFailed =
    status === "error" || status === "cancelled" || status === "idle" || hasTimedOut;

  const retry = () => {
    resetGoogleSSO();
    router.replace("/sign-in");
  };

  return (
    <View className="layout--screen items-center justify-center px-lg">
      {callbackFailed ? (
        <View className="will-change-variable w-full max-w-[420px] items-center gap-md rounded-[24px] bg-white p-lg shadow-card">
          <AppText className="text-center text-[20px] font-poppins-semibold text-content-primary">
            Google sign in failed
          </AppText>
          <AppText className="text-center text-content-secondary">
            {errorMessage ??
              (hasTimedOut
                ? "The Google callback reached Talkora, but Clerk did not finish the session. Confirm duallango://sso-callback is in Clerk's mobile SSO redirect allowlist."
                : "The Google sign-in session was interrupted. Please try again.")}
          </AppText>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.84}
            className="h-[54px] w-full items-center justify-center rounded-full bg-[#6337F4]"
            onPress={retry}
          >
            <AppText className="font-poppins-semibold text-white">
              Try again
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="will-change-variable items-center gap-sm">
          <ActivityIndicator color="#6337F4" size="large" />
          <AppText className="text-center text-content-secondary">
            Finishing Google sign in...
          </AppText>
        </View>
      )}
    </View>
  );
}

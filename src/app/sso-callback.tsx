import {
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useSignUp,
} from "@clerk/expo";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";

import { AppText } from "@/components/app-text";
import { waitForBrowserSSO } from "@/lib/sso-flow";
import { TouchableOpacity, View } from "@/tw";

const CALLBACK_WAIT_TIMEOUT_MS = 10000;

function getCallbackErrorMessage(error: unknown) {
  if (isClerkAPIResponseError(error)) {
    return (
      error.errors[0]?.longMessage ??
      error.errors[0]?.message ??
      "Google sign in could not be completed."
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Google sign in could not be completed.";
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SSOCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { client, setActive } = useClerk();
  const { signUp } = useSignUp();
  const params = useLocalSearchParams<{
    rotating_token_nonce?: string | string[];
  }>();
  const hasStarted = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || isSignedIn || hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    const rotatingTokenNonce = getParam(params.rotating_token_nonce);

    const finishGoogleSignIn = async () => {
      // Only one owner may redeem Clerk's rotating nonce. Wait for useSSO to
      // finish first, then handle the callback only when Android dismissed
      // the auth-session promise before it received the deep link.
      const ssoResult = await waitForBrowserSSO(CALLBACK_WAIT_TIMEOUT_MS);

      if (client.lastActiveSessionId) {
        router.replace("/");
        return;
      }

      if (ssoResult.status === "pending") {
        setErrorMessage(
          "Google sign in took too long to finish. Go back and try again.",
        );
        return;
      }

      if (ssoResult.status === "error") {
        setErrorMessage(
          ssoResult.errorMessage ?? "Google sign in could not be completed.",
        );
        return;
      }

      if (ssoResult.status === "success") {
        setErrorMessage(
          "Google sign in completed, but Clerk did not activate the session. Please try again.",
        );
        return;
      }

      if (!rotatingTokenNonce) {
        setErrorMessage(
          "Clerk did not return a secure Google callback. Add duallango://sso-callback to Clerk Dashboard > Redirect URLs, then try again.",
        );
        return;
      }

      try {
        const currentSignIn = (
          await client.signIn.reload({ rotatingTokenNonce })
        ).__internal_future;
        const shouldCreateUser =
          currentSignIn.firstFactorVerification.status === "transferable";

        if (shouldCreateUser) {
          const { error } = await signUp.create({ transfer: true });

          if (error) {
            throw error;
          }
        }

        const ssoResource = shouldCreateUser ? signUp : currentSignIn;

        if (ssoResource.createdSessionId) {
          const { error } = await ssoResource.finalize();

          if (error) {
            throw error;
          }
        } else if (ssoResource.existingSession) {
          await setActive({
            session: ssoResource.existingSession.sessionId,
          });
        } else {
          throw new Error(
            "Clerk needs additional account information to finish Google sign in.",
          );
        }

        router.replace("/");
      } catch (error) {
        setErrorMessage(getCallbackErrorMessage(error));
      }
    };

    void finishGoogleSignIn();
  }, [client, isLoaded, isSignedIn, params.rotating_token_nonce, setActive, signUp]);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <View className="layout--screen items-center justify-center px-lg">
      {errorMessage ? (
        <View
          key="callback-error"
          className="will-change-variable w-full max-w-[420px] items-center gap-md rounded-[24px] bg-white p-lg shadow-card"
        >
          <AppText className="text-center text-[20px] font-poppins-semibold text-content-primary">
            Google sign in failed
          </AppText>
          <AppText className="text-center text-content-secondary">
            {errorMessage}
          </AppText>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.84}
            className="h-[54px] w-full items-center justify-center rounded-full bg-[#6337F4]"
            onPress={() => router.replace("/sign-in")}
          >
            <AppText className="font-poppins-semibold text-white">
              Try again
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          key="callback-loading"
          className="will-change-variable items-center gap-sm"
        >
          <ActivityIndicator color="#6337F4" size="large" />
          <AppText className="text-center text-content-secondary">
            Finishing Google sign in...
          </AppText>
        </View>
      )}
    </View>
  );
}

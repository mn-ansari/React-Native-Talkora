import { isClerkAPIResponseError } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import * as AuthSession from "expo-auth-session";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type GoogleSSOStatus =
  | "idle"
  | "pending"
  | "success"
  | "cancelled"
  | "error";

type GoogleSSOResult = {
  errorMessage: string | null;
  status: Exclude<GoogleSSOStatus, "idle" | "pending">;
};

type ClerkSSOContextValue = {
  errorMessage: string | null;
  resetGoogleSSO: () => void;
  startGoogleSSO: () => Promise<GoogleSSOResult>;
  status: GoogleSSOStatus;
};

const googleRedirectUrl = AuthSession.makeRedirectUri({
  path: "sso-callback",
  scheme: "duallango",
});

const ClerkSSOContext = createContext<ClerkSSOContextValue | null>(null);

function getSSOErrorMessage(error: unknown) {
  if (isClerkAPIResponseError(error)) {
    return (
      error.errors[0]?.longMessage ??
      error.errors[0]?.message ??
      "Google authentication could not be completed."
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Google authentication could not be completed.";
}

/**
 * Owns the browser SSO promise above Expo Router so navigating to the callback
 * route cannot unmount the component that is completing the Clerk session.
 */
export function ClerkSSOProvider({ children }: PropsWithChildren) {
  const { startSSOFlow } = useSSO();
  const [status, setStatus] = useState<GoogleSSOStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetGoogleSSO = useCallback(() => {
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  const startGoogleSSO = useCallback(async (): Promise<GoogleSSOResult> => {
    setErrorMessage(null);
    setStatus("pending");

    try {
      const { authSessionResult, signUp } = await startSSOFlow({
        redirectUrl: googleRedirectUrl,
        strategy: "oauth_google",
      });

      if (signUp?.status === "missing_requirements") {
        const missingFields = [
          ...signUp.missingFields,
          ...signUp.unverifiedFields,
        ]
          .map((field) => field.replaceAll("_", " "))
          .join(", ");
        const message = missingFields
          ? `Google sign in still needs: ${missingFields}.`
          : "Google sign in needs additional profile information in Clerk.";

        setErrorMessage(message);
        setStatus("error");
        return { errorMessage: message, status: "error" };
      }

      if (authSessionResult?.type === "success") {
        setStatus("success");
        return { errorMessage: null, status: "success" };
      }

      setStatus("cancelled");
      return { errorMessage: null, status: "cancelled" };
    } catch (error) {
      const message = getSSOErrorMessage(error);

      setErrorMessage(message);
      setStatus("error");
      return { errorMessage: message, status: "error" };
    }
  }, [startSSOFlow]);

  const value = useMemo(
    () => ({ errorMessage, resetGoogleSSO, startGoogleSSO, status }),
    [errorMessage, resetGoogleSSO, startGoogleSSO, status],
  );

  return (
    <ClerkSSOContext.Provider value={value}>
      {children}
    </ClerkSSOContext.Provider>
  );
}

export function useClerkSSO() {
  const value = useContext(ClerkSSOContext);

  if (!value) {
    throw new Error("useClerkSSO must be used inside ClerkSSOProvider.");
  }

  return value;
}

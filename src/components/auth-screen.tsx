import {
  isClerkAPIResponseError,
  useAuth,
  useSignIn,
  useSignUp,
} from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { type Href, Redirect, router } from "expo-router";
import { useRef, useState } from "react";
import { Platform, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { beginBrowserSSO, completeBrowserSSO } from "@/lib/sso-flow";
import { Text, TouchableOpacity, View } from "@/tw";

import { VerificationCodeModal } from "./verification-code-modal";

type AuthMode = "sign-in" | "sign-up";

type AuthScreenProps = {
  mode: AuthMode;
};

const socialProviders = ["Google", "Facebook", "Apple"] as const;

/**
 * Renders a social provider icon/logo mark.
 * @param provider - The social provider name (Google, Facebook, or Apple)
 * @returns A styled icon representing the social provider
 */
type SocialProvider = (typeof socialProviders)[number];
type VerificationStage = "sign-in" | "sign-in-mfa" | "sign-up";

const socialStrategies: Partial<Record<SocialProvider, "oauth_google">> = {
  Google: "oauth_google",
};

const ssoRedirectUrl = AuthSession.makeRedirectUri({
  path: "sso-callback",
  scheme: "duallango",
});

function getClerkErrorMessage(error: unknown, fallback: string) {
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.longMessage ?? error.errors[0]?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function SocialMark({ provider }: { provider: SocialProvider }) {
  if (provider === "Facebook") {
    return (
      <View className="h-7 w-7 items-center justify-end rounded-full bg-[#1877F2]">
        <Text className="font-poppins-bold text-[23px] leading-[29px] text-white">
          f
        </Text>
      </View>
    );
  }

  if (provider === "Apple") {
    return (
      <View className="h-8 w-8 items-center justify-center">
        <View className="h-[22px] w-[24px] rounded-[9px] bg-black" />
        <View className="absolute right-[5px] top-[1px] h-[8px] w-[5px] -rotate-45 rounded-full bg-black" />
      </View>
    );
  }

  return (
    <View className="h-8 w-8 items-center justify-center rounded-full border-[4px] border-[#4285F4]">
      <View className="absolute -bottom-[4px] left-[2px] h-[7px] w-[9px] bg-[#34A853]" />
      <View className="absolute -left-[4px] top-[1px] h-[8px] w-[7px] bg-[#FBBC05]" />
      <View className="absolute -right-[4px] top-[1px] h-[8px] w-[7px] bg-[#EA4335]" />
      <Text className="font-poppins-bold text-[14px] leading-[18px] text-[#4285F4]">
        G
      </Text>
    </View>
  );
}

/**
 * Authentication screen that handles both sign-in and sign-up flows.
 * Includes email/password fields, social provider options, and email verification.
 * @param mode - Whether to render sign-in or sign-up UI
 * @returns The authentication screen component
 */
export function AuthScreen({ mode }: AuthScreenProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [verificationStage, setVerificationStage] =
    useState<VerificationStage | null>(null);
  const isSignUp = mode === "sign-up";
  const isSubmitting =
    signInFetchStatus === "fetching" ||
    signUpFetchStatus === "fetching" ||
    isSocialLoading;

  const title = isSignUp ? "Create your account" : "Welcome back";
  const subtitle = isSignUp
    ? "Start your language journey today ✨"
    : "Continue your language journey ✨";
  const actionLabel = isSignUp ? "Sign Up" : "Sign In";

  const navigateAfterAuth = ({
    session,
    decorateUrl,
  }: Parameters<
    NonNullable<
      NonNullable<Parameters<typeof signIn.finalize>[0]>["navigate"]
    >
  >[0]) => {
    if (session?.currentTask) {
      setVerificationStage(null);
      setFormError("Your account needs an additional security step in Clerk.");
      return;
    }

    setVerificationStage(null);
    const destination = decorateUrl("/");

    if (destination.startsWith("http")) {
      if (Platform.OS === "web") {
        window.location.assign(destination);
      }
      return;
    }

    router.replace(destination as Href);
  };

  const finalizeSignIn = async (): Promise<true | string> => {
    if (signIn.status !== "complete") {
      return "Clerk needs another verification step before signing you in.";
    }

    const { error } = await signIn.finalize({ navigate: navigateAfterAuth });

    if (error) {
      return getClerkErrorMessage(error, "We couldn't finish signing you in.");
    }

    return true;
  };

  const finalizeSignUp = async (): Promise<true | string> => {
    if (signUp.status !== "complete") {
      return "Clerk needs more account information before finishing sign up.";
    }

    const { error } = await signUp.finalize({ navigate: navigateAfterAuth });

    if (error) {
      return getClerkErrorMessage(error, "We couldn't finish creating your account.");
    }

    return true;
  };

  const handleEmailSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setFormError("Enter your email address to continue.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (isSignUp && password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setEmail(normalizedEmail);
    setFormError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp.password({
          emailAddress: normalizedEmail,
          password,
        });

        if (error) {
          setFormError(
            getClerkErrorMessage(error, "We couldn't create your account."),
          );
          return;
        }

        const { error: sendError } =
          await signUp.verifications.sendEmailCode();

        if (sendError) {
          setFormError(
            getClerkErrorMessage(
              sendError,
              "We couldn't send your verification code.",
            ),
          );
          return;
        }

        setVerificationStage("sign-up");
        return;
      }

      const { error } = await signIn.emailCode.sendCode({
        emailAddress: normalizedEmail,
      });

      if (error) {
        setFormError(
          getClerkErrorMessage(error, "We couldn't send your sign-in code."),
        );
        return;
      }

      setVerificationStage("sign-in");
    } catch (error) {
      setFormError(
        getClerkErrorMessage(error, "Authentication is unavailable right now."),
      );
    }
  };

  const verifyCode = async (code: string): Promise<true | string> => {
    if (verificationStage === "sign-up") {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        return getClerkErrorMessage(error, "That verification code is incorrect.");
      }

      return finalizeSignUp();
    }

    if (verificationStage === "sign-in-mfa") {
      const { error } = await signIn.mfa.verifyEmailCode({ code });

      if (error) {
        return getClerkErrorMessage(error, "That verification code is incorrect.");
      }

      return finalizeSignIn();
    }

    const { error } = await signIn.emailCode.verifyCode({ code });

    if (error) {
      return getClerkErrorMessage(error, "That verification code is incorrect.");
    }

    if (signIn.status === "complete") {
      return finalizeSignIn();
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const supportsEmailCode = signIn.supportedSecondFactors.some(
        (factor) => factor.strategy === "email_code",
      );

      if (supportsEmailCode) {
        const { error: sendError } = await signIn.mfa.sendEmailCode();

        if (sendError) {
          return getClerkErrorMessage(
            sendError,
            "We couldn't send the additional verification code.",
          );
        }

        setVerificationStage("sign-in-mfa");
        return true;
      }

      return "This account needs another verification method that isn't available on this screen.";
    }

    return "Clerk needs another verification step before signing you in.";
  };

  const resendCode = async () => {
    let error: unknown = null;

    if (verificationStage === "sign-up") {
      ({ error } = await signUp.verifications.sendEmailCode());
    } else if (verificationStage === "sign-in-mfa") {
      ({ error } = await signIn.mfa.sendEmailCode());
    } else {
      ({ error } = await signIn.emailCode.sendCode());
    }

    return error
      ? getClerkErrorMessage(error, "We couldn't resend the code.")
      : null;
  };

  const closeVerification = () => {
    if (verificationStage === "sign-up") {
      signUp.reset();
    } else {
      signIn.reset();
    }

    setVerificationStage(null);
  };

  const handleSocialAuth = async (provider: SocialProvider) => {
    if (isSubmitting) {
      return;
    }

    setFormError(null);
    const strategy = socialStrategies[provider];

    if (!strategy) {
      setFormError(`${provider} sign in isn't enabled in Clerk yet.`);
      return;
    }

    setIsSocialLoading(true);
    beginBrowserSSO();

    try {
      const { authSessionResult, createdSessionId, signUp: socialSignUp } =
        await startSSOFlow({
          redirectUrl: ssoRedirectUrl,
          strategy,
        });

      if (socialSignUp?.status === "missing_requirements") {
        const missingFields = socialSignUp.missingFields
          .map((field) => field.replaceAll("_", " "))
          .join(", ");
        const message = missingFields
          ? `${provider} sign in still needs: ${missingFields}.`
          : `${provider} sign in needs additional profile information in Clerk.`;
        completeBrowserSSO("error", message);
        setFormError(message);
        return;
      }

      if (createdSessionId || authSessionResult?.type === "success") {
        completeBrowserSSO("success");
        router.replace("/");
        return;
      }

      completeBrowserSSO("cancelled");
    } catch (error) {
      const message = getClerkErrorMessage(
        error,
        `${provider} authentication couldn't be completed.`,
      );
      completeBrowserSSO("error", message);
      setFormError(message);
    } finally {
      setIsSocialLoading(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FCFCFF" }}>
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute -left-[150px] top-[270px] h-[420px] w-[270px] rotate-[-18deg] rounded-[100px] bg-[#EEF0FF]" />
        <View className="absolute -right-[160px] top-[50px] h-[390px] w-[390px] rounded-full bg-[#F7F5FF] opacity-70" />
      </View>

      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-[36px] pb-[24px] pt-[10px]">
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="-ml-[14px] h-[48px] w-[48px] items-center justify-center rounded-[14px] border border-[#E0E2EE] bg-white/80"
          >
            <Text className="mt-[-3px] font-poppins-medium text-[42px] leading-[45px] text-[#081044]">
              ‹
            </Text>
          </TouchableOpacity>

          <View className="items-center pt-[15px]">
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.88}
              numberOfLines={1}
              className="font-poppins-bold text-[30px] leading-[39px] tracking-[-0.7px] text-[#081044]"
            >
              {title}
            </Text>
            <Text className="pt-[3px] text-center font-poppins text-[16px] leading-[24px] text-[#6E7398]">
              {subtitle}
            </Text>
          </View>

          <View className="h-[210px] items-center justify-center">
            <Image
              accessibilityLabel="Talkora language tutor robot"
              contentFit="contain"
              source={images.authLogo}
              style={{ height: 232, width: 310 }}
            />
          </View>

          <View className="h-[66px] flex-row items-center rounded-[19px] border border-[#E2E3EE] bg-white px-[14px] shadow-card">
            <View className="h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[#F1ECFF]">
              <Text className="font-poppins-medium text-[22px] leading-[27px] text-[#693AF5]">
                ✉
              </Text>
            </View>
            <View className="min-w-0 flex-1 px-[13px]">
              <Text className="font-poppins text-[12px] leading-[16px] text-[#6E7398]">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  setFormError(null);
                }}
                onSubmitEditing={() => {
                  if (isSignUp) {
                    passwordInputRef.current?.focus();
                    return;
                  }

                  void handleEmailSubmit();
                }}
                placeholder="alex@gmail.com"
                placeholderTextColor="#131A47"
                returnKeyType={isSignUp ? "next" : "done"}
                style={{
                  color: "#081044",
                  fontFamily: "Poppins-Regular",
                  fontSize: 16,
                  height: 28,
                  lineHeight: 22,
                  padding: 0,
                }}
                value={email}
              />
            </View>
          </View>

          {isSignUp ? (
            <View className="mt-[10px] h-[66px] flex-row items-center rounded-[19px] border border-[#E2E3EE] bg-white px-[14px] shadow-card">
              <View className="h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[#F1ECFF]">
                <View className="mt-[5px] h-[16px] w-[16px] rounded-[3px] border-2 border-[#693AF5]">
                  <View className="absolute -top-[10px] left-[2px] h-[10px] w-[8px] rounded-t-full border-2 border-b-0 border-[#693AF5]" />
                  <View className="absolute left-[5px] top-[4px] h-[4px] w-[2px] rounded-full bg-[#693AF5]" />
                </View>
              </View>
              <View className="min-w-0 flex-1 px-[13px]">
                <Text className="font-poppins text-[12px] leading-[16px] text-[#6E7398]">
                  Password
                </Text>
                <TextInput
                  ref={passwordInputRef}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  onChangeText={(value) => {
                    setPassword(value);
                    setFormError(null);
                  }}
                  onSubmitEditing={() => void handleEmailSubmit()}
                  placeholder="••••••••"
                  placeholderTextColor="#131A47"
                  returnKeyType="done"
                  secureTextEntry={isPasswordHidden}
                  style={{
                    color: "#081044",
                    fontFamily: "Poppins-Regular",
                    fontSize: 16,
                    height: 28,
                    lineHeight: 22,
                    padding: 0,
                  }}
                  value={password}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={isPasswordHidden ? "Show password" : "Hide password"}
                onPress={() => setIsPasswordHidden((currentValue) => !currentValue)}
                className="h-[40px] w-[40px] items-center justify-center"
              >
                <View className="h-[15px] w-[24px] items-center justify-center rounded-[12px] border-2 border-[#73779A]">
                  <View className="h-[5px] w-[5px] rounded-full bg-[#73779A]" />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {formError ? (
            <Text
              accessibilityLiveRegion="polite"
              className="px-[4px] pt-[7px] font-poppins text-[12px] leading-[18px] text-error"
            >
              {formError}
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            disabled={isSubmitting}
            onPress={() => void handleEmailSubmit()}
            className="mt-[12px] h-[57px] items-center justify-center rounded-full bg-linear-to-r from-[#A33BFA] via-[#6F42F8] to-[#367DF7] shadow-overlay"
          >
            <Text className="font-poppins-semibold text-[19px] leading-[25px] text-white">
              {actionLabel}
            </Text>
          </TouchableOpacity>

          <View className="h-[48px] flex-row items-center gap-[14px]">
            <View className="h-px flex-1 bg-[#D9DAE6]" />
            <Text className="font-poppins text-[13px] leading-[20px] text-[#6E7398]">
              or continue with
            </Text>
            <View className="h-px flex-1 bg-[#D9DAE6]" />
          </View>

          <View className="gap-[10px]">
            {socialProviders.map((provider) => (
              <TouchableOpacity
                key={provider}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={`Continue with ${provider}`}
                disabled={isSubmitting}
                onPress={() => void handleSocialAuth(provider)}
                className="h-[53px] flex-row items-center rounded-[16px] border border-[#E2E3EE] bg-white px-[16px] shadow-card"
              >
                <View className="w-[38px] items-center">
                  <SocialMark provider={provider} />
                </View>
                <Text className="flex-1 pr-[38px] text-center font-poppins-medium text-[15px] leading-[21px] text-[#081044]">
                  Continue with {provider}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-1 justify-end pt-[19px]">
            <View className="flex-row items-center justify-center">
              <Text className="font-poppins text-[13px] leading-[20px] text-[#6E7398]">
                {isSignUp ? "Already have an account? " : "New to Talkora? "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                accessibilityRole="link"
                onPress={() => router.replace(isSignUp ? "/sign-in" : "/sign-up")}
              >
                <Text className="font-poppins-medium text-[13px] leading-[20px] text-[#6337F4]">
                  {isSignUp ? "Log in" : "Create account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {verificationStage ? (
        <VerificationCodeModal
          key={verificationStage}
          email={email}
          onClose={closeVerification}
          onResend={resendCode}
          onVerify={verifyCode}
        />
      ) : null}
    </SafeAreaView>
  );
}

import { useAuth } from "@clerk/expo";
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingFeatureCard } from "@/components/onboarding-feature-card";
import { images } from "@/constants/images";

const holaWaveformBarClasses = [
  "h-[8px]",
  "h-[15px]",
  "h-[11px]",
  "h-[19px]",
  "h-[13px]",
  "h-[7px]",
] as const;

const feedbackWaveformBarClasses = [
  "h-[7px]",
  "h-[11px]",
  "h-[16px]",
  "h-[12px]",
  "h-[20px]",
  "h-[15px]",
  "h-[10px]",
  "h-[13px]",
  "h-[8px]",
  "h-[5px]",
] as const;

/**
 * Onboarding screen that introduces users to Talkora's features.
 * Displays app branding, feature cards, and a call-to-action to sign up.
 * @returns The onboarding screen component
 */
export default function OnboardingScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9FF" }}>
      <StatusBar style="dark" />

      <View className="absolute inset-0 overflow-hidden">
        <Image
          source={images.logoGlow}
          resizeMode="contain"
          className="absolute -right-[190px] top-[100px] h-[430px] w-[430px] opacity-[0.08]"
        />
        <Image
          source={images.logoGlow}
          resizeMode="contain"
          className="absolute -left-[170px] bottom-[80px] h-[460px] w-[460px] opacity-[0.1]"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-[30px] pb-[22px] pt-[14px]">
          <View className="flex-row items-center gap-[10px]">
            <Image
              source={images.sidedWithText}
              resizeMode="contain"
              className="h-12 w-12"
            />
            <Text className="font-poppins-bold text-[28px] leading-[34px] text-[#111950]">
              Talkora
            </Text>
          </View>

          <View className="pt-[24px]">
            <Text className="font-poppins-bold text-[38px] leading-[46px] tracking-[-1px] text-[#081044]">
              Speak smarter,{"\n"}learn{" "}
              <Text className="font-poppins-bold text-[38px] leading-[46px] tracking-[-1px] text-[#6B3EF4]">
                naturally
              </Text>
              .
            </Text>

            <Text className="pt-[12px] font-poppins text-[16px] leading-[24px] text-[#68719A]">
              Your personal AI speaking partner.{"\n"}Practice real
              conversations and{"\n"}get instant feedback.
            </Text>
          </View>

          <View className="flex-row gap-[8px] pt-[20px]">
            <OnboardingFeatureCard
              icon="waveform"
              label={"Real\nconversations"}
            />
            <OnboardingFeatureCard
              icon="lightning"
              label={"Instant\nfeedback"}
            />
            <OnboardingFeatureCard
              icon="calendar"
              label={"Daily\npractice"}
            />
          </View>

          <View className="relative mt-[35px] h-[315px] items-center justify-center">
            <Image
              source={images.logoGlow}
              resizeMode="contain"
              className="absolute top-[-38px] h-[340px] w-[340px] opacity-[0.15]"
            />

            <View className="absolute top-[241px] h-[14px] w-[190px] rounded-full border border-[#BFCBFF]/70 bg-white/45" />
            <View className="absolute top-[235px] h-[15px] w-[135px] rounded-full bg-[#ECEBFF] shadow-card" />

            <Image
              source={images.moscotLogo}
              resizeMode="contain"
              className="absolute top-[-4px] z-[1] h-[238px] w-[238px]"
            />

            <View className="absolute left-[-2px] top-[124px] z-[2] h-[72px] w-[98px] -rotate-6 rounded-[16px] border border-white/90 bg-white/90 px-[12px] py-[9px] shadow-raised">
              <Text className="font-poppins-medium text-[15px] leading-[19px] text-[#14205B]">
                ¡Hola!
              </Text>
              <View className="flex-1 flex-row items-center gap-[2px] pt-[6px]">
                {holaWaveformBarClasses.map((heightClass, index) => (
                  <View
                    key={`${heightClass}-${index}`}
                    className={`w-[2px] rounded-full bg-[#8B51F7] ${heightClass}`}
                  />
                ))}
                <View className="ml-[4px] h-6 w-6 items-center justify-center rounded-full bg-[#8062F6]">
                  <Text className="pl-[2px] text-[10px] leading-[12px] text-white">
                    ▶
                  </Text>
                </View>
              </View>
            </View>

            <View className="absolute right-[-3px] top-[12px] z-[2] h-[78px] w-[112px] rotate-6 rounded-[16px] border border-white/90 bg-white/90 px-[11px] py-[9px] shadow-raised">
              <Text className="font-poppins-medium text-[12px] leading-[15px] text-[#7654EE]">
                Nice job!
              </Text>
              <Text className="pt-[1px] font-poppins text-[9px] leading-[12px] text-[#68719A]">
                Great pronunciation
              </Text>
              <View className="mt-[5px] h-px bg-[#EAE9F7]" />
              <View className="flex-row items-center gap-[2px] pt-[5px]">
                {feedbackWaveformBarClasses.map(
                  (heightClass, index) => (
                    <View
                      key={`${heightClass}-${index}`}
                      className={`w-[2px] rounded-full bg-[#9A58F2] ${heightClass}`}
                    />
                  ),
                )}
              </View>
            </View>

            <View className="absolute right-[2px] top-[166px] z-[2] h-[62px] w-[104px] rotate-6 rounded-[16px] border border-white/90 bg-white/90 px-[11px] py-[8px] shadow-raised">
              <Text className="font-poppins-semibold text-[16px] leading-[19px] text-[#111950]">
                你好!
              </Text>
              <View className="flex-row items-center justify-between pt-[2px]">
                <Text className="font-poppins text-[9px] leading-[12px] text-[#68719A]">
                  Nǐ hǎo!
                </Text>
                <View className="h-6 w-6 items-center justify-center rounded-full bg-[#8F42F2]">
                  <Text className="text-[10px] leading-[12px] text-white">
                    )))
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel="Get started"
            onPress={() => router.push("/sign-up")}
            className="h-[58px] flex-row items-center justify-center rounded-full bg-linear-to-r from-[#942BFF] via-[#7337F8] to-[#5138F2] shadow-overlay"
          >
            <Text className="font-poppins-semibold text-[19px] leading-[24px] text-white">
              Get Started
            </Text>
            <Text className="absolute right-[24px] font-poppins text-[32px] leading-[34px] text-white">
              →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

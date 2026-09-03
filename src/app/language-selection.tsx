import { useAuth } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { LanguageCard } from "@/components/language-card";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { useLanguageStore } from "@/store/language-store";
import type { LanguageCode } from "@/types/learning";

const learnerCounts: Record<LanguageCode, string> = {
  en: "34.8M learners",
  es: "28.4M learners",
  fr: "19.4M learners",
  ja: "12.7M learners",
};

const waveformBarHeights = [11, 18, 23, 16, 10] as const;

/**
 * Lets the learner search for, choose, and confirm a supported language.
 */
export default function LanguageSelectionScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const storedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const hasLanguageStoreHydrated = useLanguageStore(
    (state) => state.hasHydrated,
  );
  const setSelectedLanguage = useLanguageStore(
    (state) => state.setSelectedLanguage,
  );
  const [query, setQuery] = useState("");
  const [selectedLanguageCode, setSelectedLanguageCode] =
    useState<LanguageCode>(
      storedLanguageCode ?? languages[0]?.code ?? "es",
    );

  const visibleLanguages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return languages;
    }

    return languages.filter((language) =>
      [language.name, language.nativeName, language.code].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query]);

  const selectedLanguage =
    languages.find((language) => language.code === selectedLanguageCode) ??
    languages[0];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  const handleConfirm = () => {
    setSelectedLanguage(selectedLanguageCode);
    router.replace("/");
  };

  if (!isLoaded || !hasLanguageStoreHydrated) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FCFCFF" }}>
      <StatusBar style="dark" />

      <View className="absolute inset-0 overflow-hidden">
        <View style={styles.backgroundWave} />
        <View className="absolute right-[116px] top-[88px] h-[18px] w-[18px] items-center justify-center">
          <View style={styles.sparkleVertical} />
          <View style={styles.sparkleHorizontal} />
        </View>
        <View className="absolute right-[45px] top-[137px] h-[22px] w-[22px] items-center justify-center">
          <View style={styles.sparkleVerticalLarge} />
          <View style={styles.sparkleHorizontalLarge} />
        </View>
      </View>

      <View className="flex-1 px-[22px] pt-[3px]">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              activeOpacity={0.72}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={8}
              onPress={handleBack}
              className="items-center justify-center"
              style={styles.backButton}
            >
              <View style={styles.chevronLeft} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-[9px] pr-[1px]">
              <View
                className="relative flex-row items-center justify-center gap-[2px]"
                style={styles.logoMark}
              >
                {waveformBarHeights.map((height, index) => (
                  <View
                    key={`${height}-${index}`}
                    style={[styles.waveformBar, { height }]}
                  />
                ))}
                <View style={styles.logoTail} />
              </View>
              <Text className="font-poppins-bold text-[21px] leading-[27px] text-[#0A1244]">
                Talkora
              </Text>
            </View>
          </View>

          <View className="pt-[18px]">
            <AppText
              variant="h1"
              adjustsFontSizeToFit
              minimumFontScale={0.88}
              numberOfLines={1}
              className="tracking-[-0.8px] text-[#081044]"
            >
              Choose a language
            </AppText>
            <AppText
              variant="bodyLarge"
              className="max-w-[330px] pt-[3px] text-[#626B98]"
            >
              Pick the language you want to start practicing today.
            </AppText>
          </View>

          <View
            className="mt-[9px] h-[48px] flex-row items-center px-[17px]"
            style={styles.searchBar}
          >
            <View className="relative mr-[13px] h-[24px] w-[24px]">
              <View style={styles.searchCircle} />
              <View style={styles.searchHandle} />
            </View>
            <TextInput
              accessibilityLabel="Search languages"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search languages"
              placeholderTextColor="#7A81A5"
              returnKeyType="search"
              style={{
                color: "#0A1244",
                flex: 1,
                fontFamily: "Poppins-Regular",
                fontSize: 16,
                height: 40,
                lineHeight: 22,
                padding: 0,
              }}
              value={query}
            />
          </View>

          <Text className="pb-[2px] pt-[17px] font-poppins-semibold text-[20px] leading-[26px] text-[#081044]">
            Popular
          </Text>

          <FlatList
            accessibilityRole="radiogroup"
            bounces={visibleLanguages.length > 3}
            contentContainerStyle={
              visibleLanguages.length === 0
                ? styles.languageListEmptyContent
                : styles.languageListContent
            }
            data={visibleLanguages}
            indicatorStyle="default"
            keyboardShouldPersistTaps="handled"
            keyExtractor={(language) => language.id}
            persistentScrollbar
            renderItem={({ item: language }) => (
              <LanguageCard
                language={language}
                learnerCount={learnerCounts[language.code]}
                onPress={() => setSelectedLanguageCode(language.code)}
                selected={language.code === selectedLanguageCode}
              />
            )}
            showsVerticalScrollIndicator
            style={styles.languageList}
            ListEmptyComponent={
              <View className="surface--card h-[82px] items-center justify-center">
                <Text className="font-poppins text-[14px] leading-[22px] text-content-secondary">
                  No languages found.
                </Text>
              </View>
            }
          />

          <TouchableOpacity
            activeOpacity={0.86}
            accessibilityHint="Returns to the home screen"
            accessibilityLabel={`Confirm ${selectedLanguage?.name ?? "language"}`}
            accessibilityRole="button"
            onPress={handleConfirm}
            className="mt-[14px] h-[52px] flex-row items-center justify-center px-[22px]"
            style={styles.confirmButton}
          >
            <View
              className="absolute left-[18px] items-center justify-center"
              style={styles.confirmCheckCircle}
            >
              <View style={styles.confirmCheckMark} />
            </View>
            <Text className="font-poppins-semibold text-[16px] leading-[22px] text-white">
              Confirm language
            </Text>
            <View
              className="absolute right-[23px]"
              style={styles.confirmChevron}
            />
          </TouchableOpacity>

          <View
            pointerEvents="none"
            className="-mx-[22px] mt-[4px] h-[280px] items-center overflow-hidden"
          >
            <Image
              accessibilityLabel="Illustrated globe with international landmarks and speech bubbles"
              resizeMode="contain"
              source={images.languageWorld}
              className="-mt-[43px] h-[400px] w-[430px]"
            />
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundWave: {
    position: "absolute",
    top: 54,
    right: -104,
    width: 330,
    height: 255,
    borderRadius: 180,
    backgroundColor: "#F1F0FF",
    opacity: 0.85,
    transform: [{ rotate: "-12deg" }],
  },
  backButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: "#ECECF5",
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 6px 18px rgba(13, 19, 43, 0.10)",
  },
  chevronLeft: {
    width: 11,
    height: 11,
    marginLeft: 4,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#111950",
    transform: [{ rotate: "135deg" }],
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#654FF6",
  },
  waveformBar: {
    width: 2,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  logoTail: {
    position: "absolute",
    right: 2,
    bottom: -1,
    width: 7,
    height: 7,
    backgroundColor: "#654FF6",
    transform: [{ rotate: "45deg" }],
  },
  sparkleVertical: {
    position: "absolute",
    width: 2,
    height: 15,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  sparkleHorizontal: {
    position: "absolute",
    width: 15,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  sparkleVerticalLarge: {
    position: "absolute",
    width: 2,
    height: 19,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  sparkleHorizontalLarge: {
    position: "absolute",
    width: 19,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    borderWidth: 1,
    borderColor: "#E1E3ED",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 14px rgba(13, 19, 43, 0.08)",
  },
  searchCircle: {
    position: "absolute",
    top: 1,
    left: 1,
    width: 17,
    height: 17,
    borderWidth: 2,
    borderColor: "#737AA1",
    borderRadius: 9,
  },
  searchHandle: {
    position: "absolute",
    top: 17,
    left: 16,
    width: 9,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#737AA1",
    transform: [{ rotate: "45deg" }],
  },
  languageList: {
    flexGrow: 0,
    height: 205,
    marginHorizontal: -4,
  },
  languageListContent: {
    gap: 7,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  languageListEmptyContent: {
    flexGrow: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  confirmButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#6547F5",
    boxShadow: "0 10px 24px rgba(91, 59, 246, 0.24)",
  },
  confirmCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  confirmCheckMark: {
    width: 7,
    height: 12,
    marginTop: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
  confirmChevron: {
    width: 9,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "-45deg" }],
  },
});

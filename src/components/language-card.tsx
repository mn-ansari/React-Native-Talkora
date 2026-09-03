import type { SupportedLanguage } from "@/types/learning";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type LanguageCardProps = {
  language: SupportedLanguage;
  learnerCount: string;
  onPress: () => void;
  selected: boolean;
};

function LanguageFlag({ language }: { language: SupportedLanguage }) {
  if (language.code === "en") {
    return (
      <View style={styles.flagShell}>
        <View style={styles.usaFlag}>
          {Array.from({ length: 7 }, (_, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.usaRedStripe : styles.usaWhiteStripe}
            />
          ))}
          <View style={styles.usaBlue} />
        </View>
      </View>
    );
  }

  if (language.code === "es") {
    return (
      <View style={styles.flagShell}>
        <View style={styles.spainRed}>
          <View style={styles.spainYellow} />
        </View>
      </View>
    );
  }

  if (language.code === "fr") {
    return (
      <View style={[styles.flagShell, styles.flagRow]}>
        <View style={styles.franceBlue} />
        <View style={styles.franceWhite} />
        <View style={styles.franceRed} />
      </View>
    );
  }

  return (
    <View
      style={styles.flagShell}
      className="items-center justify-center bg-white"
    >
      <View style={styles.japanCircle} />
    </View>
  );
}

/**
 * Displays a selectable language option with its flag and learner count.
 */
export function LanguageCard({
  language,
  learnerCount,
  onPress,
  selected,
}: LanguageCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      accessibilityLabel={`${language.name}, ${learnerCount}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="relative flex-row items-center px-[14px]"
      style={[styles.card, selected && styles.selectedCard]}
    >
      <LanguageFlag language={language} />

      <View className="min-w-0 flex-1 px-[14px]">
        <Text
          numberOfLines={1}
          className={`text-[#0A1244] ${
            selected
              ? "font-poppins-semibold text-[20px] leading-[26px]"
              : "font-poppins-medium text-[16px] leading-[22px]"
          }`}
        >
          {language.name}
        </Text>
        <Text
          numberOfLines={1}
          className="font-poppins text-[14px] leading-[20px] text-[#697198]"
        >
          {learnerCount}
        </Text>
      </View>

      {selected ? (
        <View style={styles.checkCircle} className="items-center justify-center">
          <View style={styles.checkMark} />
        </View>
      ) : (
        <View style={styles.chevronRight} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: "#E8E9F2",
    borderRadius: 18,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 3px 12px rgba(13, 19, 43, 0.07)",
  },
  selectedCard: {
    minHeight: 62,
    borderWidth: 2,
    borderColor: "#6C4EF5",
    backgroundColor: "#F0EDFF",
    boxShadow: "0 5px 16px rgba(108, 78, 245, 0.18)",
  },
  flagShell: {
    width: 38,
    height: 38,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ECECF3",
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(13, 19, 43, 0.10)",
  },
  spainRed: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#E5001A",
  },
  spainYellow: {
    height: "50%",
    backgroundColor: "#FFD21A",
  },
  flagRow: {
    flexDirection: "row",
  },
  usaFlag: {
    flex: 1,
  },
  usaRedStripe: {
    flex: 1,
    backgroundColor: "#D9272E",
  },
  usaWhiteStripe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  usaBlue: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "55%",
    height: "57%",
    backgroundColor: "#25418A",
  },
  franceBlue: {
    flex: 1,
    backgroundColor: "#123B92",
  },
  franceWhite: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  franceRed: {
    flex: 1,
    backgroundColor: "#ED1C2E",
  },
  japanCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E60012",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6547F5",
    boxShadow: "0 5px 12px rgba(91, 59, 246, 0.28)",
  },
  checkMark: {
    width: 8,
    height: 14,
    marginTop: -3,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
  chevronRight: {
    width: 10,
    height: 10,
    marginRight: 5,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#5C648E",
    transform: [{ rotate: "-45deg" }],
  },
});

import { Text, View } from "react-native";

type FeatureIcon = "calendar" | "lightning" | "waveform";

type OnboardingFeatureCardProps = {
  icon: FeatureIcon;
  label: string;
};

const waveformBarClasses = [
  "h-[8px]",
  "h-[14px]",
  "h-[20px]",
  "h-[14px]",
  "h-[8px]",
] as const;

function FeatureIconGraphic({ icon }: { icon: FeatureIcon }) {
  if (icon === "waveform") {
    return (
      <View className="h-5 flex-row items-center gap-[2px]">
        {waveformBarClasses.map((heightClass, index) => (
          <View
            key={`${heightClass}-${index}`}
            className={`w-[2px] rounded-full bg-white ${heightClass}`}
          />
        ))}
      </View>
    );
  }

  if (icon === "calendar") {
    return (
      <View className="h-[18px] w-5 rounded-[4px] border-2 border-white px-[3px] pt-[5px]">
        <View className="h-[2px] w-full rounded-full bg-white" />
        <View className="absolute -top-[3px] left-[3px] h-[5px] w-[2px] rounded-full bg-white" />
        <View className="absolute -top-[3px] right-[3px] h-[5px] w-[2px] rounded-full bg-white" />
      </View>
    );
  }

  return (
    <Text className="font-poppins-bold text-[22px] leading-[24px] text-white">
      ⚡
    </Text>
  );
}

export function OnboardingFeatureCard({
  icon,
  label,
}: OnboardingFeatureCardProps) {
  return (
    <View className="h-[54px] min-w-0 flex-1 flex-row items-center gap-[7px] rounded-[16px] border border-white/80 bg-white/75 px-[8px] shadow-card">
      <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#54A7FF] via-[#6B62F7] to-[#A333F0]">
        <FeatureIconGraphic icon={icon} />
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={2}
        className="min-w-0 flex-1 font-poppins-medium text-[11px] leading-[14px] text-[#111950]"
      >
        {label}
      </Text>
    </View>
  );
}

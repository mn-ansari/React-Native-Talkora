import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { AppText } from "@/components/app-text";

type TabPlaceholderScreenProps = {
  title: string;
};

/**
 * Temporary tab content used until each Talkora feature is implemented.
 */
export function TabPlaceholderScreen({ title }: TabPlaceholderScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#FCFCFF] px-lg">
      <StatusBar style="dark" />
      <AppText variant="h2" className="text-[#0D132B]">
        {title}
      </AppText>
      <AppText variant="bodySmall" className="pt-xs text-[#6B7280]">
        Coming soon
      </AppText>
    </View>
  );
}

import { View } from "react-native";

import { AppText } from "@/components/app-text";

export default function Index() {
  return (
    <View className="layout--screen items-center justify-center gap-sm">
      <AppText variant="h1" className="text-lingua-deep-purple">
        Lingua
      </AppText>
      <AppText variant="bodyMedium" className="text-center text-content-secondary">
        Your language-learning journey starts here.
      </AppText>
    </View>
  );
}

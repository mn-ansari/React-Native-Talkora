import { Link } from "expo-router";
import { TouchableOpacity, View } from "react-native";

import { AppText } from "@/components/app-text";

export default function Index() {
  return (
    <View className="layout--screen items-center justify-center gap-sm">
      <AppText variant="h1" className="text-talkora-deep-purple">
        Talkora
      </AppText>
      <AppText variant="bodyMedium" className="text-center text-content-secondary">
        Your language-learning journey starts here.
      </AppText>
      <Link href="/onboarding" asChild>
        <TouchableOpacity
          activeOpacity={0.86}
          className="mt-md h-12 items-center justify-center rounded-full bg-talkora-deep-purple px-xl shadow-raised"
        >
          <AppText className="font-poppins-semibold text-white">
            Open onboarding
          </AppText>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

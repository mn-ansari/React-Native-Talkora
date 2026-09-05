import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import Tabs from "expo-router/tabs";

import { CustomTabBar } from "@/components/custom-tab-bar";
import { useLanguageStore } from "@/store/language-store";

/**
 * Houses Talkora's five primary destinations behind the app's existing gates.
 */
export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const hasLanguageStoreHydrated = useLanguageStore(
    (state) => state.hasHydrated,
  );

  if (!isLoaded || !hasLanguageStoreHydrated) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageCode) {
    return <Redirect href="/language-selection" />;
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        animation: "none",
        headerShown: false,
        sceneStyle: { backgroundColor: "#FCFCFF" },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="learn" options={{ title: "Learn" }} />
      <Tabs.Screen name="ai-teacher" options={{ title: "AI Teacher" }} />
      <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

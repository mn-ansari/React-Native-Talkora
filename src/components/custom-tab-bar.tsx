import { CommonActions } from "expo-router/react-navigation";
import type { BottomTabBarProps } from "expo-router/tabs";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/app-text";

const ACTIVE_CIRCLE_SIZE = 48;
const ACTIVE_COLOR = "#6C4EF5";
const INACTIVE_COLOR = "#6B7280";
const INDICATOR_EASING = Easing.bezier(0.77, 0, 0.175, 1);

type TabRouteName = "home" | "learn" | "ai-teacher" | "chat" | "profile";

type TabDefinition = {
  label: string;
  activeIcon: SymbolViewProps["name"];
  inactiveIcon: SymbolViewProps["name"];
};

type TabLayout = {
  width: number;
  x: number;
};

const tabs: Record<TabRouteName, TabDefinition> = {
  home: {
    label: "Home",
    activeIcon: { ios: "house.fill", android: "home_filled", web: "home_filled" },
    inactiveIcon: { ios: "house", android: "home", web: "home" },
  },
  learn: {
    label: "Learn",
    activeIcon: { ios: "book.fill", android: "menu_book", web: "menu_book" },
    inactiveIcon: { ios: "book", android: "menu_book", web: "menu_book" },
  },
  "ai-teacher": {
    label: "AI Teacher",
    activeIcon: {
      ios: "person.wave.2.fill",
      android: "record_voice_over",
      web: "record_voice_over",
    },
    inactiveIcon: {
      ios: "person.wave.2",
      android: "record_voice_over",
      web: "record_voice_over",
    },
  },
  chat: {
    label: "Chat",
    activeIcon: {
      ios: "bubble.left.fill",
      android: "chat_bubble",
      web: "chat_bubble",
    },
    inactiveIcon: {
      ios: "bubble.left",
      android: "chat_bubble_outline",
      web: "chat_bubble_outline",
    },
  },
  profile: {
    label: "Profile",
    activeIcon: {
      ios: "person.crop.circle.fill",
      android: "account_circle",
      web: "account_circle",
    },
    inactiveIcon: {
      ios: "person.crop.circle",
      android: "person_outline",
      web: "person_outline",
    },
  },
};

function getTabDefinition(routeName: string) {
  return tabs[routeName as TabRouteName] ?? tabs.home;
}

/**
 * Talkora's custom bottom navigation with a shared animated active indicator.
 */
export function CustomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);
  const hasPositionedIndicator = useRef(false);

  const activeRoute = state.routes[state.index];
  const activeTab = getTabDefinition(activeRoute?.name ?? "home");

  useEffect(() => {
    if (!activeRoute) {
      return;
    }

    const activeLayout = tabLayouts[activeRoute.key];

    if (!activeLayout) {
      return;
    }

    const nextX =
      activeLayout.x + (activeLayout.width - ACTIVE_CIRCLE_SIZE) / 2;

    if (!hasPositionedIndicator.current) {
      indicatorX.set(nextX);
      indicatorOpacity.set(1);
      hasPositionedIndicator.current = true;
      return;
    }

    indicatorX.set(
      withTiming(nextX, {
        duration: 250,
        easing: INDICATOR_EASING,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [activeRoute, indicatorOpacity, indicatorX, tabLayouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.get(),
    transform: [{ translateX: indicatorX.get() }],
  }));

  const saveTabLayout = useCallback(
    (routeKey: string, event: LayoutChangeEvent) => {
      const { width, x } = event.nativeEvent.layout;

      setTabLayouts((currentLayouts) => {
        const currentLayout = currentLayouts[routeKey];

        if (currentLayout?.width === width && currentLayout.x === x) {
          return currentLayouts;
        }

        return {
          ...currentLayouts,
          [routeKey]: { width, x },
        };
      });
    },
    [],
  );

  return (
    <View
      className="rounded-t-[30px] bg-white"
      style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <View className="h-[60px] flex-row px-[8px]" role="tablist">
        <Animated.View
          pointerEvents="none"
          style={[styles.activeCircle, indicatorStyle]}
        >
          <SymbolView
            name={activeTab.activeIcon}
            size={24}
            tintColor="#FFFFFF"
          />
        </Animated.View>

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = getTabDefinition(route.name);
          const options = descriptors[route.key]?.options;

          const handlePress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate(route),
                target: state.key,
              });
            }
          };

          const handleLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={
                options?.tabBarAccessibilityLabel ?? tab.label
              }
              accessibilityState={{ selected: isFocused }}
              aria-selected={isFocused}
              hitSlop={4}
              onLayout={(event) => saveTabLayout(route.key, event)}
              onLongPress={handleLongPress}
              onPress={handlePress}
              pressRetentionOffset={12}
              role={Platform.select({ ios: "button", default: "tab" })}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabButtonPressed,
              ]}
              testID={options?.tabBarButtonTestID}
            >
              {!isFocused ? (
                <View className="items-center justify-center gap-[5px]">
                  <SymbolView
                    name={tab.inactiveIcon}
                    size={24}
                    tintColor={INACTIVE_COLOR}
                  />
                  <AppText
                    numberOfLines={1}
                    className="font-poppins text-[11px] leading-[15px] text-[#6B7280]"
                  >
                    {tab.label}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderCurve: "continuous",
    boxShadow: "0 -4px 16px rgba(13, 19, 43, 0.05)",
  },
  activeCircle: {
    position: "absolute",
    top: 6,
    left: 0,
    zIndex: 1,
    width: ACTIVE_CIRCLE_SIZE,
    height: ACTIVE_CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ACTIVE_CIRCLE_SIZE / 2,
    backgroundColor: ACTIVE_COLOR,
  },
  tabButton: {
    zIndex: 2,
    minWidth: 48,
    minHeight: 48,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonPressed: {
    opacity: 0.72,
  },
});

import type { ComponentProps, ComponentType } from "react";
import {
  type StyleProp,
  Text as RNText,
  TouchableOpacity as RNTouchableOpacity,
  type ViewStyle,
  View as RNView,
} from "react-native";
import { useCssElement } from "react-native-css";

type ClassNameProp = {
  className?: string;
};

export type TextProps = ComponentProps<typeof RNText> & ClassNameProp;

/**
 * A Text component with CSS/Tailwind className support via react-native-css.
 * @param props - React Native Text props plus className
 * @returns A Text component that supports Tailwind classes
 */
export function Text(props: TextProps) {
  return useCssElement(RNText, props, { className: "style" });
}

Text.displayName = "CSS(Text)";

export type TouchableOpacityProps = ComponentProps<
  typeof RNTouchableOpacity
> &
  ClassNameProp;

type CssTouchableOpacityBaseProps = ClassNameProp & {
  style?: StyleProp<ViewStyle>;
};

const CssTouchableOpacityBase = RNTouchableOpacity as unknown as ComponentType<
  CssTouchableOpacityBaseProps
>;

/**
 * A TouchableOpacity component with CSS/Tailwind className support via react-native-css.
 * @param props - React Native TouchableOpacity props plus className
 * @returns A TouchableOpacity component that supports Tailwind classes
 */
export function TouchableOpacity(props: TouchableOpacityProps) {
  return useCssElement(CssTouchableOpacityBase, props, { className: "style" });
}

TouchableOpacity.displayName = "CSS(TouchableOpacity)";

export type ViewProps = ComponentProps<typeof RNView> & ClassNameProp;

/**
 * A View component with CSS/Tailwind className support via react-native-css.
 * @param props - React Native View props plus className
 * @returns A View component that supports Tailwind classes
 */
export function View(props: ViewProps) {
  return useCssElement(RNView, props, { className: "style" });
}

View.displayName = "CSS(View)";

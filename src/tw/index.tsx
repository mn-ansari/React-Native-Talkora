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

export function TouchableOpacity(props: TouchableOpacityProps) {
  return useCssElement(CssTouchableOpacityBase, props, { className: "style" });
}

TouchableOpacity.displayName = "CSS(TouchableOpacity)";

export type ViewProps = ComponentProps<typeof RNView> & ClassNameProp;

export function View(props: ViewProps) {
  return useCssElement(RNView, props, { className: "style" });
}

View.displayName = "CSS(View)";

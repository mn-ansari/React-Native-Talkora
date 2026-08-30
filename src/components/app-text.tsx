import { Text, type TextProps } from "react-native";

import type { TypographyVariant } from "@/theme";

const variantClasses: Record<TypographyVariant, string> = {
  h1: "typography--h1",
  h2: "typography--h2",
  h3: "typography--h3",
  h4: "typography--h4",
  bodyLarge: "typography--body-large",
  bodyMedium: "typography--body-medium",
  bodySmall: "typography--body-small",
  caption: "typography--caption",
};

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  className?: string;
};

export function AppText({
  variant = "bodyMedium",
  className,
  ...props
}: AppTextProps) {
  const classes = [variantClasses[variant], className].filter(Boolean).join(" ");

  return <Text className={classes} {...props} />;
}

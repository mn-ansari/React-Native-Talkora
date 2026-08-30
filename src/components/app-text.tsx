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

/**
 * A typography-aware Text component that applies predefined typography variants.
 * @param variant - The typography variant to apply (default: "bodyMedium")
 * @param className - Additional Tailwind classes to apply
 * @param props - Standard React Native Text props
 * @returns A styled Text component with the specified typography variant
 */
export function AppText({
  variant = "bodyMedium",
  className,
  ...props
}: AppTextProps) {
  const classes = [variantClasses[variant], className].filter(Boolean).join(" ");

  return <Text className={classes} {...props} />;
}

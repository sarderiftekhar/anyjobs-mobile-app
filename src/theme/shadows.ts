import { Platform } from "react-native";
import { colors } from "./colors";

const ios = (
  shadowColor: string,
  opacity: number,
  radius: number,
  offsetY: number
) => ({
  shadowColor,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: offsetY },
});

const android = (elevation: number) => ({ elevation });

const platform = (iosVal: object, androidVal: object) =>
  Platform.OS === "ios" ? iosVal : androidVal;

// Named shadow recipes per MOBILE-DESIGN-GUIDE.md §5.
// Use via: <View style={[styles.foo, shadows.card]}>
export const shadows = {
  card: platform(ios(colors.brand.navy, 0.06, 14, 3), android(3)),
  cardHover: platform(ios(colors.brand.navy, 0.1, 18, 6), android(6)),
  brand: platform(ios(colors.primary.DEFAULT, 0.25, 14, 6), android(6)),
  tab: platform(ios(colors.brand.navy, 0.08, 20, -4), android(12)),
  sheet: platform(ios(colors.brand.navy, 0.12, 24, -8), android(16)),
} as const;

import { useEffect, type ComponentType, type ReactNode } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { cssInterop } from "nativewind";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Press-in is stiff and clamped so the dip feels immediate; release is a little
// looser so the element settles back with a hint of bounce.
const PRESS_IN = {
  damping: 24,
  stiffness: 520,
  mass: 0.5,
  overshootClamping: true,
  reduceMotion: ReduceMotion.System,
} as const;
const PRESS_OUT = {
  damping: 14,
  stiffness: 320,
  mass: 0.6,
  reduceMotion: ReduceMotion.System,
} as const;

export interface PressableScaleProps extends Omit<PressableProps, "style" | "children"> {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** NativeWind classes; applied to the same (single) pressable node. */
  className?: string;
  /** Scale while pressed. Default 0.97. */
  scaleTo?: number;
  /** Opacity while pressed. Default 1 (no dimming). */
  activeOpacity?: number;
}

type BaseProps = Omit<PressableScaleProps, "className"> & {
  /** Resolved `className` styles, injected by cssInterop below. */
  classStyle?: StyleProp<ViewStyle>;
};

function PressableScaleBase({
  classStyle,
  style,
  scaleTo = 0.97,
  activeOpacity = 1,
  disabled,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: BaseProps) {
  const pressed = useSharedValue(0);

  // If the control becomes disabled mid-press, let it spring back.
  useEffect(() => {
    if (disabled) pressed.value = withSpring(0, PRESS_OUT);
  }, [disabled, pressed]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = pressed.value;
    const scale = 1 - (1 - scaleTo) * p;
    // Only touch opacity when asked to, so className opacity (e.g. a disabled
    // "opacity-50") isn't overridden.
    if (activeOpacity >= 1) return { transform: [{ scale }] };
    return { opacity: 1 - (1 - activeOpacity) * p, transform: [{ scale }] };
  });

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) pressed.value = withSpring(1, PRESS_IN);
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    pressed.value = withSpring(0, PRESS_OUT);
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[classStyle, style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

/**
 * A Pressable that springs down slightly while pressed (Reanimated, UI thread).
 *
 * NativeWind can't safely merge `className` into the style of a Reanimated
 * component (it would fold the animated style into a plain object), so the
 * class styles are resolved into a separate `classStyle` prop and composed
 * here: `[classStyle, style, animatedStyle]`. Layout classes such as `flex-1`
 * or `mb-3` therefore land on the pressable itself, exactly like they did on
 * TouchableOpacity.
 */
export const PressableScale = cssInterop(PressableScaleBase, {
  className: "classStyle",
}) as unknown as ComponentType<PressableScaleProps>;

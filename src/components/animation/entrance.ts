import { FadeIn, FadeInDown, ReduceMotion } from "react-native-reanimated";
import { introRemainingMs } from "./introState";

/**
 * Shared entrance (layout) animations. Reanimated `entering` animations only
 * run when a view mounts, so re-renders and React Query refetches (which keep
 * list items mounted under the same key) never replay them.
 */

/** Delay between consecutive list items. */
export const STAGGER_STEP_MS = 45;
/** The stagger stops growing after this many items so long lists stay snappy. */
export const STAGGER_CAP = 8;
/**
 * Items at or beyond this index mount without an entrance. This matches
 * FlatList's initial render batch, so rows that appear later (scrolling,
 * pagination) just appear instead of fading in late.
 */
export const MAX_ANIMATED_INDEX = 10;

export function staggerDelay(index = 0) {
  return Math.min(Math.max(index, 0), STAGGER_CAP) * STAGGER_STEP_MS;
}

/** Fade + short rise on a soft spring (~350 ms). */
export function enterUp(delayMs = 0) {
  return FadeInDown.springify(360)
    .dampingRatio(0.9)
    .delay(introRemainingMs() + delayMs)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] })
    .reduceMotion(ReduceMotion.System);
}

/** Plain fade, for things that shouldn't move (spinners, overlays). */
export function enterFade(delayMs = 0, durationMs = 260) {
  return FadeIn.duration(durationMs)
    .delay(introRemainingMs() + delayMs)
    .reduceMotion(ReduceMotion.System);
}

/** Staggered entrance for the n-th item of a list, or undefined past the cap. */
export function listItemEntering(index = 0, baseDelayMs = 0) {
  if (index >= MAX_ANIMATED_INDEX) return undefined;
  return enterUp(baseDelayMs + staggerDelay(index));
}

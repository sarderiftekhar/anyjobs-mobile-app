import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  Easing,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { colors } from "../../theme/colors";
import { markIntroDone, markIntroPlaying } from "./introState";

/*
 * Launch intro. Takes over from the native splash (app.json `splash`: this
 * image, contain, #0064EC) with a pixel-identical first frame, then:
 *
 *   0    hand-off: overlay matches the native splash; native splash is hidden
 *   120  anticipation: the "cj" mark dips to 0.88, the wordmark ducks out
 *   320  the mark springs back (slight overshoot) with a glow and two rings
 *        pulsing out behind it; on Android the logo also grows from the
 *        native 200dp size to its full size
 *   680  the "ContinentJobs" wordmark slides up into place and fades in
 *   1380 exit: the logo scales up and fades, the blue backdrop dissolves
 *   ~1840 overlay unmounts
 *
 * The app renders underneath the whole time; nothing waits on the animation.
 * With reduce motion on it is a short hold and a 300 ms cross-fade.
 */

// The mark and the wordmark are cropped out of the splash artwork itself, so
// they line up with the native splash exactly. Coordinates are in the
// 1024×1024 artwork space, padded a little around the measured alpha bounds
// (mark: 424–598 × 377–582, wordmark: 269–755 × 590–648).
const SPLASH_ART = require("../../../assets/splash-icon.png");
const ART = 1024;
const MARK_RECT = { x: 416, y: 368, w: 192, h: 218 };
const WORD_RECT = { x: 260, y: 587, w: 504, h: 66 };
const MARK_CENTER = { x: 511, y: 479 };

const BRAND_BLUE = colors.primary.DEFAULT; // same as app.json splash.backgroundColor

const T = {
  hold: 120, // lets Android's native splash fade (setOptions duration) finish
  dip: 200,
  springAt: 320,
  zoom: 620,
  wordInAt: 680,
  wordIn: 380,
  exitAt: 1380,
  exit: 440,
} as const;
const TOTAL_MS = T.exitAt + T.exit + 20;

const RM = { hold: 150, fade: 300 } as const;

// If the artwork never reports onLoad (or layout never happens), hand off and
// play anyway rather than leaving the native splash up.
const FIRST_FRAME_TIMEOUT_MS = 1500;

// We choose the reduced-motion path ourselves, so the full timeline must not be
// short-circuited again by Reanimated.
const NO_RM = ReduceMotion.Never;

/** Size (in dp) at which the native splash draws the 1024² artwork. */
function nativeArtSize(width: number, height: number) {
  // Legacy `splash` config on Android 12+: icon drawn at imageWidth 200dp,
  // centred in the window.
  if (Platform.OS === "android") return 200;
  // Legacy `splash` config on iOS: full-screen image view, aspect-fit.
  if (Platform.OS === "ios") return Math.min(width, height);
  // Web has no native splash; keep the logo a sensible size.
  return Math.min(width, height, 360);
}

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [passThrough, setPassThrough] = useState(false);
  const started = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const overlayOpacity = useSharedValue(1);
  const groupScale = useSharedValue(1);
  const groupOpacity = useSharedValue(1);
  const markScale = useSharedValue(1);
  const wordY = useSharedValue(0);
  const wordOpacity = useSharedValue(1);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const glow = useSharedValue(0);

  const geo = useMemo(() => {
    if (!size) return null;
    const nativeS = nativeArtSize(size.w, size.h);
    // Lay the artwork out at its final size and scale it down to the native
    // size for the hand-off, so growing it later stays crisp.
    const targetS = Math.max(nativeS, Math.min(size.w, size.h, 420));
    return {
      targetS,
      k: targetS / ART,
      left: (size.w - targetS) / 2,
      top: (size.h - targetS) / 2,
      startScale: nativeS / targetS,
    };
  }, [size]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const finish = useCallback(() => {
    markIntroDone();
    onFinishRef.current();
  }, []);

  const begin = useCallback(() => {
    if (started.current) return;
    started.current = true;
    SplashScreen.hideAsync().catch(() => {});

    if (reduceMotion || !geo) {
      markIntroPlaying(RM.hold);
      overlayOpacity.value = withDelay(
        RM.hold,
        withTiming(0, { duration: RM.fade, easing: Easing.inOut(Easing.quad), reduceMotion: NO_RM }),
      );
      later(() => setPassThrough(true), RM.hold);
      later(finish, RM.hold + RM.fade + 20);
      return;
    }

    markIntroPlaying(T.exitAt);

    // 1. Anticipation, then the mark springs back with a little overshoot.
    markScale.value = withSequence(
      withDelay(
        T.hold,
        withTiming(0.88, { duration: T.dip, easing: Easing.inOut(Easing.quad), reduceMotion: NO_RM }),
      ),
      withSpring(1, { damping: 9, stiffness: 170, mass: 0.7, reduceMotion: NO_RM }),
    );

    // 2. Glow and rings pulse out from behind the mark.
    glow.value = withSequence(
      withDelay(
        T.springAt,
        withTiming(1, { duration: 380, easing: Easing.out(Easing.quad), reduceMotion: NO_RM }),
      ),
      withTiming(0.55, { duration: 620, easing: Easing.inOut(Easing.quad), reduceMotion: NO_RM }),
    );
    ring1.value = withDelay(
      T.springAt + 20,
      withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic), reduceMotion: NO_RM }),
    );
    ring2.value = withDelay(
      T.springAt + 220,
      withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic), reduceMotion: NO_RM }),
    );

    // 3. The whole logo grows to full size (no-op on iOS, where the native
    //    splash is already full size), then pushes forward on exit.
    groupScale.value = withSequence(
      withDelay(
        T.springAt,
        withTiming(1, { duration: T.zoom, easing: Easing.out(Easing.cubic), reduceMotion: NO_RM }),
      ),
      withDelay(
        T.exitAt - T.springAt - T.zoom,
        withTiming(1.12, { duration: T.exit, easing: Easing.in(Easing.cubic), reduceMotion: NO_RM }),
      ),
    );

    // 4. Wordmark ducks below its mask during the dip, then rises back in.
    const wordH = WORD_RECT.h * geo.k;
    wordY.value = withSequence(
      withDelay(
        T.hold,
        withTiming(wordH, { duration: T.dip, easing: Easing.in(Easing.cubic), reduceMotion: NO_RM }),
      ),
      withDelay(
        T.wordInAt - T.hold - T.dip,
        withTiming(0, { duration: T.wordIn, easing: Easing.out(Easing.cubic), reduceMotion: NO_RM }),
      ),
    );
    wordOpacity.value = withSequence(
      withDelay(T.hold, withTiming(0, { duration: 160, reduceMotion: NO_RM })),
      withDelay(
        T.wordInAt - T.hold - 160,
        withTiming(1, { duration: T.wordIn, easing: Easing.out(Easing.quad), reduceMotion: NO_RM }),
      ),
    );

    // 5. Exit: logo fades slightly ahead of the backdrop.
    groupOpacity.value = withDelay(
      T.exitAt,
      withTiming(0, { duration: 300, easing: Easing.in(Easing.quad), reduceMotion: NO_RM }),
    );
    overlayOpacity.value = withDelay(
      T.exitAt + 60,
      withTiming(0, { duration: T.exit - 60, easing: Easing.inOut(Easing.quad), reduceMotion: NO_RM }),
    );

    later(() => setPassThrough(true), T.exitAt);
    later(finish, TOTAL_MS);
  }, [
    reduceMotion,
    geo,
    later,
    finish,
    overlayOpacity,
    markScale,
    glow,
    ring1,
    ring2,
    groupScale,
    wordY,
    wordOpacity,
    groupOpacity,
  ]);

  // Hand off once the overlay has laid out and both artwork crops have loaded.
  const ready = !!geo && imagesLoaded >= 2;
  useEffect(() => {
    if (!ready) return;
    // One more frame so the loaded artwork is actually on screen before the
    // native splash goes away.
    const id = requestAnimationFrame(begin);
    return () => cancelAnimationFrame(id);
  }, [ready, begin]);

  // Never get stuck behind the native splash.
  useEffect(() => {
    const t = setTimeout(begin, FIRST_FRAME_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [begin]);

  const onLayout = (e: LayoutChangeEvent) => {
    if (size) return;
    const { width, height } = e.nativeEvent.layout;
    const nativeS = nativeArtSize(width, height);
    const targetS = Math.max(nativeS, Math.min(width, height, 420));
    // Set before the artwork mounts so its first frame matches the native size.
    groupScale.value = nativeS / targetS;
    setSize({ w: width, h: height });
  };

  const onImageLoaded = useCallback(() => setImagesLoaded((n) => n + 1), []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const groupStyle = useAnimatedStyle(() => ({
    opacity: groupOpacity.value,
    transform: [{ scale: groupScale.value }],
  }));
  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: markScale.value }] }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.14,
    transform: [{ scale: 0.8 + glow.value * 0.4 }],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
      pointerEvents={passThrough ? "none" : "auto"}
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <StatusBar style="light" />
      {geo && (
        <Animated.View
          style={[
            styles.group,
            { left: geo.left, top: geo.top, width: geo.targetS, height: geo.targetS },
            groupStyle,
          ]}
        >
          <Halo k={geo.k} style={glowStyle} />
          <Ring k={geo.k} progress={ring1} peak={0.5} />
          <Ring k={geo.k} progress={ring2} peak={0.3} />
          <ArtCrop
            rect={MARK_RECT}
            k={geo.k}
            artSize={geo.targetS}
            style={markStyle}
            onLoad={onImageLoaded}
          />
          <ArtCrop
            rect={WORD_RECT}
            k={geo.k}
            artSize={geo.targetS}
            innerStyle={wordStyle}
            onLoad={onImageLoaded}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

type Rect = { x: number; y: number; w: number; h: number };

/** A window onto one region of the splash artwork, at its exact position. */
function ArtCrop({
  rect,
  k,
  artSize,
  style,
  innerStyle,
  onLoad,
}: {
  rect: Rect;
  k: number;
  artSize: number;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  onLoad: () => void;
}) {
  return (
    <Animated.View
      style={[
        styles.crop,
        { left: rect.x * k, top: rect.y * k, width: rect.w * k, height: rect.h * k },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, innerStyle]}>
        <Image
          source={SPLASH_ART}
          // Android's Fresco fades images in by default; the hand-off frame
          // must match the native splash immediately.
          fadeDuration={0}
          onLoad={onLoad}
          onError={onLoad}
          style={{
            position: "absolute",
            left: -rect.x * k,
            top: -rect.y * k,
            width: artSize,
            height: artSize,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

const ringDiameter = (k: number) => MARK_RECT.h * k * 1.05;

function ringFrame(k: number): ViewStyle {
  const d = ringDiameter(k);
  return {
    position: "absolute",
    left: MARK_CENTER.x * k - d / 2,
    top: MARK_CENTER.y * k - d / 2,
    width: d,
    height: d,
    borderRadius: d / 2,
  };
}

function Halo({ k, style }: { k: number; style: StyleProp<ViewStyle> }) {
  return <Animated.View style={[ringFrame(k), styles.halo, style]} />;
}

function Ring({
  k,
  progress,
  peak,
}: {
  k: number;
  progress: SharedValue<number>;
  peak: number;
}) {
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12, 1], [0, peak, 0]),
    transform: [{ scale: 0.75 + progress.value * 1.45 }],
  }));
  return <Animated.View style={[ringFrame(k), styles.ring, ringStyle]} />;
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: BRAND_BLUE,
    zIndex: 9999,
    elevation: 9999,
  },
  group: {
    position: "absolute",
  },
  crop: {
    position: "absolute",
    overflow: "hidden",
  },
  halo: {
    backgroundColor: "#FFFFFF",
  },
  ring: {
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});

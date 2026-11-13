/**
 * Module-level state for the one-time launch intro (AnimatedSplash).
 *
 * Screens mount underneath the intro overlay while it plays, so their entrance
 * animations would otherwise finish before anyone can see them. Entrance
 * helpers read `introRemainingMs()` at mount time and push their delay back
 * until the overlay starts lifting.
 */
type IntroPhase = "idle" | "pending" | "playing" | "done";

let phase: IntroPhase = "idle";
let revealAt = 0;

// Best guess used before the overlay has started its timeline (it is waiting
// for its first frame). Roughly matches AnimatedSplash's reveal point.
const PENDING_REVEAL_MS = 1400;

/** Call once at app start-up (module scope). No-op after the intro has run. */
export function armIntro() {
  if (phase === "idle") phase = "pending";
}

/** True until the intro has finished, i.e. the overlay should be shown. */
export function isIntroPending() {
  return phase === "pending" || phase === "playing";
}

/** The overlay started its timeline; the app becomes visible in `revealInMs`. */
export function markIntroPlaying(revealInMs: number) {
  phase = "playing";
  revealAt = Date.now() + revealInMs;
}

export function markIntroDone() {
  phase = "done";
  revealAt = 0;
}

/** Milliseconds until the app underneath the intro becomes visible (0 once revealed). */
export function introRemainingMs() {
  if (phase === "pending") return PENDING_REVEAL_MS;
  if (phase === "playing") return Math.max(0, revealAt - Date.now());
  return 0;
}

# AnyJobs Mobile Design Guide

> Mobile counterpart to [`docs/design/DESIGN-GUIDE.md`](../anyjobs/docs/design/DESIGN-GUIDE.md) in the web project. The web guide is the source of truth for **brand identity** (color, typography, voice). This document translates those decisions to **React Native + NativeWind** idioms and calls out where mobile diverges from web (and why).

---

## 0. Hard Rules

1. **Brand primary is `#0064EC`.** Use the `primary` / `brand` Tailwind tokens defined in [`tailwind.config.js`](tailwind.config.js). Never hard-code the hex in components — go through the token. Opacity tiers (`primary/10`, `primary/20`) are how you get lighter shades. No gradients on brand surfaces.
2. **No shadcn/ui in mobile.** The web guide mandates shadcn — it does not exist on React Native. Use the primitives in [`src/components/ui/`](src/components/ui/). If a new primitive is needed, build it once there and reuse — do not re-create button/card/input ad-hoc inside screens.
3. **Color comes from tokens.** Use `bg-primary`, `text-ink`, `text-ink-soft`, `text-ink-muted`, `border-border` — never raw hex like `text-[#1F2937]` in new code. Hardcoded hex is a smell; tokens are the contract.
4. **White text on dark surfaces.** Any element on `bg-brand-navy`, `bg-brand-navy-dark`, or any dark backdrop **must** use `text-white` (primary), `text-white/80` (body), `text-white/60` (muted). Never let `text-ink*` inherit onto a dark surface — it disappears.
5. **Pill shape for CTAs.** All primary action buttons are `rounded-full`. Inputs are `rounded-2xl` (12-16px). Cards are `rounded-2xl`. Tags/chips are `rounded-full`.
6. **Satoshi everywhere.** Loaded as `Satoshi-Variable`. Headings: weight 700. Buttons & emphasized UI: weight 600. Body: 400. Use the `font-bold` / `font-semibold` Tailwind classes; the font family is set globally.

When in doubt: pick the closest existing primitive and use it as-is. "Custom" is the exception, and the exception belongs in `src/components/ui/`, not inside a screen.

---

## 1. Color System

### 1.1 Brand Tokens

| Token | Hex | Usage |
|---|---|---|
| `primary` / `brand` | `#0064EC` | All primary actions, links, focus rings, brand accents |
| `primary-dark` / `brand-dark` | `#0050C7` | Pressed/hover state |
| `primary-light` | `#E5F0FE` | Tinted backgrounds (chip bg, badge bg, card tint) |
| `brand-navy` | `#0A2540` | Dark surfaces (footer-like sections, dark hero) |
| `brand-navy-dark` | `#061A2E` | Darkest surface |

### 1.2 Text Tokens (light surfaces)

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#1A2230` | Headings, primary text |
| `ink-soft` | `#3A4F64` | Body text |
| `ink-muted` | `#6B7F94` | Captions, helpers, secondary metadata |

### 1.3 Surface & Structure

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#FFFFFF` | Card/sheet background |
| `background` | `#F6F8FB` | Screen background (replaces stark white) |
| `border` | `#E5E9F0` | Default border |
| `border-strong` | `#CBD3DD` | Stronger dividers |

### 1.4 Semantic

| Token | Hex |
|---|---|
| `success` | `#22C55E` |
| `warning` | `#EAB308` |
| `danger` | `#EF4444` |
| `info` | `#3B82F6` |

---

## 2. Typography

### 2.1 Type Scale (mobile-tuned, slightly smaller than web)

| Role | Class | Size | Weight | Line height |
|---|---|---|---|---|
| Display (welcome hero) | `text-4xl font-bold` | 36 | 700 | 1.15 |
| H1 (screen title) | `text-3xl font-bold` | 30 | 700 | 1.2 |
| H2 (section title) | `text-2xl font-bold` | 24 | 700 | 1.25 |
| H3 (card title) | `text-lg font-bold` | 18 | 700 | 1.3 |
| Body | `text-base` | 16 | 400 | 1.5 |
| Body small | `text-sm` | 14 | 400 | 1.4 |
| Caption | `text-xs font-medium` | 12 | 500 | 1.4 |
| Button label | `text-base font-semibold` | 16 | 600 | — |

### 2.2 Color × Role

| Role | Color class |
|---|---|
| Heading on light | `text-ink` |
| Body on light | `text-ink-soft` |
| Muted/caption | `text-ink-muted` |
| Heading on dark | `text-white` |
| Body on dark | `text-white/80` |
| Muted on dark | `text-white/60` |
| Link / brand emphasis | `text-primary` |

---

## 3. Spacing & Layout

- **Screen horizontal padding**: `px-5` (20px). Use `px-6` only for hero/welcome screens.
- **Stack spacing**: `gap-3` (12px) inside cards, `gap-4` (16px) between primary blocks, `gap-6` (24px) between sections.
- **Section vertical**: top `pt-6`, bottom `pb-6`. Hero: `pt-10 pb-8`.
- **Bottom safe-area**: always honor `useSafeAreaInsets().bottom`. Tab bar lifts content via its own padding — see [`(tabs)/_layout.tsx`](app/(candidate)/(tabs)/_layout.tsx).

---

## 4. Components

### 4.1 Button

Defined once in [`src/components/ui/Button.tsx`](src/components/ui/Button.tsx). Variants:

| Variant | When |
|---|---|
| `primary` | Primary CTA. Solid `bg-primary`, white text. |
| `secondary` | Soft brand. `bg-primary-light`, primary text. |
| `outline` | Tertiary. Transparent, `border-primary/30`, primary text. |
| `ghost` | In-line / table-row actions. Transparent, primary text. |
| `danger` | Destructive. `bg-danger`, white text. |

Sizes: `sm` (36h), `md` (44h), `lg` (52h). Default `md`. Always `rounded-full`. Press animates a 0.97 scale spring.

### 4.2 Card

[`src/components/ui/Card.tsx`](src/components/ui/Card.tsx). Variants:

- `default` — white surface, soft shadow, `rounded-2xl`, `border-border`. Use for general content.
- `flat` — no shadow, no border. Use inside lists where the list itself provides separation.
- `elevated` — brand-tinted shadow. Use for the focused/featured card.

Padding standard: `p-4` for compact, `p-5` for primary. Always set `gap-3` for stacked rows inside.

### 4.3 Input

[`src/components/ui/Input.tsx`](src/components/ui/Input.tsx).
- Shape: `rounded-2xl` (12px) for forms, `rounded-full` (pill) for search bars only.
- Border: `border-border`, focus `border-primary` + `ring-2 ring-primary/20`.
- Height: 52px (`py-3.5`) — large enough for thumb + label.
- Label above, helper/error below in `text-xs`.

### 4.4 Badge / Chip

- Pill-shaped, brand-tinted. `bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full`.
- Status badges use semantic tokens: `bg-success/10 text-success`, `bg-warning/10 text-warning`, `bg-danger/10 text-danger`.

### 4.5 Tab Bar (bottom navigation)

- Floating card style: white background, top corners `rounded-t-3xl`, soft brand-tinted shadow above.
- Active tab: brand color icon + `bg-primary/10` icon-pill background.
- Inactive: `text-ink-muted`.
- See [`(tabs)/_layout.tsx`](app/(candidate)/(tabs)/_layout.tsx).

### 4.6 Header (in-screen)

Pattern:
```
- Greeting on left ("Welcome back" / first name)
- Notification bell on right (round, ink-muted icon, danger dot for unread)
- Search/filters below in their own row
- Bottom-rounded card edge to lift the body content
```

---

## 5. Shadows & Elevation

React Native shadows differ between iOS (`shadow*` props) and Android (`elevation`). Use these named recipes — don't hand-tune per usage.

| Recipe | iOS | Android |
|---|---|---|
| `shadow-card` | `{ shadowColor:#0A2540, shadowOpacity:0.06, shadowRadius:14, shadowOffset:{0,3} }` | `elevation:3` |
| `shadow-card-hover` | `{ ..., shadowOpacity:0.10, shadowRadius:18, shadowOffset:{0,6} }` | `elevation:6` |
| `shadow-brand` (CTA glow) | `{ shadowColor:#0064EC, shadowOpacity:0.25, shadowRadius:14, shadowOffset:{0,6} }` | `elevation:6` |
| `shadow-tab` | `{ shadowColor:#0A2540, shadowOpacity:0.08, shadowRadius:20, shadowOffset:{0,-4} }` | `elevation:12` |

These are exported from [`src/theme/shadows.ts`](src/theme/shadows.ts) — import and spread, e.g. `<View style={shadows.card}>`.

---

## 6. Borders & Radius

| Class | Value | Usage |
|---|---|---|
| `rounded-md` | 8px | Tiny pills, chips, internal dividers |
| `rounded-xl` | 12px | Inputs, sub-cards |
| `rounded-2xl` | 16px | Cards, sheets |
| `rounded-3xl` | 24px | Heros, screen-rounding accents, tab bar |
| `rounded-full` | 9999px | Buttons, avatars, badges |

**Borders**: `border border-border` is the default. Brand-active borders use `border-primary/30`, hover-equivalent `border-primary/50`.

---

## 7. Iconography

- **Library**: `@expo/vector-icons` → `Ionicons` for general UI. `MaterialCommunityIcons` allowed when Ionicons lacks the glyph. **No Flaticon, no Line Awesome** (those are web-only and require font files we don't ship).
- **Sizing**: 18 (inline), 20 (button), 22 (header), 24 (card), 32+ (feature illustration).
- **Active color**: brand. Inactive: `ink-muted`.

---

## 8. Animation

- **Press**: scale to 0.97 with spring (already in `Button`).
- **Card mount**: fade + 15px slide-up over 400ms with stagger (200ms delay × index).
- **Tab switch**: icon scale 0.85 → 1, background pill opacity 0 → 1, 200ms.
- Use `react-native-reanimated` for new entrance animations; `Animated` API is fine for existing components.

---

## 9. Dark Surfaces

When a section uses `bg-brand-navy` or `bg-brand-navy-dark`:

- All children inherit `text-white`. Set it on the parent `View`/`Text` so children get it via cascade.
- Tinted glass cards on dark: `bg-black/20` (NOT `bg-white/10` — it greys out white text). Add a hairline `border border-white/10`.
- Inputs on dark: `bg-white/10 text-white placeholder:text-white/50 border-white/15`.
- CTAs on dark: keep `bg-primary` (it has enough contrast). Outline buttons on dark switch to `border-white/30 text-white`.

---

## 10. Accessibility

- Minimum tap target **44×44**. Buttons honor this via the `md`/`lg` sizes; for icon-only touchables use `hitSlop` to expand.
- Always set `accessibilityLabel` for icon-only buttons.
- Form inputs: `accessibilityLabel` matches the visible label.
- Color contrast: `ink` on white = 13.4:1 ✅. `ink-soft` = 8.6:1 ✅. `ink-muted` = 4.6:1 (passes AA for body, fails AAA — fine for captions only).

---

## 11. What the web guide says vs. what mobile does

| Web rule | Mobile equivalent |
|---|---|
| shadcn/ui only | Use `src/components/ui/`. Don't reinvent. |
| `max-w-7xl` containers | N/A — viewport is the container. Use `px-5` instead. |
| Sticky navbar with `backdrop-blur-md` | Native stack header (Expo Router) or `SafeAreaView` + custom header. `backdrop-blur` is unreliable on Android. |
| `hidden lg:block` responsive utilities | N/A — single viewport. Use `Dimensions` + conditional render only when truly needed (tablet support). |
| Hero typewriter (`requestAnimationFrame`) | Use `react-native-reanimated` shared values + `withTiming`. See [`OrbitHalo.tsx`](src/components/ui/OrbitHalo.tsx) for an example. |
| Footer with link grid | N/A — replaced by the Profile tab + Settings screen. |
| Flaticon / Line Awesome icons | `@expo/vector-icons` (`Ionicons`, `MaterialCommunityIcons`). |
| `bg-gradient-to-br` brand gradients | Solid surfaces only. Use `expo-linear-gradient` ONLY for decorative non-brand effects (e.g., welcome screen halo). |
| Border-beam animation on search input | Skip on mobile — too costly per frame, distracting on small screens. |

---

## 12. File Map

| File | Purpose |
|---|---|
| [`tailwind.config.js`](tailwind.config.js) | Tailwind theme tokens (colors, font, radius). Source of truth for class names. |
| [`global.css`](global.css) | Tailwind directives only. |
| [`src/theme/colors.ts`](src/theme/colors.ts) | TypeScript-side colors for non-NativeWind contexts (`StyleSheet.create`, animated values). Mirrors `tailwind.config.js`. |
| [`src/theme/typography.ts`](src/theme/typography.ts) | Font sizes/weights for `StyleSheet`. |
| [`src/theme/shadows.ts`](src/theme/shadows.ts) | Named shadow recipes (`card`, `cardHover`, `brand`, `tab`). |
| [`src/components/ui/`](src/components/ui/) | All shared primitives. |

---

## 13. Quick Reference

```
PRIMARY:        #0064EC                  (token: bg-primary / text-primary)
PRIMARY DARK:   #0050C7                  (pressed)
PRIMARY LIGHT:  #E5F0FE                  (chip bg, badge bg)
NAVY:           #0A2540                  (dark surfaces)
INK:            #1A2230 / #3A4F64 / #6B7F94   (heading / body / muted)
BG:             #F6F8FB                  (screen background)
BORDER:         #E5E9F0 (default), #CBD3DD (strong)
RADIUS:         rounded-full (button), rounded-2xl (card), rounded-xl (input)
FONT:           Satoshi-Variable, 700 heading / 600 button / 400 body
SHADOW:         shadows.card / shadows.brand (from src/theme/shadows.ts)
```

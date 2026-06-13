# App Store Readiness — Deep Audit Findings

Date: 2026-06-13 · Scope: `anyjobs-mobile-app` (Expo SDK 54, React Native 0.81, expo-router)
Method: direct review of config/security files + 5 parallel code-sweep agents, key findings re-verified by hand.

## Verdict: NOT READY — 4 hard blockers + several polish issues

The security foundation is genuinely strong. The failures are all **missing compliance UI**, which is the more common 2026 rejection cause — and the fixes are well-scoped.

| # | Checklist item | Verdict | Notes |
|---|----------------|---------|-------|
| 1 | No DB master keys in frontend | ✅ PASS | All DB/AI/payment ops go through backend |
| 2 | Private API keys isolated | ✅ PASS | No keys in bundle; only `EXPO_PUBLIC_API_URL` (a URL) is exposed |
| 3 | No in-app code execution | ✅ PASS | No `eval`/`new Function`/WebView/REPL anywhere |
| 4 | Cloud build via EAS | ✅ PASS | `eas.json` present and used |
| 5 | "No Wi-Fi" stress test | ⚠️ PARTIAL | No global error boundary (white-screen risk); inconsistent offline copy |
| 6 | No AI/dev leftovers | ⚠️ FAIL | Dev-facing stub alert, dead settings rows, unguarded `console.log` |
| 7 | Modular code organization | ✅ PASS | Clean `src/` (api/components/hooks/stores/types) |
| 8 | AI consent screen | ❌ **BLOCKER** | None exists; AI features fire with no consent |
| 9 | Privacy policy in-app link | ❌ **BLOCKER** | Row exists but has no `onPress` — dead |
| 10 | Explicit AI data disclaimer | ❌ **BLOCKER** | No text disclosing data goes to an AI vendor |
| 11 | Native Delete Account button | ❌ **BLOCKER** | Absent in UI and API — guaranteed rejection |
| 12 | Native IAP (no Stripe on iOS) | ✅ PASS (today) | No purchase UI live; see future risk below |
| 13 | Restore Purchases | N/A | No IAP yet; required once billing ships |
| 14 | Latest required Apple SDK | ⚠️ VERIFY | Expo 54 OK; set explicit iOS `deploymentTarget`; Android is `apk` not `aab` |
| 15 | 3rd-party privacy manifests | ⚠️ VERIFY | Expo 54 modules ship manifests; confirm after `eas build` |
| 16 | 44pt tap targets | ⚠️ VERIFY | Not fully measured; `SettingsRow` ~`py-3.5` ≈ 28px+text, likely under 44 |
| 17 | Demo guest account | ☐ PROCESS | Fill in App Review Notes at submission |
| 18 | Explainer video link | ☐ PROCESS | Record ~30s clip; AI calls are slow, reviewers need context |

---

## 🔴 Hard blockers (fix before submission)

### B1. Native "Delete Account" — Guideline 5.1.1(v)
The app has login/register, so Apple **requires** in-app account deletion. Today `app/(candidate)/settings.tsx` and `app/(employer)/settings.tsx` only offer **Sign Out**, and there is no `deleteAccount` endpoint in `src/api/auth.ts` or `src/api/profile.ts`.
**Fix:** add `DELETE /v1/mobile/account` (backend) + a red "Delete Account" row with a confirm dialog in both settings screens.

### B2. AI consent on first use — Guideline 5.1.2 / AI transparency
AI features (cover-letter-ai, career-path, interview-prep, profile/analysis, job generation) call the backend AI directly with no prior consent. `app/(candidate)/onboarding.tsx` and `AIGenerateModal` contain no disclosure.
**Fix:** one-time consent screen/modal naming the provider before the first AI action, persisted in SecureStore.

### B3. Working Privacy Policy + Terms links — Guideline 5.1.1
In `app/(candidate)/settings.tsx:93-94` the "Terms of Service" and "Privacy Policy" rows render but have **no `onPress`** — tapping does nothing. Auth-screen versions (`welcome.tsx`, `register.tsx`) are static `<Text>`, not links.
**Fix:** wire these to open the hosted policy via `expo-web-browser` (or an in-app screen). Same for the employer side.

### B4. AI data disclaimer text
No in-app or policy text states that user-uploaded data (CVs, prompts, images) is transmitted to an external AI vendor for processing.
**Fix:** add this clause to the privacy policy and reference it in the B2 consent copy.

---

## 🟡 Polish issues (Guideline 2.1 — likely rejection triggers)

- **Dev-facing stub alert** — `app/(employer)/company/gallery.tsx`: "Change logo / Change banner / Add gallery image" call `pickAndUploadStub()` which alerts *"Image picker not wired — … not in package.json yet."* A reviewer will see this. **Fix:** implement `expo-image-picker` or hide the buttons.
- **Dead settings rows** — in `app/(candidate)/settings.tsx`, Email, Change Password, Phone Number, Help Center, Send Feedback rows have no `onPress` (do nothing on tap). **Fix:** wire or remove.
- **Unguarded `console.log`** — `src/components/ui/LocationInput.tsx:63` logs in production. **Fix:** wrap in `if (__DEV__)`.
- **"Coming Soon" Google sign-in** — `login.tsx:167`, `register.tsx:294`. Acceptable, but hiding is safer than shipping a disabled-looking control.

## 🟡 Stability (Guideline 2.1 — offline test)

- **No global error boundary** — `app/_layout.tsx` wraps `<Slot/>` with no error boundary; a render crash white-screens the whole app. **Fix:** add an error boundary around the providers with a friendly fallback + retry.
- **Inconsistent offline messaging** — list screens handle error/empty well (good `EmptyState`/`LoadingSpinner` usage), but messages don't consistently say "check your connection." Consider a NetInfo offline banner. `client.ts` timeout (15s) and `retry: 2` are sound.

## 🟢 Future payment risk (not a blocker today)

`src/api/billing.ts` + `useBilling.ts` describe a **Stripe hosted-checkout** model (employer subscriptions/credits) but are **dead code** — no screen imports them, so there's no live 3.1.1 violation. **Before** you ship any in-app upgrade/purchase UI on iOS, you must use native IAP (StoreKit/RevenueCat) + a Restore Purchases button. Opening Stripe checkout via `Linking` for digital goods would be an instant rejection.

## ⚙️ Packaging notes

- `eas.json` builds Android as `"buildType": "apk"` for production — the **Play Store requires `aab`** (App Bundle). Doesn't affect iOS, but fix before Android release.
- No explicit iOS `deploymentTarget`/build profile in `eas.json` production — defaults work, but pin it to the current App Store minimum.
- Verify third-party privacy manifests (`PrivacyInfo.xcprivacy`) are bundled after an `eas build` — Expo 54 core modules include them; confirm no flagged APIs are unmanifested.

---

## Suggested fix order
1. **B1 Delete Account** (UI + backend endpoint) — non-negotiable.
2. **B2/B4 AI consent + disclaimer** — one modal + policy text covers both.
3. **B3 Privacy/Terms links** — quick `expo-web-browser` wiring.
4. Gallery stub + dead settings rows + `console.log`.
5. Global error boundary + offline copy.
6. Packaging (`aab`, iOS deployment target) and submission process items (demo account, video).

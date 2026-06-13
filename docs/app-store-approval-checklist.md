# App Store Approval Checklist (AnyJobs Mobile)

Context: 2026 Apple enforcement wave. Apple bans the AI *creator tools* (Replit, Vibecode, etc.)
under Guideline 2.5.2, and now reviews any AI-built app closely. Origin of the code doesn't matter
to Apple — **security, stability, and data privacy do.** Ship via `eas build` (static native output)
and tick every box below to clear automated pre-rejection and pass human review on the first try.

## 1. Hiding Money & Secrets
- [ ] **Clear frontend of DB master keys** — no DB passwords / master keys (e.g. `SUPABASE_SERVICE_ROLE_KEY`, admin tokens) anywhere in layout/app files. DB edits go through a secure backend, not the mobile app.
- [ ] **Isolate private third-party API keys** — no Anthropic/OpenAI/tracking keys in plain text in `App.js` etc. Keep them in `.env` on a separate server layer. Exposed keys in the live bundle = someone runs up your bill.

## 2. Dynamic Code Execution Test (Guideline 2.5.2)
- [ ] **No in-app code previews/editors** — no interior terminal, script compiler, or interactive window that executes unreviewed code post-approval.
- [ ] **Build via isolated cloud compiles only** — full production codebase bundled into a finished, self-contained profile via `eas build`. Static native output bypasses the dynamic-script flags that blocked Replit et al.

## 3. Stability & Professional Polish (Guideline 2.1)
- [ ] **"No Wi-Fi" stress test** — turn off Wi-Fi + data, launch, trigger core feature. No crash/freeze/white screen. Add a clean network fallback: *"Connection lost. Please check your internet and try again."*
- [ ] **Remove AI dev leftovers** — search for `Lorem Ipsum`, `TODO: fix this later`, placeholder graphics. Reviewers scan for these exact strings.
- [ ] **Organize code modules** — no single giant file. Clean modular folders (Components, Navigation, Hooks). Keeps future edit/token costs sane.

## 4. AI Rules & Transparency (Guideline 5.1.2)
- [ ] **Mandatory AI consent screen** — before the user's first AI action, show an onboarding popup that names the AI provider and gets consent. Example: *"AnyJobs uses Anthropic Claude AI to analyze your input. By continuing, you agree to securely share your data with our AI processing partner."*
- [ ] **Privacy policy inside the app menu** — a clickable link/button in native Settings or Profile (not just Apple's dashboard).
- [ ] **Explicit AI data disclaimer** — privacy policy states in plain language that user-uploaded files are transmitted to an external AI vendor for live classification.
- [ ] **Native "Delete Account" button** — if accounts are required, a clear in-app **Delete Account** button. Email-to-support deletion is not allowed.

## 5. Payment Rules (Guideline 3.1.1)
- [ ] **Native Apple IAP (no Stripe on mobile)** — premium digital content / subscriptions use Apple's native payment system, not web credit-card links or Stripe forms. RevenueCat makes this easier.
- [ ] **"Restore Purchases" link** — visible button on the paywall/subscription screen so users recover paid status after reinstall/device change.

## 6. Packaging & SDK Compliance
- [ ] **Target latest required Apple SDK** — check `app.json`; ensure Expo SDK targets the current required Apple deployment version.
- [ ] **Verify third-party privacy manifests** — every dependency updated to a version with an approved Apple Privacy Manifest (`PrivacyInfo.xcprivacy`).
- [ ] **44-point tap targets** — every button/link/icon ≥ 44×44 pt. Crowded/tiny controls = layout rejection.

## 7. Beating the Reviewer Queue
- [ ] **Active demo guest account** — fill App Review Notes with a working test username/password so the reviewer bypasses signup.
- [ ] **Private explainer screen recording** — backend AI calls take seconds; a spinner can read as "broken." Record an unedited ~30s clip of a successful run, upload as an unlisted link, and paste it into Reviewer Notes with a note on processing times.

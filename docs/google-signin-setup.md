# Google Sign-In — remaining setup

The app + backend code is fully wired (2026-07-02). The button appears automatically
once the platform prerequisites below exist. Google Cloud project: the one that owns
web client `441305853801-1ksa9cb7vo534667msudeg5m8c7950op.apps.googleusercontent.com`
(`GOOGLE_CLIENT_ID` in the backend `.env`).

## How it works

- App uses `@react-native-google-signin/google-signin` (native module → needs an
  EAS/dev build; the button is hidden in Expo Go).
- `GoogleSignin.configure({ webClientId })` makes Google mint the ID token for the
  **web** client, so the backend (`Mobile\AuthController::google`) verifies `aud`
  against the same `GOOGLE_CLIENT_ID` it already has. Verification happens via
  Google's `tokeninfo` endpoint — no `google/apiclient` composer package needed.
- Register screen passes the selected role (`candidate`/`employer`) as `user_type`;
  login screen omits it (backend defaults new users to candidate).

## Android — required before the button works

1. Google Cloud console → Credentials → Create OAuth client → **Android**.
2. Package name: `com.anyjobs.mobile`.
3. SHA-1: the EAS build signing certificate fingerprint — get it with
   `eas credentials` (Android → production keystore). Add the debug SHA-1 too if
   testing dev builds.
4. No app-side config needed. (Optionally set `GOOGLE_ANDROID_CLIENT_ID` in the
   backend `.env` — accepted as an extra token audience, not required with the
   webClientId flow.)

## iOS — required before the button appears on iOS

The button is deliberately hidden on iOS until this is done (missing URL scheme
would make the flow dead-end — an App Store rejection trigger).

1. Google Cloud console → Credentials → Create OAuth client → **iOS**,
   bundle ID `com.anyjobs.mobile`.
2. Set the env var in `eas.json` (all build profiles):
   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios-client-id>.apps.googleusercontent.com`
3. Add the config plugin to `app.json` `plugins` (reversed client ID):
   ```json
   ["@react-native-google-signin/google-signin",
    { "iosUrlScheme": "com.googleusercontent.apps.<ios-client-id>" }]
   ```
4. Rebuild with EAS.
5. Optionally set `GOOGLE_IOS_CLIENT_ID` in the backend `.env` (extra accepted
   audience; not needed with the webClientId flow, harmless to add).

## Test plan

1. `eas build --profile preview --platform android`, install the APK.
2. Sign up with Google as a new email → account created as the toggled role,
   lands on onboarding (candidate) or employer dashboard.
3. Sign out → "Sign in with Google" → same account logs straight in.
4. Existing email/password account with the same email → Google login links
   `google_id` to it (no duplicate account).

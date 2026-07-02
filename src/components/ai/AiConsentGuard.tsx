import type { ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useConsentStore } from "../../stores/consentStore";
import { AiConsentModal } from "./AiConsentModal";

/**
 * Blocks an AI-powered screen until the user has accepted AI data processing
 * (App Store Guideline 5.1.2). Children stay unmounted pre-consent so no
 * request carrying user data can reach the AI backend; declining returns the
 * user to the previous screen.
 */
export function AiConsentGuard({ children }: { children: ReactNode }) {
  const aiConsented = useConsentStore((s) => s.aiConsented);
  const acceptAiConsent = useConsentStore((s) => s.acceptAiConsent);

  if (aiConsented === true) return <>{children}</>;

  return (
    <View className="flex-1 bg-surface">
      <AiConsentModal
        visible={aiConsented === false}
        onAccept={acceptAiConsent}
        onDecline={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/");
        }}
      />
    </View>
  );
}

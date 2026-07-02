import { useState } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../ui";
import { config } from "../../constants/config";
import { openExternalUrl } from "../../lib/openExternal";

interface AiConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  /**
   * Called when the user declines ("Not now" button / Android back). The app
   * stays usable without AI — declining must always be possible somewhere in
   * the flow (App Store Guideline 5.1.2: consent can't be forced).
   */
  onDecline?: () => void;
}

/**
 * One-time consent shown before the user can use any AI feature
 * (App Store Guideline 5.1.2). Explicitly names the AI provider and discloses
 * that user-supplied content is sent to an external vendor for processing.
 */
export function AiConsentModal({
  visible,
  onAccept,
  onDecline,
}: AiConsentModalProps) {
  const insets = useSafeAreaInsets();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = () => {
    setAccepting(true);
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDecline}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View
          className="rounded-t-3xl bg-white"
          style={{ paddingBottom: insets.bottom + 16, maxHeight: "88%" }}
        >
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-gray-300" />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Ionicons name="sparkles" size={26} color="#0064EC" />
            </View>

            <Text className="text-2xl font-bold text-ink">
              AI-powered features
            </Text>

            <Text className="mt-3 text-base leading-6 text-ink-muted">
              AnyJobs uses {config.AI_PROVIDER} to power features like job
              description generation, CV/resume analysis, cover-letter drafting
              and candidate–job matching.
            </Text>

            <Text className="mt-3 text-base leading-6 text-ink-muted">
              When you use these features, the content you provide — such as
              prompts, profile details and uploaded files — is securely
              transmitted to our AI processing partner to generate results. We
              don't sell your data, and you can use the rest of the app without
              AI features.
            </Text>

            <TouchableOpacity
              className="mt-4 flex-row items-center"
              onPress={() => openExternalUrl(config.PRIVACY_POLICY_URL)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="shield-outline" size={16} color="#0064EC" />
              <Text className="ml-1.5 text-sm font-semibold text-primary">
                Read our Privacy Policy
              </Text>
            </TouchableOpacity>

            <View className="mt-6">
              <Button
                title="I Agree & Continue"
                onPress={handleAccept}
                loading={accepting}
              />
            </View>

            {onDecline && (
              <TouchableOpacity
                className="mt-3 items-center py-2.5"
                onPress={onDecline}
                hitSlop={{ top: 4, bottom: 4, left: 16, right: 16 }}
              >
                <Text className="text-sm font-semibold text-ink-muted">
                  Not now
                </Text>
              </TouchableOpacity>
            )}

            <Text className="mt-3 text-center text-xs text-ink-muted">
              By continuing you agree to share the data described above with our
              AI processing partner.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

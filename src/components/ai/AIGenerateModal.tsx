import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Badge } from "../ui";
import { aiApi } from "../../api/ai";
import type { GenerateJobDescriptionResult } from "../../types/ai";

/**
 * Bottom-sheet modal for generating a job posting from a short prompt.
 * Shows a preview on success; parent accepts to fill the create-job form.
 */
export function AIGenerateModal({
  visible,
  onClose,
  onAccept,
  seedTitle,
  seedLocation,
  seedWorkArrangement,
}: {
  visible: boolean;
  onClose: () => void;
  onAccept: (result: GenerateJobDescriptionResult) => void;
  seedTitle?: string;
  seedLocation?: string;
  seedWorkArrangement?: string;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateJobDescriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPrompt("");
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.generateJobDescription({
        prompt: prompt.trim(),
        title: seedTitle,
        location: seedLocation,
        work_arrangement: seedWorkArrangement,
      });
      setResult(res.data.data ?? null);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Failed to generate. The AI service may be unavailable.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (result) onAccept(result);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <View className="flex-row items-center">
            <Ionicons name="sparkles" size={18} color="#0064EC" />
            <Text className="ml-2 text-lg font-semibold text-ink">
              Generate with AI
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#1A2230" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
          <Text className="mb-1.5 text-sm font-medium text-ink">
            Describe the role
          </Text>
          <TextInput
            className="min-h-[100px] rounded-md border border-border px-3 py-3 text-sm text-ink"
            placeholder="e.g. Senior React developer, remote, €70k, 5+ years"
            multiline
            textAlignVertical="top"
            value={prompt}
            onChangeText={setPrompt}
          />
          <Text className="mt-2 text-xs text-ink-muted">
            The AI will draft a title, description, skills, requirements and
            benefits. You can edit everything before publishing.
          </Text>

          {error && (
            <View className="mt-4 rounded-md bg-red-50 p-3">
              <Text className="text-sm text-danger">{error}</Text>
            </View>
          )}

          {loading && (
            <View className="mt-6 items-center">
              <ActivityIndicator color="#0064EC" />
              <Text className="mt-2 text-sm text-ink-muted">
                Generating...
              </Text>
            </View>
          )}

          {result && !loading && (
            <View className="mt-4">
              <Text className="text-base font-semibold text-ink">
                {result.title}
              </Text>
              <Text className="mt-2 text-sm text-ink-muted" numberOfLines={8}>
                {result.description}
              </Text>

              {result.skills?.length > 0 && (
                <>
                  <Text className="mt-4 text-sm font-medium text-ink">
                    Skills
                  </Text>
                  <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                    {result.skills.map((s) => (
                      <Badge key={s} text={s} variant="primary" />
                    ))}
                  </View>
                </>
              )}

              {result.requirements?.length > 0 && (
                <>
                  <Text className="mt-4 text-sm font-medium text-ink">
                    Requirements
                  </Text>
                  {result.requirements.slice(0, 5).map((r, i) => (
                    <Text key={i} className="mt-1 text-xs text-ink-muted">
                      • {r}
                    </Text>
                  ))}
                </>
              )}

              {result.benefits?.length > 0 && (
                <>
                  <Text className="mt-4 text-sm font-medium text-ink">
                    Benefits
                  </Text>
                  <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                    {result.benefits.map((b) => (
                      <Badge key={b} text={b} variant="success" />
                    ))}
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>

        <View className="flex-row gap-3 border-t border-border px-4 py-3">
          {result ? (
            <>
              <Button
                title="Regenerate"
                variant="outline"
                className="flex-1"
                onPress={handleGenerate}
              />
              <Button
                title="Use this"
                className="flex-1"
                onPress={handleAccept}
              />
            </>
          ) : (
            <Button
              title="Generate"
              className="flex-1"
              loading={loading}
              onPress={handleGenerate}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

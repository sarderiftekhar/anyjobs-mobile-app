import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, EmptyState } from "../../src/components/ui";
import { ScreenHeader, ChipSelect } from "../../src/components/form";
import { useGenerateCoverLetter, useCreateCoverLetter } from "../../src/hooks/useCoverLetters";

const TONES = ["professional", "friendly", "formal", "enthusiastic"];

export default function CoverLetterAIScreen() {
  const insets = useSafeAreaInsets();
  const { jobId, jobTitle } = useLocalSearchParams<{ jobId?: string; jobTitle?: string }>();
  const numericJobId = jobId ? Number(jobId) : null;

  const [tone, setTone] = useState("professional");
  const [content, setContent] = useState("");
  const generate = useGenerateCoverLetter();
  const save = useCreateCoverLetter();

  const runGenerate = async () => {
    if (!numericJobId) return;
    try {
      const text = await generate.mutateAsync({ jobId: numericJobId, tone });
      setContent(text);
    } catch (e: any) {
      Alert.alert(
        "Generation unavailable",
        e?.response?.data?.message ?? "AI is temporarily unavailable. Please write it manually.",
      );
    }
  };

  const saveToLibrary = async () => {
    if (!content.trim()) return;
    try {
      await save.mutateAsync({
        name: jobTitle ? `For ${jobTitle}` : "AI cover letter",
        content,
      });
      Alert.alert("Saved", "Cover letter saved to your library.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.response?.data?.message ?? "Please try again.");
    }
  };

  if (!numericJobId) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          <ScreenHeader title="Cover Letter AI" />
        </View>
        <EmptyState
          icon="sparkles-outline"
          title="Generate from a job"
          description="Open a job and tap 'Generate cover letter' to create a tailored draft with AI."
          actionTitle="Browse jobs"
          onAction={() => router.push("/(candidate)/(tabs)")}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Cover Letter AI" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 140 }} keyboardShouldPersistTaps="handled">
        {jobTitle ? <Text className="mb-3 text-sm text-ink-muted">Tailored for {jobTitle}</Text> : null}

        <Text className="mb-2 text-sm font-medium text-ink">Tone</Text>
        <ChipSelect options={TONES.map((t) => ({ label: t[0].toUpperCase() + t.slice(1), value: t }))} value={[tone]} onChange={(n) => setTone(n[0] ?? "professional")} multiple={false} />

        <Button
          title={content ? "Regenerate" : "Generate with AI"}
          variant={content ? "outline" : "primary"}
          loading={generate.isPending}
          icon={<Ionicons name="sparkles-outline" size={18} color={content ? "#0064EC" : "#fff"} />}
          onPress={runGenerate}
          className="mt-4"
        />

        {content ? (
          <View className="mt-4">
            <Input label="Your cover letter" value={content} onChangeText={setContent} multiline style={{ minHeight: 260, textAlignVertical: "top" }} />
          </View>
        ) : null}
      </ScrollView>

      {content ? (
        <View className="absolute inset-x-0 bottom-0 border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
          <Button title="Save to library" loading={save.isPending} onPress={saveToLibrary} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

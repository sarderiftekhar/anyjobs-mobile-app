import { View, Text, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, Badge, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import { ScreenHeader } from "../../../src/components/form";
import {
  useProfileAnalysis,
  useGenerateAnalysis,
  useConfirmAnalysis,
  useRegenerateAnalysis,
} from "../../../src/hooks/useInsights";
import { AiConsentGuard } from "../../../src/components/ai/AiConsentGuard";

function Section({ title, items }: { title: string; items?: any[] }) {
  if (!items || items.length === 0) return null;
  return (
    <Card className="mb-3" animated={false}>
      <Text className="mb-1 text-base font-bold text-ink">{title}</Text>
      {items.map((it, i) => {
        const text = typeof it === "string" ? it : it?.title ?? it?.name ?? JSON.stringify(it);
        return (
          <Text key={i} className="mt-1 text-sm text-ink-muted">• {text}</Text>
        );
      })}
    </Card>
  );
}

export default function ProfileAnalysisScreenGuarded() {
  return (
    <AiConsentGuard>
      <ProfileAnalysisScreen />
    </AiConsentGuard>
  );
}

function ProfileAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const { data: analysis, isLoading } = useProfileAnalysis();
  const generate = useGenerateAnalysis();
  const confirm = useConfirmAnalysis();
  const regenerate = useRegenerateAnalysis();

  const runGenerate = async () => {
    try {
      const res = await generate.mutateAsync();
      if (!res.success) {
        Alert.alert("Not yet", res.message ?? "Complete more of your profile first.");
      }
    } catch (e: any) {
      Alert.alert("Couldn't generate", e?.response?.data?.message ?? "Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="AI Profile Analysis" />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading analysis..." />
      ) : !analysis ? (
        <View className="flex-1">
          <EmptyState
            icon="sparkles-outline"
            satellites={["briefcase-outline", "trending-up-outline"]}
            title="Discover your career profile"
            description="Generate an AI analysis of your expertise, ideal roles, and growth areas."
          />
          <View className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
            <Button title="Generate analysis" loading={generate.isPending} onPress={runGenerate} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          <Card className="mb-3" animated={false}>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-ink">
                {analysis.expertise_level_display ?? analysis.expertise_level ?? "Your profile"}
              </Text>
              {analysis.is_confirmed ? (
                <Badge text="Confirmed" variant="success" />
              ) : (
                <Badge text="Draft" variant="warning" />
              )}
            </View>
            {analysis.primary_specialization && (
              <Text className="mt-1 text-sm text-ink-muted">{analysis.primary_specialization}</Text>
            )}
            <View className="mt-3 flex-row flex-wrap">
              {analysis.career_stage_display && <View className="mb-2 mr-2"><Badge text={analysis.career_stage_display} variant="info" /></View>}
              {analysis.confidence_level && <View className="mb-2 mr-2"><Badge text={`${analysis.confidence_level} confidence`} variant="neutral" /></View>}
            </View>
          </Card>

          <Section title="Suitable roles" items={analysis.suitable_roles} />
          <Section title="Profile strengths" items={analysis.profile_strengths} />
          <Section title="Areas to improve" items={analysis.improvement_areas} />
          <Section title="Recommended skills" items={analysis.recommended_skills} />
          <Section title="Growth suggestions" items={analysis.career_growth_suggestions} />

          <View className="mt-2">
            {!analysis.is_confirmed && (
              <Button title="Confirm analysis" loading={confirm.isPending} onPress={() => confirm.mutate()} className="mb-3" />
            )}
            <Button title="Regenerate" variant="outline" loading={regenerate.isPending} onPress={() => regenerate.mutate()} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

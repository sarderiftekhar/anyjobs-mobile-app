import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Badge, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import { ScreenHeader } from "../../../src/components/form";
import { useInsights } from "../../../src/hooks/useInsights";

function ScoreRing({ score }: { score: number }) {
  const tone = score >= 75 ? "#22C55E" : score >= 50 ? "#0064EC" : "#EAB308";
  return (
    <View className="items-center justify-center rounded-full" style={{ width: 92, height: 92, borderWidth: 6, borderColor: tone }}>
      <Text className="text-2xl font-bold text-ink">{Math.round(score)}</Text>
      <Text className="text-[10px] text-ink-muted">/ 100</Text>
    </View>
  );
}

function Chips({ items, variant }: { items?: string[]; variant: "primary" | "warning" | "success" }) {
  if (!items || items.length === 0) return null;
  return (
    <View className="mt-2 flex-row flex-wrap">
      {items.map((s, i) => (
        <View key={`${s}-${i}`} className="mb-2 mr-2">
          <Badge text={s} variant={variant} />
        </View>
      ))}
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch, isRefetching } = useInsights();

  const overall =
    data?.scoring?.overall ?? data?.overall_score ?? data?.scoring?.profile_completeness ?? null;
  const skills = data?.skills_analysis ?? {};
  const competitiveness = data?.competitiveness ?? {};
  const recommendations: any[] = data?.recommendations ?? [];

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Profile Insights" />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Crunching your insights..." />
      ) : isError || !data ? (
        <EmptyState icon="bar-chart-outline" title="Insights unavailable" description="We couldn't load your insights right now. Pull to retry." />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {overall != null && (
            <Card className="mb-3 flex-row items-center" delay={0}>
              <ScoreRing score={Number(overall)} />
              <View className="ml-4 flex-1">
                <Text className="text-base font-bold text-ink">Overall profile score</Text>
                <Text className="mt-1 text-sm text-ink-muted">
                  {competitiveness?.overall_ranking ?? competitiveness?.ranking ?? "Keep improving your profile to rank higher."}
                </Text>
              </View>
            </Card>
          )}

          {(skills?.top_skills?.length || skills?.skill_gaps?.length) && (
            <Card className="mb-3" delay={60}>
              <Text className="text-base font-bold text-ink">Skills</Text>
              {skills?.top_skills?.length ? (
                <>
                  <Text className="mt-2 text-sm font-medium text-ink-soft">Your strengths</Text>
                  <Chips items={skills.top_skills} variant="success" />
                </>
              ) : null}
              {skills?.skill_gaps?.length ? (
                <>
                  <Text className="mt-2 text-sm font-medium text-ink-soft">Gaps to consider</Text>
                  <Chips items={skills.skill_gaps} variant="warning" />
                </>
              ) : null}
            </Card>
          )}

          {(competitiveness?.strengths?.length || competitiveness?.improvement_areas?.length) && (
            <Card className="mb-3" delay={120}>
              <Text className="text-base font-bold text-ink">Competitiveness</Text>
              {competitiveness?.strengths?.length ? (
                <>
                  <Text className="mt-2 text-sm font-medium text-ink-soft">Strengths</Text>
                  {competitiveness.strengths.map((s: string, i: number) => (
                    <Text key={i} className="mt-1 text-sm text-ink-muted">• {s}</Text>
                  ))}
                </>
              ) : null}
              {competitiveness?.improvement_areas?.length ? (
                <>
                  <Text className="mt-2 text-sm font-medium text-ink-soft">Improve</Text>
                  {competitiveness.improvement_areas.map((s: string, i: number) => (
                    <Text key={i} className="mt-1 text-sm text-ink-muted">• {s}</Text>
                  ))}
                </>
              ) : null}
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card delay={180}>
              <Text className="mb-1 text-base font-bold text-ink">Recommendations</Text>
              {recommendations.map((r, i) => (
                <View key={i} className="mt-2 border-t border-gray-100 pt-2">
                  <View className="flex-row items-center">
                    <Text className="flex-1 text-sm font-semibold text-ink">{r.title ?? r.message}</Text>
                    {r.priority && <Badge text={r.priority} variant={r.priority === "high" ? "danger" : "info"} />}
                  </View>
                  {(r.description || r.action) && (
                    <Text className="mt-1 text-sm text-ink-muted">{r.description ?? r.action}</Text>
                  )}
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
}

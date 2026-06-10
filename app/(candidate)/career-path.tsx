import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge, EmptyState, LoadingSpinner } from "../../src/components/ui";
import { ScreenHeader } from "../../src/components/form";
import { useCareerPath } from "../../src/hooks/useCareer";

export default function CareerPathScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError } = useCareerPath();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Career Path" />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Mapping your path..." />
      ) : isError || !data ? (
        <EmptyState icon="trending-up-outline" title="Career path unavailable" description="Add your role and experience to your profile to see suggestions." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          <Card className="mb-3">
            <Text className="text-sm text-ink-muted">Current stage</Text>
            <Text className="mt-1 text-2xl font-bold text-ink">{data.stage}</Text>
            {data.current_title ? (
              <Text className="mt-1 text-sm text-ink-soft">
                {data.current_title} · {data.years_experience} yr{data.years_experience === 1 ? "" : "s"}
              </Text>
            ) : null}
          </Card>

          {data.suggested_next_roles?.length > 0 && (
            <Card className="mb-3" delay={60}>
              <Text className="mb-2 text-base font-bold text-ink">Where you could go next</Text>
              {data.suggested_next_roles.map((role, i) => (
                <View key={i} className="flex-row items-center border-b border-gray-100 py-2.5">
                  <Ionicons name="arrow-forward-circle-outline" size={18} color="#0064EC" />
                  <Text className="ml-2 text-sm font-medium text-ink">{role}</Text>
                </View>
              ))}
            </Card>
          )}

          {data.recommended_skills?.length > 0 && (
            <Card className="mb-3" delay={120}>
              <Text className="mb-2 text-base font-bold text-ink">Skills to grow</Text>
              <View className="flex-row flex-wrap">
                {data.recommended_skills.map((s, i) => (
                  <View key={`${s}-${i}`} className="mb-2 mr-2">
                    <Badge text={s} variant="primary" />
                  </View>
                ))}
              </View>
            </Card>
          )}

          {data.tips?.length > 0 && (
            <Card delay={180}>
              <Text className="mb-2 text-base font-bold text-ink">Tips</Text>
              {data.tips.map((t, i) => (
                <View key={i} className="mt-1 flex-row">
                  <Text className="mr-2 text-primary">•</Text>
                  <Text className="flex-1 text-sm text-ink-muted">{t}</Text>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
}

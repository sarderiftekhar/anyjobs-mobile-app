import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, LoadingSpinner } from "../../src/components/ui";
import { ScreenHeader } from "../../src/components/form";
import { useInterviewPrep } from "../../src/hooks/useCareer";
import { AiConsentGuard } from "../../src/components/ai/AiConsentGuard";

export default function InterviewPrepScreenGuarded() {
  return (
    <AiConsentGuard>
      <InterviewPrepScreen />
    </AiConsentGuard>
  );
}

function InterviewPrepScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError } = useInterviewPrep();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Interview Prep" />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading prep..." />
      ) : isError || !data ? (
        <EmptyState icon="clipboard-outline" title="Prep unavailable" description="We couldn't load interview prep right now." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          <Card className="mb-3">
            <Text className="mb-2 text-base font-bold text-ink">Your checklist</Text>
            {data.checklist.map((item, i) => {
              const on = checked[i] ?? item.done;
              return (
                <TouchableOpacity
                  key={i}
                  className="flex-row items-center border-b border-gray-100 py-2.5"
                  onPress={() => setChecked((c) => ({ ...c, [i]: !on }))}
                >
                  <Ionicons name={on ? "checkbox" : "square-outline"} size={20} color={on ? "#22C55E" : "#6B7F94"} />
                  <Text className={`ml-2 flex-1 text-sm ${on ? "text-ink-muted line-through" : "text-ink"}`}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </Card>

          <Card className="mb-3" delay={60}>
            <Text className="mb-2 text-base font-bold text-ink">Common questions</Text>
            {data.common_questions.map((q, i) => (
              <View key={i} className="flex-row border-b border-gray-100 py-2.5">
                <Text className="mr-2 text-sm font-semibold text-primary">{i + 1}.</Text>
                <Text className="flex-1 text-sm text-ink">{q}</Text>
              </View>
            ))}
          </Card>

          <Card delay={120}>
            <Text className="mb-2 text-base font-bold text-ink">Tips</Text>
            {data.tips.map((t, i) => (
              <View key={i} className="mt-1 flex-row">
                <Text className="mr-2 text-primary">•</Text>
                <Text className="flex-1 text-sm text-ink-muted">{t}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

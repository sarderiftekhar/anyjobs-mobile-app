import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge, EmptyState, LoadingSpinner } from "../../src/components/ui";
import { ScreenHeader } from "../../src/components/form";
import { useCourses } from "../../src/hooks/useCareer";

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const { data: courses, isLoading } = useCourses();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Courses" />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading courses..." />
      ) : !courses || courses.length === 0 ? (
        <EmptyState icon="school-outline" title="No courses yet" description="Check back soon for skills and career courses." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          {courses.map((c, i) => (
            <Card key={c.id} className="mb-3" delay={i * 40}>
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-2 text-base font-semibold text-ink">{c.title}</Text>
                <Badge text={c.level} variant="info" />
              </View>
              <Text className="mt-1 text-sm text-ink-muted">{c.provider}</Text>
              <View className="mt-2 flex-row items-center">
                <Ionicons name="pricetag-outline" size={14} color="#6B7F94" />
                <Text className="ml-1 mr-3 text-xs text-ink-muted">{c.category}</Text>
                <Ionicons name="time-outline" size={14} color="#6B7F94" />
                <Text className="ml-1 text-xs text-ink-muted">{c.duration}</Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

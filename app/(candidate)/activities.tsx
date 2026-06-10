import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, LoadingSpinner } from "../../src/components/ui";
import { ScreenHeader } from "../../src/components/form";
import { useActivities } from "../../src/hooks/useCareer";
import type { ActivityItem } from "../../src/types/profileExtras";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  briefcase: "briefcase-outline",
  user: "person-outline",
  search: "search-outline",
  calendar: "calendar-outline",
  mail: "mail-outline",
};

function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function Row({ a }: { a: ActivityItem }) {
  return (
    <View className="flex-row items-start border-b border-gray-100 py-3.5">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Ionicons name={ICONS[a.icon ?? ""] ?? "ellipse-outline"} size={18} color="#0064EC" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">{a.title}</Text>
        {a.description && <Text className="mt-0.5 text-sm text-ink-muted">{a.description}</Text>}
      </View>
      <Text className="ml-2 text-xs text-ink-muted">{timeAgo(a.date)}</Text>
    </View>
  );
}

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useActivities();
  const items = data?.data ?? [];

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Activity" />
      </View>
      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading your activity..." />
      ) : items.length === 0 ? (
        <EmptyState icon="pulse-outline" title="No activity yet" description="Your applications, searches and updates will show up here." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          <Card animated={false}>
            {items.map((a) => (
              <Row key={a.id} a={a} />
            ))}
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

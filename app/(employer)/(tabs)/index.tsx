import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../src/stores/authStore";
import { useEmployerDashboard } from "../../../src/hooks/useEmployer";
import { useUnreadNotificationCount } from "../../../src/hooks/useNotifications";
import { Card, Button, Avatar, LoadingSpinner } from "../../../src/components/ui";

export default function EmployerDashboard() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading, refetch, isRefetching } = useEmployerDashboard();
  const { data: unreadCount } = useUnreadNotificationCount();

  const metrics = [
    { label: "Active Jobs", value: dashboard?.active_jobs ?? 0, icon: "briefcase-outline" as const, color: "#0064EC" },
    { label: "Applicants", value: dashboard?.total_applicants ?? 0, icon: "people-outline" as const, color: "#3B82F6" },
    { label: "New Today", value: dashboard?.new_today ?? 0, icon: "trending-up-outline" as const, color: "#22C55E" },
    { label: "Interviews", value: dashboard?.interviews_this_week ?? 0, icon: "calendar-outline" as const, color: "#EAB308" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#0064EC" />
      }
    >
      {/* Brand-tinted greeting hero */}
      <View
        className="bg-primary-light px-4 pb-10"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-medium text-ink-soft">Welcome back</Text>
            <Text className="text-2xl font-bold text-ink">
              {user?.first_name ?? "there"}
            </Text>
            <Text className="mt-0.5 text-xs text-ink-soft">Here's your hiring overview</Text>
          </View>
          <TouchableOpacity
            className="relative h-11 w-11 items-center justify-center rounded-full bg-white/70"
            onPress={() => router.push("/(employer)/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color="#1A2230" />
            {(unreadCount ?? 0) > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-danger border-2 border-white">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount! > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics grid — overlaps hero edge */}
      {isLoading ? (
        <View className="-mt-7 mx-4">
          <Card>
            <LoadingSpinner message="Loading dashboard..." />
          </Card>
        </View>
      ) : (
        <View className="-mt-7 mx-4 flex-row flex-wrap">
          {metrics.map((m, i) => (
            <View
              key={m.label}
              className={`w-1/2 ${i % 2 === 0 ? "pr-1" : "pl-1"} ${i < 2 ? "mb-2" : ""}`}
            >
              <View
                className="rounded-2xl border border-border bg-surface p-4"
                style={{ shadowColor: "#0A2540", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 3 }, elevation: 3 }}
              >
                <View className="flex-row items-center justify-between">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: m.color + "20" }}
                  >
                    <Ionicons name={m.icon} size={20} color={m.color} />
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#6B7F94" />
                </View>
                <Text className="mt-3 text-3xl font-bold text-ink">{m.value}</Text>
                <Text className="text-xs font-medium text-ink-muted">{m.label}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <View className="px-4 pt-4">
        <Text className="mb-3 text-base font-semibold text-ink">Quick Actions</Text>
        <Button
          title="Post New Job"
          size="lg"
          icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          onPress={() => router.push("/(employer)/job/create")}
        />
        <View className="mt-2 flex-row gap-2">
          <Button
            title="Browse Talent"
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<Ionicons name="search-outline" size={16} color="#0064EC" />}
          />
          <Button
            title="Analytics"
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<Ionicons name="bar-chart-outline" size={16} color="#0064EC" />}
          />
        </View>
      </View>

      {/* Recent applications */}
      <View className="px-4 pt-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">Recent Applications</Text>
          <TouchableOpacity onPress={() => router.push("/(employer)/(tabs)/applicants")}>
            <Text className="text-sm font-medium text-primary">See all</Text>
          </TouchableOpacity>
        </View>

        {dashboard?.recent_applications && dashboard.recent_applications.length > 0 ? (
          <Card>
            {dashboard.recent_applications.map((app, i) => (
              <TouchableOpacity
                key={app.id}
                className={`flex-row items-center py-3 ${
                  i > 0 ? "border-t border-gray-100" : ""
                }`}
                onPress={() => router.push(`/(employer)/applicant/${app.id}`)}
              >
                <Avatar name={app.candidate_name} uri={app.candidate_avatar} size="md" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-ink">
                    {app.candidate_name}
                  </Text>
                  <Text className="text-xs text-ink-muted">{app.job_title}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={12} color="#EAB308" />
                    <Text className="ml-1 text-xs font-semibold text-ink">
                      {app.match_score}%
                    </Text>
                  </View>
                  <Text className="text-[10px] text-ink-muted">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        ) : (
          <Card>
            <Text className="text-center text-sm text-ink-muted">
              No recent applications. Post a job to start receiving applicants.
            </Text>
          </Card>
        )}
      </View>

      {/* Upcoming interviews */}
      <View className="px-4 pt-6">
        <Text className="mb-3 text-base font-semibold text-ink">
          Upcoming Interviews
        </Text>
        {dashboard?.upcoming_interviews && dashboard.upcoming_interviews.length > 0 ? (
          <Card>
            {dashboard.upcoming_interviews.map((interview, i) => (
              <View
                key={interview.id}
                className={`flex-row items-center py-3 ${
                  i > 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                  <Ionicons
                    name={
                      interview.type === "video"
                        ? "videocam-outline"
                        : interview.type === "phone"
                          ? "call-outline"
                          : "location-outline"
                    }
                    size={18}
                    color="#0064EC"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink">
                    {interview.candidate_name}
                  </Text>
                  <Text className="text-xs text-ink-muted">{interview.job_title}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-ink">
                    {new Date(interview.scheduled_at).toLocaleDateString()}
                  </Text>
                  <Text className="text-[10px] text-ink-muted capitalize">
                    {interview.type}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <Text className="text-center text-sm text-ink-muted">
              No upcoming interviews scheduled.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

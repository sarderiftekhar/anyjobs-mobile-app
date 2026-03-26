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
    { label: "Active Jobs", value: dashboard?.active_jobs ?? 0, icon: "briefcase-outline" as const, color: "#574BA6" },
    { label: "Applicants", value: dashboard?.total_applicants ?? 0, icon: "people-outline" as const, color: "#3B82F6" },
    { label: "New Today", value: dashboard?.new_today ?? 0, icon: "trending-up-outline" as const, color: "#22C55E" },
    { label: "Interviews", value: dashboard?.interviews_this_week ?? 0, icon: "calendar-outline" as const, color: "#EAB308" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
      }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#574BA6" />
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4">
        <View>
          <Text className="text-xl font-bold text-text-primary">
            Hi, {user?.first_name ?? "there"}
          </Text>
          <Text className="text-sm text-text-secondary">Your hiring overview</Text>
        </View>
        <TouchableOpacity
          className="relative"
          onPress={() => router.push("/(employer)/notifications")}
        >
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          {(unreadCount ?? 0) > 0 && (
            <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-danger">
              <Text className="text-[10px] font-bold text-white">
                {unreadCount! > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Metrics grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <View className="flex-row flex-wrap px-4 pt-4">
          {metrics.map((m) => (
            <View key={m.label} className="w-1/2 p-1.5">
              <Card className="items-center py-5">
                <View
                  className="mb-2 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: m.color + "20" }}
                >
                  <Ionicons name={m.icon} size={20} color={m.color} />
                </View>
                <Text className="text-2xl font-bold text-text-primary">{m.value}</Text>
                <Text className="text-xs text-text-secondary">{m.label}</Text>
              </Card>
            </View>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <View className="px-4 pt-4">
        <Text className="mb-3 text-base font-semibold text-text-primary">Quick Actions</Text>
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
            icon={<Ionicons name="search-outline" size={16} color="#574BA6" />}
          />
          <Button
            title="Analytics"
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<Ionicons name="bar-chart-outline" size={16} color="#574BA6" />}
          />
        </View>
      </View>

      {/* Recent applications */}
      <View className="px-4 pt-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-text-primary">Recent Applications</Text>
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
                  <Text className="text-sm font-semibold text-text-primary">
                    {app.candidate_name}
                  </Text>
                  <Text className="text-xs text-text-secondary">{app.job_title}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={12} color="#EAB308" />
                    <Text className="ml-1 text-xs font-semibold text-text-primary">
                      {app.match_score}%
                    </Text>
                  </View>
                  <Text className="text-[10px] text-text-secondary">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        ) : (
          <Card>
            <Text className="text-center text-sm text-text-secondary">
              No recent applications. Post a job to start receiving applicants.
            </Text>
          </Card>
        )}
      </View>

      {/* Upcoming interviews */}
      <View className="px-4 pt-6">
        <Text className="mb-3 text-base font-semibold text-text-primary">
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
                    color="#574BA6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    {interview.candidate_name}
                  </Text>
                  <Text className="text-xs text-text-secondary">{interview.job_title}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-text-primary">
                    {new Date(interview.scheduled_at).toLocaleDateString()}
                  </Text>
                  <Text className="text-[10px] text-text-secondary capitalize">
                    {interview.type}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <Text className="text-center text-sm text-text-secondary">
              No upcoming interviews scheduled.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

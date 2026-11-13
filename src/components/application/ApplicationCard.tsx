import { useMemo } from "react";
import { View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { PressableScale } from "../animation/PressableScale";
import { listItemEntering } from "../animation/entrance";
import type { Application, ApplicationStatus } from "../../types/application";
import { format } from "date-fns";

const STATUS_CONFIG: Record<ApplicationStatus, { variant: "primary" | "success" | "warning" | "danger" | "info" | "neutral"; label: string }> = {
  applied: { variant: "info", label: "Applied" },
  viewed: { variant: "primary", label: "Viewed" },
  shortlisted: { variant: "success", label: "Shortlisted" },
  interviewed: { variant: "warning", label: "Interviewed" },
  offered: { variant: "success", label: "Offered" },
  accepted: { variant: "success", label: "Accepted" },
  rejected: { variant: "danger", label: "Rejected" },
  withdrawn: { variant: "neutral", label: "Withdrawn" },
};

interface ApplicationCardProps {
  application: Application;
  index?: number;
  /** Staggered entrance on mount. Set false when a parent row animates instead. */
  animated?: boolean;
}

export function ApplicationCard({ application, index = 0, animated = true }: ApplicationCardProps) {
  const statusConfig = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.applied;
  // Computed once: entering only applies on mount, so refetches never replay it.
  const entering = useMemo(() => (animated ? listItemEntering(index) : undefined), []);

  return (
    <Animated.View entering={entering}>
      <PressableScale className="mb-3" scaleTo={0.98} activeOpacity={0.9}>
        <Card animated={false}>
        {/* Company */}
        <View className="flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
            <Text className="text-sm font-bold text-primary">
              {application.job.company.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text className="flex-1 text-sm text-ink-muted" numberOfLines={1}>
            {application.job.company.name}
          </Text>
        </View>

        {/* Job title */}
        <Text className="mt-2 text-base font-semibold text-ink" numberOfLines={1}>
          {application.job.title}
        </Text>

        {/* Status badge */}
        <View className="mt-2">
          <Badge text={statusConfig.label} variant={statusConfig.variant} />
        </View>

        {/* Match score */}
        {application.match_score && (
          <View className="mt-2 flex-row items-center">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="ml-1 text-xs font-medium text-ink-muted">
              {application.match_score}% Match
            </Text>
          </View>
        )}

        {/* Dates */}
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-xs text-ink-muted">
            Applied: {format(new Date(application.applied_at), "MMM d, yyyy")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
        </Card>
      </PressableScale>
    </Animated.View>
  );
}

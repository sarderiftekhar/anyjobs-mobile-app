import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { StatusChange, ApplicationStatus } from "../../types/application";
import { format } from "date-fns";

const STATUS_ORDER: ApplicationStatus[] = [
  "applied",
  "viewed",
  "shortlisted",
  "interviewed",
  "offered",
  "accepted",
];

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  viewed: "Application Viewed",
  shortlisted: "Shortlisted",
  interviewed: "Interview",
  offered: "Offer Made",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

interface StatusTimelineProps {
  history: StatusChange[];
  currentStatus: ApplicationStatus;
}

export function StatusTimeline({ history, currentStatus }: StatusTimelineProps) {
  const completedStatuses = history.map((h) => h.status);
  const isRejected = currentStatus === "rejected";
  const isWithdrawn = currentStatus === "withdrawn";

  return (
    <View className="pl-2">
      {STATUS_ORDER.map((status, index) => {
        const historyEntry = history.find((h) => h.status === status);
        const isCompleted = completedStatuses.includes(status);
        const isCurrent = status === currentStatus;
        const isLast = index === STATUS_ORDER.length - 1;

        return (
          <View key={status} className="flex-row">
            {/* Timeline dot + line */}
            <View className="mr-4 items-center" style={{ width: 24 }}>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-success"
                    : isCurrent
                      ? "bg-primary"
                      : "bg-gray-200"
                }`}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <View
                    className={`h-2 w-2 rounded-full ${
                      isCurrent ? "bg-white" : "bg-gray-400"
                    }`}
                  />
                )}
              </View>
              {!isLast && (
                <View
                  className={`w-0.5 flex-1 ${
                    isCompleted ? "bg-success" : "bg-gray-200"
                  }`}
                  style={{ minHeight: 40 }}
                />
              )}
            </View>

            {/* Content */}
            <View className="flex-1 pb-6">
              <Text
                className={`text-sm font-semibold ${
                  isCompleted || isCurrent
                    ? "text-ink"
                    : "text-ink-muted"
                }`}
              >
                {STATUS_LABELS[status]}
              </Text>
              {historyEntry ? (
                <>
                  <Text className="mt-0.5 text-xs text-ink-muted">
                    {format(new Date(historyEntry.changed_at), "MMM d, yyyy · h:mm a")}
                  </Text>
                  {historyEntry.note && (
                    <Text className="mt-1 text-xs text-ink-muted">
                      {historyEntry.note}
                    </Text>
                  )}
                </>
              ) : (
                <Text className="mt-0.5 text-xs text-ink-muted">
                  {isCurrent ? "In progress..." : "Waiting..."}
                </Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Rejected/Withdrawn node */}
      {(isRejected || isWithdrawn) && (
        <View className="flex-row">
          <View className="mr-4 items-center" style={{ width: 24 }}>
            <View className="h-6 w-6 items-center justify-center rounded-full bg-danger">
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </View>
          </View>
          <View className="flex-1 pb-6">
            <Text className="text-sm font-semibold text-danger">
              {isRejected ? "Rejected" : "Withdrawn"}
            </Text>
            {history.find((h) => h.status === currentStatus) && (
              <Text className="mt-0.5 text-xs text-ink-muted">
                {format(
                  new Date(
                    history.find((h) => h.status === currentStatus)!.changed_at
                  ),
                  "MMM d, yyyy · h:mm a"
                )}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge, Button, LoadingSpinner, Avatar } from "../../../src/components/ui";
import {
  useInterview,
  useCancelInterview,
  useCompleteInterview,
  useStartInterview,
} from "../../../src/hooks/useInterviews";
import type { InterviewStatus } from "../../../src/types/interview";

const statusVariant = (s: InterviewStatus) =>
  s === "completed"
    ? ("success" as const)
    : s === "cancelled" || s === "no_show"
      ? ("danger" as const)
      : s === "in_progress"
        ? ("warning" as const)
        : ("info" as const);

export default function InterviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const interviewId = parseInt(id!, 10);

  const { data: interview, isLoading } = useInterview(interviewId);
  const start = useStartInterview();
  const complete = useCompleteInterview();
  const cancel = useCancelInterview();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (isLoading || !interview) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center border-b border-border px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-semibold text-text-primary">Interview</Text>
        </View>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  const dt = new Date(interview.scheduled_at);
  const dateLabel = !isNaN(dt.getTime())
    ? dt.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  const canStart = interview.status === "confirmed" || interview.status === "scheduled";
  const canComplete = interview.status === "in_progress" || interview.status === "confirmed";
  const canCancel = !["completed", "cancelled", "no_show"].includes(interview.status);

  const confirm = (label: string, onYes: () => void) =>
    Alert.alert(label, `Are you sure you want to ${label.toLowerCase()} this interview?`, [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: onYes },
    ]);

  const onStart = () =>
    confirm("Start", () =>
      start.mutate(interviewId, {
        onError: (e: any) =>
          Alert.alert("Error", e?.response?.data?.message ?? "Failed to start interview."),
      })
    );

  const onComplete = () =>
    confirm("Complete", () =>
      complete.mutate(interviewId, {
        onError: (e: any) =>
          Alert.alert("Error", e?.response?.data?.message ?? "Failed to complete interview."),
      })
    );

  const onCancelSubmit = () => {
    if (!cancelReason.trim()) {
      return Alert.alert("Reason required", "Please provide a cancellation reason.");
    }
    cancel.mutate(
      { id: interviewId, payload: { reason: cancelReason.trim() } },
      {
        onSuccess: () => {
          setCancelOpen(false);
          setCancelReason("");
          router.back();
        },
        onError: (e: any) =>
          Alert.alert("Error", e?.response?.data?.message ?? "Failed to cancel interview."),
      }
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between border-b border-border bg-white px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-text-primary">Interview</Text>
        </View>
        <Badge
          text={interview.status.replace("_", " ")}
          variant={statusVariant(interview.status)}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Candidate */}
        <Card className="mb-3">
          <View className="flex-row items-center">
            <Avatar
              name={interview.candidate?.name ?? "?"}
              uri={interview.candidate?.avatar_url ?? undefined}
              size="md"
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-text-primary">
                {interview.candidate?.name ?? "Candidate"}
              </Text>
              <Text className="text-xs text-text-secondary">
                {interview.job?.title ?? `Job #${interview.job_id}`}
              </Text>
            </View>
          </View>
        </Card>

        {/* Details */}
        <Card className="mb-3">
          <Text className="mb-2 text-xs font-semibold uppercase text-text-secondary">
            {interview.title || "Details"}
          </Text>
          <DetailRow icon="calendar-outline" label="When" value={dateLabel} />
          <DetailRow
            icon="time-outline"
            label="Duration"
            value={`${interview.duration_minutes} minutes`}
          />
          <DetailRow
            icon={
              interview.type === "video"
                ? "videocam-outline"
                : interview.type === "phone"
                  ? "call-outline"
                  : "location-outline"
            }
            label="Type"
            value={interview.type}
          />
          {interview.meeting_link ? (
            <TouchableOpacity
              className="mt-2 flex-row items-center"
              onPress={() => Linking.openURL(interview.meeting_link!)}
            >
              <Ionicons name="link-outline" size={16} color="#1E3A8A" />
              <Text
                className="ml-2 flex-1 text-sm text-primary"
                numberOfLines={1}
              >
                {interview.meeting_link}
              </Text>
            </TouchableOpacity>
          ) : null}
          {interview.location ? (
            <DetailRow icon="location-outline" label="Location" value={interview.location} />
          ) : null}
        </Card>

        {interview.description ? (
          <Card className="mb-3">
            <Text className="mb-1 text-xs font-semibold uppercase text-text-secondary">
              Notes
            </Text>
            <Text className="text-sm leading-5 text-text-secondary">
              {interview.description}
            </Text>
          </Card>
        ) : null}

        {interview.status === "cancelled" && interview.cancellation_reason ? (
          <Card className="mb-3">
            <Text className="mb-1 text-xs font-semibold uppercase text-danger">
              Cancellation reason
            </Text>
            <Text className="text-sm leading-5 text-text-secondary">
              {interview.cancellation_reason}
            </Text>
          </Card>
        ) : null}
      </ScrollView>

      {/* Actions */}
      <View
        className="border-t border-border bg-white px-4 py-3"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <View className="flex-row gap-2">
          {canStart && (
            <Button
              title="Start"
              className="flex-1"
              onPress={onStart}
              loading={start.isPending}
            />
          )}
          {canComplete && (
            <Button
              title="Complete"
              variant="secondary"
              className="flex-1"
              onPress={onComplete}
              loading={complete.isPending}
            />
          )}
        </View>
        {canCancel && (
          <View className="mt-2 flex-row gap-2">
            <Button
              title="Reschedule"
              variant="outline"
              className="flex-1"
              onPress={() =>
                router.push(`/(employer)/interviews/reschedule/${interview.id}`)
              }
            />
            <Button
              title="Cancel"
              variant="danger"
              className="flex-1"
              onPress={() => setCancelOpen(true)}
            />
          </View>
        )}
      </View>

      {/* Cancel modal */}
      <Modal
        visible={cancelOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-white p-5">
            <Text className="mb-2 text-lg font-semibold text-text-primary">
              Cancel interview
            </Text>
            <Text className="mb-3 text-sm text-text-secondary">
              Please tell the candidate why. Required.
            </Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              placeholder="Reason..."
              placeholderTextColor="#9CA3AF"
              className="min-h-[90px] rounded-md border border-border p-3 text-sm text-text-primary"
              style={{ textAlignVertical: "top" }}
            />
            <View className="mt-4 flex-row gap-2">
              <Button
                title="Back"
                variant="outline"
                className="flex-1"
                onPress={() => setCancelOpen(false)}
              />
              <Button
                title="Confirm cancel"
                variant="danger"
                className="flex-1"
                loading={cancel.isPending}
                onPress={onCancelSubmit}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="mt-1.5 flex-row items-center">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="ml-2 text-xs text-text-secondary">{label}:</Text>
      <Text className="ml-1 flex-1 text-sm capitalize text-text-primary" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

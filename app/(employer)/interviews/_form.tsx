// Shared form UI used by both schedule.tsx and reschedule/[id].tsx.
// Kept co-located under the route dir so the route group only exports
// default page components. This file is intentionally prefixed with `_`
// so expo-router ignores it as a route (leading-underscore convention).
import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { Input, Button } from "../../../src/components/ui";
import type { InterviewType } from "../../../src/types/interview";

export interface InterviewFormValues {
  title: string;
  type: InterviewType;
  scheduled_at: string; // ISO datetime
  duration: number;
  meeting_link?: string;
  location?: string;
  description?: string;
}

interface Props {
  initial?: Partial<InterviewFormValues>;
  submitLabel: string;
  showTitleField?: boolean; // hide on reschedule
  onSubmit: (values: InterviewFormValues) => void;
  submitting?: boolean;
}

const TYPES: InterviewType[] = ["video", "phone", "in-person"];

export function InterviewForm({
  initial,
  submitLabel,
  showTitleField = true,
  onSubmit,
  submitting,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<InterviewType>(initial?.type ?? "video");
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduled_at ?? "");
  const [duration, setDuration] = useState(String(initial?.duration ?? 30));
  const [meetingLink, setMeetingLink] = useState(initial?.meeting_link ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const handleSubmit = () => {
    if (showTitleField && !title.trim()) {
      return Alert.alert("Missing title", "Please enter an interview title.");
    }
    if (!scheduledAt.trim()) {
      return Alert.alert("Missing date", "Please enter a date/time (ISO 8601, e.g. 2026-05-10T14:00).");
    }
    const parsed = new Date(scheduledAt);
    if (isNaN(parsed.getTime())) {
      return Alert.alert("Invalid date", "Couldn't parse the date. Use ISO format: 2026-05-10T14:00");
    }
    if (parsed.getTime() <= Date.now()) {
      return Alert.alert("Invalid date", "Scheduled time must be in the future.");
    }
    const durationNum = parseInt(duration, 10);
    if (!durationNum || durationNum < 15 || durationNum > 480) {
      return Alert.alert("Invalid duration", "Duration must be 15-480 minutes.");
    }
    if (type === "video" && !meetingLink.trim()) {
      return Alert.alert("Meeting link required", "Video interviews require a meeting link.");
    }
    onSubmit({
      title: title.trim(),
      type,
      scheduled_at: parsed.toISOString(),
      duration: durationNum,
      meeting_link: meetingLink.trim() || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      {showTitleField && (
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Technical screen with Jane"
        />
      )}

      <Text className="mb-1.5 text-sm font-medium text-ink">Type</Text>
      <View className="mb-4 flex-row gap-2">
        {TYPES.map((t) => (
          <Button
            key={t}
            title={t === "in-person" ? "In-person" : t.charAt(0).toUpperCase() + t.slice(1)}
            variant={type === t ? "primary" : "outline"}
            size="sm"
            className="flex-1"
            onPress={() => setType(t)}
          />
        ))}
      </View>

      <Input
        label="Date & time (ISO)"
        value={scheduledAt}
        onChangeText={setScheduledAt}
        placeholder="2026-05-10T14:00"
        autoCapitalize="none"
        icon="calendar-outline"
      />

      <Input
        label="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        placeholder="30"
        icon="time-outline"
      />

      {type === "video" && (
        <Input
          label="Meeting link"
          value={meetingLink}
          onChangeText={setMeetingLink}
          placeholder="https://meet.google.com/..."
          autoCapitalize="none"
          keyboardType="url"
          icon="videocam-outline"
        />
      )}

      {type === "in-person" && (
        <Input
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="123 Main St, Office 4B"
          icon="location-outline"
        />
      )}

      <Input
        label="Notes (optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Any prep details or agenda"
        multiline
        numberOfLines={4}
        style={{ minHeight: 80, textAlignVertical: "top" }}
      />

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={submitting}
        size="lg"
        className="mt-2"
      />
    </ScrollView>
  );
}

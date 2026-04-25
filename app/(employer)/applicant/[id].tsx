import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApplicantDetail, useUpdateApplicantStatus } from "../../../src/hooks/useEmployer";
import { Avatar, Badge, Button, Card, LoadingSpinner } from "../../../src/components/ui";

export default function ApplicantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const applicantId = parseInt(id!, 10);

  const { data: applicant, isLoading } = useApplicantDetail(applicantId);
  const updateStatus = useUpdateApplicantStatus();

  const handleAction = (status: string, label: string) => {
    Alert.alert(`${label} Applicant`, `Mark this applicant as ${label.toLowerCase()}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: label,
        onPress: () => updateStatus.mutate({ id: applicantId, status }),
      },
    ]);
  };

  if (isLoading || !applicant) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">Applicant Details</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Profile header */}
        <View className="items-center pb-6">
          <Avatar name={applicant.candidate.name} uri={applicant.candidate.avatar_url} size="xl" />
          <Text className="mt-3 text-xl font-bold text-ink">{applicant.candidate.name}</Text>
          <Text className="text-sm text-ink-muted">{applicant.candidate.title ?? "Candidate"}</Text>
          {applicant.candidate.location && (
            <View className="mt-1 flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#6B7F94" />
              <Text className="ml-1 text-sm text-ink-muted">{applicant.candidate.location}</Text>
            </View>
          )}
        </View>

        {/* Match & status */}
        <View className="flex-row items-center justify-center gap-4 pb-6">
          <View className="items-center rounded-md bg-primary-light px-4 py-2">
            <Text className="text-2xl font-bold text-primary">{applicant.match_score}%</Text>
            <Text className="text-xs text-primary">Match Score</Text>
          </View>
          <View className="items-center">
            <Badge text={applicant.status} variant={applicant.status === "shortlisted" ? "success" : applicant.status === "rejected" ? "danger" : "info"} />
            <Text className="mt-1 text-xs text-ink-muted">Current Status</Text>
          </View>
        </View>

        {/* Applied for */}
        <Card className="mb-3">
          <Text className="text-xs font-semibold uppercase text-ink-muted">Applied For</Text>
          <Text className="mt-1 text-base font-semibold text-ink">{applicant.job_title}</Text>
          <Text className="text-xs text-ink-muted">
            Applied {new Date(applicant.applied_at).toLocaleDateString()}
          </Text>
        </Card>

        {/* Skills */}
        {applicant.candidate.skills.length > 0 && (
          <Card className="mb-3">
            <Text className="text-xs font-semibold uppercase text-ink-muted">Skills</Text>
            <View className="mt-2 flex-row flex-wrap gap-1.5">
              {applicant.candidate.skills.map((skill) => (
                <Badge key={skill} text={skill} variant="primary" />
              ))}
            </View>
          </Card>
        )}

        {/* Cover letter */}
        {applicant.cover_letter && (
          <Card className="mb-3">
            <Text className="text-xs font-semibold uppercase text-ink-muted">Cover Letter</Text>
            <Text className="mt-2 text-sm leading-6 text-ink-muted">{applicant.cover_letter}</Text>
          </Card>
        )}

        {/* CV link */}
        {applicant.cv_url && (
          <Card className="mb-3">
            <TouchableOpacity className="flex-row items-center">
              <Ionicons name="document-text" size={20} color="#0064EC" />
              <Text className="ml-2 text-sm font-medium text-primary">View Resume / CV</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Contact */}
        <Card>
          <Text className="text-xs font-semibold uppercase text-ink-muted">Contact</Text>
          <View className="mt-2 flex-row items-center">
            <Ionicons name="mail-outline" size={16} color="#6B7F94" />
            <Text className="ml-2 text-sm text-ink-muted">{applicant.candidate.email}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom actions */}
      <View className="flex-row gap-2 border-t border-border bg-white px-4 py-3" style={{ paddingBottom: insets.bottom + 8 }}>
        {applicant.status === "applied" && (
          <>
            <Button title="Shortlist" className="flex-1" onPress={() => handleAction("shortlisted", "Shortlist")} />
            <Button title="Reject" variant="danger" className="flex-1" onPress={() => handleAction("rejected", "Reject")} />
          </>
        )}
        {applicant.status === "shortlisted" && (
          <>
            <Button title="Schedule Interview" className="flex-1" onPress={() => handleAction("interviewed", "Interview")} />
            <Button title="Reject" variant="outline" className="flex-1" onPress={() => handleAction("rejected", "Reject")} />
          </>
        )}
        <TouchableOpacity
          className="items-center justify-center rounded-md border border-primary px-4"
          onPress={() => router.push(`/(employer)/chat/${applicant.candidate.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#0064EC" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

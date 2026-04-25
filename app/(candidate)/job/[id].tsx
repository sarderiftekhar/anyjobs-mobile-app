import { View, Text, ScrollView, TouchableOpacity, Share } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useJobDetail, useSaveJob, useUnsaveJob } from "../../../src/hooks/useJobs";
import { Card, Badge, Button, LoadingSpinner } from "../../../src/components/ui";
import { MatchScoreCard } from "../../../src/components/ai/MatchScoreCard";
import { formatDistanceToNow } from "date-fns";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const jobId = parseInt(id!, 10);

  const { data: job, isLoading, isError } = useJobDetail(jobId);
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  const handleSave = () => {
    if (!job) return;
    if (job.is_saved) unsaveJob.mutate(job.id);
    else saveJob.mutate(job.id);
  };

  const handleShare = async () => {
    if (!job) return;
    await Share.share({
      message: `Check out this job: ${job.title} at ${job.company.name}\nhttps://anyjobs.com/jobs/${job.id}`,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <LoadingSpinner fullScreen message="Loading job..." />
      </View>
    );
  }

  if (isError || !job) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ paddingTop: insets.top }}>
        <Text className="text-ink-muted">Failed to load job details.</Text>
        <Button title="Go Back" variant="outline" className="mt-4" onPress={() => router.back()} />
      </View>
    );
  }

  const salaryText = job.salary
    ? `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}/${job.salary.period === "yearly" ? "yr" : job.salary.period}`
    : null;

  const postedAgo = job.posted_at
    ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })
    : "";

  return (
    <View className="flex-1 bg-background">
      {/* Brand-tinted hero header — back/save/share + company + title */}
      <View
        className="bg-primary-light px-4 pb-12"
        style={{ paddingTop: insets.top + 8 }}
      >
        {/* Action row */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
          >
            <Ionicons name="arrow-back" size={20} color="#1A2230" />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleSave}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            >
              <Ionicons
                name={job.is_saved ? "heart" : "heart-outline"}
                size={20}
                color={job.is_saved ? "#EF4444" : "#1A2230"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            >
              <Ionicons name="share-outline" size={20} color="#1A2230" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Company logo + name */}
        <View className="mt-5 flex-row items-center">
          <View
            className="mr-3 h-14 w-14 items-center justify-center rounded-2xl bg-white"
            style={{ shadowColor: "#0A2540", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
          >
            <Text className="text-base font-bold text-primary">
              {job.company.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink" numberOfLines={1}>
              {job.company.name}
            </Text>
            {job.company.industry && (
              <Text className="text-xs text-ink-soft" numberOfLines={1}>
                {job.company.industry}
              </Text>
            )}
          </View>
        </View>

        {/* Title */}
        <Text className="mt-4 text-2xl font-bold text-ink leading-7">{job.title}</Text>

        {/* Featured / Urgent */}
        {(job.is_featured || job.is_urgent) && (
          <View className="mt-2 flex-row gap-2">
            {job.is_featured && <Badge text="Featured" variant="warning" />}
            {job.is_urgent && <Badge text="Urgent Hiring" variant="danger" />}
          </View>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Meta card — overlaps hero edge */}
        <View
          className="-mt-7 mx-4 rounded-2xl border border-border bg-surface p-4"
          style={{ shadowColor: "#0A2540", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 3 }, elevation: 3 }}
        >
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#6B7F94" />
            <Text className="ml-1.5 text-sm text-ink-soft">{job.location}</Text>
          </View>
          <View className="mt-2 flex-row items-center">
            <Ionicons name="briefcase-outline" size={16} color="#6B7F94" />
            <Text className="ml-1.5 text-sm text-ink-soft">
              {job.job_type.join(", ")} · {job.work_arrangement}
            </Text>
          </View>
          {salaryText && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="cash-outline" size={16} color="#0064EC" />
              <Text className="ml-1.5 text-sm font-semibold text-ink">{salaryText}</Text>
            </View>
          )}
          {job.experience_level && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="trending-up-outline" size={16} color="#6B7F94" />
              <Text className="ml-1.5 text-sm text-ink-soft">{job.experience_level}</Text>
            </View>
          )}
          <View className="mt-2 flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#6B7F94" />
            <Text className="ml-1.5 text-sm text-ink-soft">Posted {postedAgo}</Text>
          </View>
          {job.application_deadline && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="alarm-outline" size={16} color="#EF4444" />
              <Text className="ml-1.5 text-sm text-danger">
                Deadline: {new Date(job.application_deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Body content — padded */}
        <View className="px-4">

        {/* Skills */}
        {job.skills.length > 0 && (
          <View className="mt-4 flex-row flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <Badge key={skill} text={skill} variant="primary" />
            ))}
          </View>
        )}

        {/* AI match score */}
        <MatchScoreCard jobId={job.id} />

        {/* Divider */}
        <View className="my-6 border-t border-border" />

        {/* Description */}
        <Text className="text-lg font-semibold text-ink">About this role</Text>
        <Text className="mt-2 text-sm leading-6 text-ink-muted">{job.description}</Text>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-ink">Requirements</Text>
            {job.requirements.map((req, i) => (
              <View key={i} className="mt-2 flex-row items-start">
                <Text className="mr-2 text-primary">•</Text>
                <Text className="flex-1 text-sm text-ink-muted">{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-ink">Responsibilities</Text>
            {job.responsibilities.map((resp, i) => (
              <View key={i} className="mt-2 flex-row items-start">
                <Text className="mr-2 text-primary">•</Text>
                <Text className="flex-1 text-sm text-ink-muted">{resp}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-ink">Benefits</Text>
            {job.benefits.map((benefit, i) => (
              <View key={i} className="mt-2 flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text className="ml-2 text-sm text-ink-muted">{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Company info card */}
        <Card className="mt-6 bg-background" variant="flat">
          <Text className="text-base font-semibold text-ink">
            About {job.company.name}
          </Text>
          {job.company.industry && (
            <Text className="mt-1 text-sm text-ink-muted">
              Industry: {job.company.industry}
            </Text>
          )}
          {job.company.size && (
            <Text className="text-sm text-ink-muted">Size: {job.company.size}</Text>
          )}
          {job.company.website && (
            <Text className="text-sm text-primary">{job.company.website}</Text>
          )}
        </Card>
        </View>
      </ScrollView>

      {/* Sticky apply bar */}
      <View
        className="border-t border-border bg-white px-4 py-3"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        {job.has_applied ? (
          <View className="flex-row items-center justify-center rounded-full bg-success/10 py-3.5">
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            <Text className="ml-2 text-base font-semibold text-success">
              Already Applied
            </Text>
          </View>
        ) : (
          <Button
            title="Apply Now"
            size="lg"
            onPress={() => router.push(`/(candidate)/apply/${job.id}`)}
          />
        )}
      </View>
    </View>
  );
}

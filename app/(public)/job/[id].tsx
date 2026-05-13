import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useJobDetail } from "../../../src/hooks/useJobs";
import { Card, Badge, Button, LoadingSpinner } from "../../../src/components/ui";
import { formatDistanceToNow } from "date-fns";

export default function PublicJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const jobId = parseInt(id!, 10);

  const { data: job, isLoading, isError } = useJobDetail(jobId);

  const goToLogin = (action: string) => {
    Alert.alert(
      "Sign in required",
      `Create an account or sign in to ${action} this job.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/(auth)/login") },
        { text: "Sign up", onPress: () => router.push("/(auth)/register") },
      ]
    );
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
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-ink-muted">Failed to load job details.</Text>
        <Button
          title="Go Back"
          variant="outline"
          className="mt-4"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const salaryText = job.salary
    ? `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}/${
        job.salary.period === "yearly" ? "yr" : job.salary.period
      }`
    : null;

  const postedAgo = job.posted_at
    ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })
    : "";

  return (
    <View className="flex-1 bg-background">
      {/* Hero */}
      <View className="bg-primary-light px-4 pb-6" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(public)/jobs")
            }
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
          >
            <Ionicons name="arrow-back" size={20} color="#1A2230" />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => goToLogin("save")}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            >
              <Ionicons name="heart-outline" size={20} color="#1A2230" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            >
              <Ionicons name="share-outline" size={20} color="#1A2230" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-5 flex-row items-center">
          <View
            className="mr-3 h-14 w-14 items-center justify-center rounded-2xl bg-white"
            style={{
              shadowColor: "#0A2540",
              shadowOpacity: 0.08,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
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

        <Text className="mt-4 text-2xl font-bold text-ink leading-7">{job.title}</Text>

        {(job.is_featured || job.is_urgent) && (
          <View className="mt-2 flex-row gap-2">
            {job.is_featured && <Badge text="Featured" variant="warning" />}
            {job.is_urgent && <Badge text="Urgent Hiring" variant="danger" />}
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mt-4 mx-4 rounded-2xl border border-border bg-surface p-4"
          style={{
            shadowColor: "#0A2540",
            shadowOpacity: 0.06,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
          }}
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
        </View>

        <View className="px-4">
          {job.skills.length > 0 && (
            <View className="mt-4 flex-row flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <Badge key={skill} text={skill} variant="primary" />
              ))}
            </View>
          )}

          <View className="my-6 border-t border-border" />

          <Text className="text-lg font-semibold text-ink">About this role</Text>
          <Text className="mt-2 text-sm leading-6 text-ink-muted">{job.description}</Text>

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

      {/* Sticky apply bar — auth-gated */}
      <View
        className="border-t border-border bg-white px-4 pt-4"
        style={{ paddingBottom: insets.bottom + 48 }}
      >
        <View style={{ alignSelf: "center", width: "100%", maxWidth: 480 }}>
          <Button
            title="Sign in to Apply"
            size="lg"
            icon={<Ionicons name="log-in-outline" size={18} color="#fff" />}
            onPress={() => goToLogin("apply for")}
          />
        </View>
      </View>
    </View>
  );
}

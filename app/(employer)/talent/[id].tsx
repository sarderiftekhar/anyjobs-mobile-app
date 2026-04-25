import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { talentApi } from "../../../src/api/talent";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingSpinner,
} from "../../../src/components/ui";

export default function TalentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const candidateId = Number(id);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["talent", "detail", candidateId],
    queryFn: () => talentApi.getById(candidateId),
    enabled: Number.isFinite(candidateId),
  });

  const startChat = useMutation({
    mutationFn: (text: string) => talentApi.startConversation(candidateId, text),
    onSuccess: (res) => {
      const conversationId = res.data.data?.conversation_id;
      if (conversationId) {
        router.push(`/(employer)/chat/${conversationId}`);
      } else {
        Alert.alert("Message sent", "A message was sent to this candidate.");
      }
    },
    onError: () => {
      Alert.alert("Could not open chat", "Please try again later.");
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading candidate..." />;
  }

  if (isError || !data?.candidate) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <Header onBack={() => router.back()} title="Candidate" />
        <EmptyState
          icon="person-remove-outline"
          title="Candidate not found"
          description="We couldn't load this profile."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const c = data.candidate;
  const p = c.profile;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Header onBack={() => router.back()} title="Candidate" />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <Card>
          <View className="items-center">
            <Avatar name={c.name} uri={c.avatar ?? undefined} size="xl" />
            <Text className="mt-3 text-xl font-bold text-ink">
              {c.name}
            </Text>
            <Text className="text-sm text-ink-muted">
              {p.professional_title || "Candidate"}
            </Text>
            {p.current_company ? (
              <Text className="text-xs text-ink-muted">
                at {p.current_company}
              </Text>
            ) : null}

            <View className="mt-2 flex-row flex-wrap justify-center gap-2">
              {p.city ? (
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={14} color="#6B7F94" />
                  <Text className="ml-1 text-xs text-ink-muted">
                    {p.city}
                    {p.country ? `, ${p.country}` : ""}
                  </Text>
                </View>
              ) : null}
              {p.years_experience ? (
                <View className="flex-row items-center">
                  <Ionicons name="briefcase-outline" size={14} color="#6B7F94" />
                  <Text className="ml-1 text-xs text-ink-muted">
                    {p.years_experience} yrs
                  </Text>
                </View>
              ) : null}
              {p.open_to_work ? (
                <Badge text="Open to work" variant="success" />
              ) : null}
            </View>
          </View>

          <View className="mt-4 flex-row gap-2">
            <Button
              title="Message"
              size="sm"
              className="flex-1"
              loading={startChat.isPending}
              icon={<Ionicons name="chatbubble-outline" size={16} color="#fff" />}
              onPress={() =>
                startChat.mutate(
                  `Hi ${c.name.split(" ")[0] || ""}, I came across your profile and would like to connect.`
                )
              }
            />
          </View>
        </Card>

        {/* Summary */}
        {p.professional_summary ? (
          <Section title="Summary">
            <Text className="text-sm leading-5 text-ink">
              {p.professional_summary}
            </Text>
          </Section>
        ) : null}

        {/* Skills */}
        {c.skills?.length > 0 && (
          <Section title="Skills">
            <View className="flex-row flex-wrap gap-2">
              {c.skills.map((s, i) => (
                <Badge
                  key={`${s.name}-${i}`}
                  text={s.name}
                  variant="primary"
                />
              ))}
            </View>
          </Section>
        )}

        {/* Experience */}
        {c.experience?.length > 0 && (
          <Section title="Experience">
            {c.experience.map((e, i) => (
              <View
                key={i}
                className={`${i > 0 ? "mt-3 border-t border-gray-100 pt-3" : ""}`}
              >
                <Text className="text-sm font-semibold text-ink">
                  {e.job_title}
                </Text>
                <Text className="text-xs text-ink-muted">
                  {e.company_name}
                </Text>
                <Text className="mt-0.5 text-[11px] text-ink-muted">
                  {formatDate(e.start_date)} –{" "}
                  {e.is_current ? "Present" : formatDate(e.end_date)}
                </Text>
                {e.description ? (
                  <Text
                    className="mt-1 text-xs text-ink-muted"
                    numberOfLines={4}
                  >
                    {e.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </Section>
        )}

        {/* Education */}
        {c.education?.length > 0 && (
          <Section title="Education">
            {c.education.map((e, i) => (
              <View
                key={i}
                className={`${i > 0 ? "mt-3 border-t border-gray-100 pt-3" : ""}`}
              >
                <Text className="text-sm font-semibold text-ink">
                  {e.degree ?? "Degree"}
                  {e.field_of_study ? ` · ${e.field_of_study}` : ""}
                </Text>
                <Text className="text-xs text-ink-muted">
                  {e.institution}
                </Text>
                <Text className="mt-0.5 text-[11px] text-ink-muted">
                  {formatDate(e.start_date)} – {formatDate(e.end_date)}
                  {e.grade ? ` · ${e.grade}` : ""}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {/* Certifications */}
        {c.certifications?.length > 0 && (
          <Section title="Certifications">
            {c.certifications.map((cert, i) => (
              <View
                key={i}
                className={`${i > 0 ? "mt-2 border-t border-gray-100 pt-2" : ""}`}
              >
                <Text className="text-sm font-semibold text-ink">
                  {cert.name}
                </Text>
                {cert.issuing_organization ? (
                  <Text className="text-xs text-ink-muted">
                    {cert.issuing_organization}
                  </Text>
                ) : null}
              </View>
            ))}
          </Section>
        )}

        {/* Languages */}
        {c.languages?.length > 0 && (
          <Section title="Languages">
            <View className="flex-row flex-wrap gap-2">
              {c.languages.map((l, i) => (
                <Badge
                  key={`${l.language}-${i}`}
                  text={`${l.language}${l.proficiency_level ? ` · ${l.proficiency_level}` : ""}`}
                  variant="gray"
                />
              ))}
            </View>
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View className="flex-row items-center border-b border-border bg-white px-4 py-3">
      <TouchableOpacity
        className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-background"
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={20} color="#1A2230" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-ink">{title}</Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm font-bold text-ink">{title}</Text>
      <Card>{children}</Card>
    </View>
  );
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.valueOf())) return d;
  return dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

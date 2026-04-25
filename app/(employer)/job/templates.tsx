import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge, Button } from "../../../src/components/ui";
import { aiApi } from "../../../src/api/ai";
import type { JobTemplate } from "../../../src/types/ai";

// Built-in fallback templates — shown if backend has no templates endpoint yet.
// Keeps the screen useful even before the server feature ships.
const FALLBACK_TEMPLATES: JobTemplate[] = [
  {
    id: "fb-1",
    title: "Senior Frontend Engineer",
    description:
      "We are looking for a Senior Frontend Engineer to lead development of our web products using React and TypeScript.",
    category: "Engineering",
    skills: ["React", "TypeScript", "Next.js", "CSS"],
    requirements: [
      "5+ years of frontend experience",
      "Strong React/TypeScript skills",
      "Experience shipping production web apps",
    ],
    benefits: ["Remote", "Stock options", "Learning budget"],
    experience_level: "Senior",
    work_arrangement: "remote",
    job_type: ["full-time"],
  },
  {
    id: "fb-2",
    title: "Product Designer",
    description:
      "Join our design team to craft intuitive user experiences across web and mobile.",
    category: "Design",
    skills: ["Figma", "User Research", "Prototyping"],
    requirements: [
      "3+ years of product design",
      "Strong portfolio",
      "Experience with design systems",
    ],
    benefits: ["Remote-friendly", "Design conference budget"],
    experience_level: "Mid Level",
    work_arrangement: "hybrid",
    job_type: ["full-time"],
  },
  {
    id: "fb-3",
    title: "Customer Success Manager",
    description:
      "Build long-term relationships with our customers and help them get the most from our platform.",
    category: "Customer",
    skills: ["Communication", "CRM", "SaaS"],
    requirements: [
      "2+ years in customer success or account management",
      "Excellent written and verbal communication",
    ],
    benefits: ["Bonus scheme", "Flexible hours"],
    experience_level: "Mid Level",
    work_arrangement: "hybrid",
    job_type: ["full-time"],
  },
];

export default function JobTemplatesScreen() {
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [genPrompt, setGenPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await aiApi.listTemplates();
      const data = res.data.data ?? [];
      // Merge with fallbacks so the screen is always populated.
      setTemplates([...data, ...FALLBACK_TEMPLATES]);
    } catch {
      setTemplates(FALLBACK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await aiApi.generateTemplate({ prompt: genPrompt.trim() });
      const tpl = res.data.data;
      if (tpl) {
        setTemplates((prev) => [{ ...tpl, is_ai_generated: true }, ...prev]);
        setGenPrompt("");
      }
    } catch {
      Alert.alert("Error", "Could not generate template. Try again later.");
    } finally {
      setGenerating(false);
    }
  };

  const useTemplate = (t: JobTemplate) => {
    // Pass template as params — create screen reads them to pre-fill.
    router.push({
      pathname: "/(employer)/job/create",
      params: {
        template: JSON.stringify(t),
      },
    });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#1A2230" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-ink">Job Templates</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Generate new template */}
        <View className="border-b border-border px-4 py-4">
          <View className="flex-row items-center">
            <Ionicons name="sparkles" size={16} color="#0064EC" />
            <Text className="ml-1.5 text-sm font-semibold text-ink">
              Generate a new template
            </Text>
          </View>
          <TextInput
            className="mt-2 rounded-md border border-border px-3 py-2.5 text-sm text-ink"
            placeholder="e.g. DevOps engineer, mid-level, EU remote"
            value={genPrompt}
            onChangeText={setGenPrompt}
          />
          <Button
            title="Generate"
            className="mt-2"
            loading={generating}
            onPress={handleGenerate}
          />
        </View>

        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#0064EC" />
          </View>
        ) : (
          <View className="px-4 pt-4">
            {templates.map((t) => (
              <Card key={String(t.id)} className="mb-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-semibold text-ink">
                      {t.title}
                    </Text>
                    {t.category && (
                      <Text className="text-xs text-ink-muted">{t.category}</Text>
                    )}
                  </View>
                  {t.is_ai_generated && (
                    <Badge text="AI" variant="primary" />
                  )}
                </View>
                <Text
                  className="mt-2 text-sm text-ink-muted"
                  numberOfLines={3}
                >
                  {t.description}
                </Text>
                {t.skills && t.skills.length > 0 && (
                  <View className="mt-2 flex-row flex-wrap gap-1.5">
                    {t.skills.slice(0, 5).map((s) => (
                      <Badge key={s} text={s} variant="primary" />
                    ))}
                  </View>
                )}
                <Button
                  title="Use template"
                  variant="outline"
                  className="mt-3"
                  onPress={() => useTemplate(t)}
                />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

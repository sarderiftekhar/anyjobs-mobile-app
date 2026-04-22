import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge } from "../ui";
import { aiApi } from "../../api/ai";
import type { MatchJobResult } from "../../types/ai";

/**
 * Shows AI match score + brief reasoning for the current candidate vs. a job.
 * Fails silently (renders nothing) — this is an enhancement, not core.
 */
export function MatchScoreCard({ jobId }: { jobId: number }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MatchJobResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await aiApi.matchJob(jobId);
        if (!mounted) return;
        setData(res.data.data ?? null);
      } catch {
        if (mounted) setFailed(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  if (failed) return null;

  if (loading) {
    return (
      <Card className="mt-4 bg-primary-light/20">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#1E3A8A" />
          <Text className="ml-2 text-sm text-text-secondary">
            Calculating match score...
          </Text>
        </View>
      </Card>
    );
  }

  if (!data) return null;

  const scoreColor =
    data.score >= 80 ? "#22C55E" : data.score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <Card className="mt-4">
      <View className="flex-row items-center">
        <Ionicons name="sparkles" size={16} color="#1E3A8A" />
        <Text className="ml-1.5 text-base font-semibold text-text-primary">
          AI Match Score
        </Text>
      </View>
      <View className="mt-3 flex-row items-center">
        <Text className="text-3xl font-bold" style={{ color: scoreColor }}>
          {Math.round(data.score)}%
        </Text>
        <View className="ml-4 flex-1">
          <View className="h-2 rounded-full bg-gray-200">
            <View
              className="h-2 rounded-full"
              style={{ width: `${Math.min(100, data.score)}%`, backgroundColor: scoreColor }}
            />
          </View>
        </View>
      </View>
      {data.reasoning && (
        <Text className="mt-3 text-sm text-text-secondary">{data.reasoning}</Text>
      )}
      {data.missing_skills && data.missing_skills.length > 0 && (
        <View className="mt-3">
          <Text className="text-xs font-medium text-text-primary">Skills to add</Text>
          <View className="mt-1.5 flex-row flex-wrap gap-1.5">
            {data.missing_skills.slice(0, 6).map((s) => (
              <Badge key={s} text={s} variant="warning" />
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

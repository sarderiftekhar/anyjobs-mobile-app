import { useRef, useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "../animation/PressableScale";
import { listItemEntering } from "../animation/entrance";
import type { Job } from "../../types/job";
import { formatDistanceToNow } from "date-fns";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";

interface JobCardProps {
  job: Job;
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
  onApply?: (jobId: number) => void;
  onPress?: (jobId: number) => void;
  showApplyButton?: boolean;
  index?: number;
}

export function JobCard({
  job,
  onSaveToggle,
  onApply,
  onPress,
  showApplyButton = true,
  index = 0,
}: JobCardProps) {
  // Entrance runs once, on mount (staggered by list index, capped).
  const entering = useMemo(() => listItemEntering(index), []);

  // Little "pop" on the heart when the job becomes saved (not on first render).
  const heartScale = useSharedValue(1);
  const wasSaved = useRef(!!job.is_saved);
  useEffect(() => {
    const saved = !!job.is_saved;
    if (saved && !wasSaved.current) {
      heartScale.value = withSequence(
        withTiming(1.3, { duration: 110, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 7, stiffness: 320, mass: 0.6, reduceMotion: ReduceMotion.System })
      );
    }
    wasSaved.current = saved;
  }, [job.is_saved, heartScale]);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const postedAgo = job.posted_at
    ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })
    : "";

  const salaryText = job.salary
    ? `${job.salary.currency} ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k / ${job.salary.period === "yearly" ? "yr" : job.salary.period}`
    : null;

  return (
    <Animated.View entering={entering} style={[s.cardWrap, shadows.card]}>
      <PressableScale
        scaleTo={0.975}
        accessibilityRole="button"
        onPress={() =>
          onPress
            ? onPress(job.id)
            : router.push(`/(candidate)/job/${job.id}`)
        }
      >
        <View style={s.card}>
          {/* Company row */}
          <View style={s.row}>
            <View style={s.companyRow}>
              <View style={s.companyLogo}>
                <Text style={s.companyLogoText}>
                  {job.company.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={s.companyName} numberOfLines={1}>{job.company.name}</Text>
            </View>
            {onSaveToggle && (
              <PressableScale
                onPress={() => onSaveToggle(job.id, !!job.is_saved)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={s.saveBtn}
                scaleTo={0.88}
                accessibilityRole="button"
                accessibilityLabel={job.is_saved ? "Remove from saved jobs" : "Save job"}
              >
                <Animated.View style={heartStyle}>
                  <Ionicons
                    name={job.is_saved ? "heart" : "heart-outline"}
                    size={18}
                    color={job.is_saved ? colors.danger : colors.ink.muted}
                  />
                </Animated.View>
              </PressableScale>
            )}
          </View>

          {/* Title */}
          <Text style={s.title} numberOfLines={2}>{job.title}</Text>

          {/* Location */}
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.ink.muted} />
            <Text style={s.locationText} numberOfLines={1}>{job.location}</Text>
            <View style={s.dot} />
            <Text style={s.locationText}>{job.work_arrangement}</Text>
          </View>

          {/* Featured / Urgent */}
          {(job.is_featured || job.is_urgent) && (
            <View style={s.badgeRow}>
              {job.is_featured && (
                <View style={[s.badge, { backgroundColor: "#FFF7ED" }]}>
                  <Text style={[s.badgeText, { color: "#B45309" }]}>Featured</Text>
                </View>
              )}
              {job.is_urgent && (
                <View style={[s.badge, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={[s.badgeText, { color: "#DC2626" }]}>Urgent</Text>
                </View>
              )}
            </View>
          )}

          {/* Skills */}
          {job.skills.length > 0 && (
            <View style={s.skillsRow}>
              {job.skills.slice(0, 4).map((skill) => (
                <View key={skill} style={s.skillBadge}>
                  <Text style={s.skillText}>{skill}</Text>
                </View>
              ))}
              {job.skills.length > 4 && (
                <View style={[s.skillBadge, { backgroundColor: colors.background }]}>
                  <Text style={[s.skillText, { color: colors.ink.muted }]}>+{job.skills.length - 4}</Text>
                </View>
              )}
            </View>
          )}

          {/* Divider */}
          <View style={s.divider} />

          {/* Salary & date */}
          <View style={s.row}>
            <Text style={s.salary}>{salaryText ?? "Salary not disclosed"}</Text>
            <Text style={s.postedDate}>{postedAgo}</Text>
          </View>

          {/* Apply */}
          {job.has_applied ? (
            <View style={s.appliedBanner}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={s.appliedText}>Applied</Text>
            </View>
          ) : showApplyButton ? (
            <PressableScale
              style={s.applyBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              onPress={() => {
                if (onApply) onApply(job.id);
                else router.push(`/(candidate)/apply/${job.id}`);
              }}
            >
              <Text style={s.applyBtnText}>Quick Apply</Text>
            </PressableScale>
          ) : null}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cardWrap: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  companyLogoText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary.DEFAULT,
  },
  companyName: {
    fontSize: 14,
    color: colors.ink.muted,
    fontWeight: "500",
    flex: 1,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink.DEFAULT,
    marginTop: 14,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: colors.ink.muted,
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginHorizontal: 6,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primary.light,
  },
  skillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  salary: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink.DEFAULT,
  },
  postedDate: {
    fontSize: 12,
    color: colors.ink.muted,
  },
  appliedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  appliedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#16A34A",
  },
  applyBtn: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

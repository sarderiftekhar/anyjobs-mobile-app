import { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Job } from "../../types/job";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
  onApply?: (jobId: number) => void;
  showApplyButton?: boolean;
  index?: number;
}

export function JobCard({
  job,
  onSaveToggle,
  onApply,
  showApplyButton = true,
  index = 0,
}: JobCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: Math.min(index * 100, 400),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 4,
        delay: Math.min(index * 100, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  };

  const postedAgo = job.posted_at
    ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })
    : "";

  const salaryText = job.salary
    ? `${job.salary.currency} ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k / ${job.salary.period === "yearly" ? "yr" : job.salary.period}`
    : null;

  return (
    <Animated.View
      style={[
        s.cardWrap,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => router.push(`/(candidate)/job/${job.id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
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
              <TouchableOpacity
                onPress={() => onSaveToggle(job.id, !!job.is_saved)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={s.saveBtn}
              >
                <Ionicons
                  name={job.is_saved ? "heart" : "heart-outline"}
                  size={18}
                  color={job.is_saved ? "#EF4444" : "#C0C0C0"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text style={s.title} numberOfLines={2}>{job.title}</Text>

          {/* Location */}
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={13} color="#9CA3AF" />
            <Text style={s.locationText} numberOfLines={1}>{job.location}</Text>
            <View style={s.dot} />
            <Text style={s.locationText}>{job.work_arrangement}</Text>
          </View>

          {/* Featured / Urgent */}
          {(job.is_featured || job.is_urgent) && (
            <View style={s.badgeRow}>
              {job.is_featured && (
                <View style={[s.badge, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
                  <Text style={[s.badgeText, { color: "#B45309" }]}>Featured</Text>
                </View>
              )}
              {job.is_urgent && (
                <View style={[s.badge, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
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
                <View style={[s.skillBadge, { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" }]}>
                  <Text style={[s.skillText, { color: "#6B7280" }]}>+{job.skills.length - 4}</Text>
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
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={s.appliedText}>Applied</Text>
            </View>
          ) : showApplyButton ? (
            <TouchableOpacity
              style={s.applyBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (onApply) onApply(job.id);
                else router.push(`/(candidate)/apply/${job.id}`);
              }}
            >
              <Text style={s.applyBtnText}>Quick Apply</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cardWrap: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F0F0F0",
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
    backgroundColor: "#F0EEFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  companyLogoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#574BA6",
  },
  companyName: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
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
    color: "#9CA3AF",
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
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
    borderRadius: 20,
    borderWidth: 1,
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
    borderRadius: 20,
    backgroundColor: "#F0EEFF",
    borderWidth: 1,
    borderColor: "#DDD8FF",
  },
  skillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#574BA6",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginVertical: 14,
  },
  salary: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  postedDate: {
    fontSize: 12,
    color: "#B0B0B0",
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
    backgroundColor: "#574BA6",
    borderRadius: 14,
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

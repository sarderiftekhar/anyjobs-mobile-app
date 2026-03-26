import { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../ui/Button";
import { LocationInput } from "../ui/LocationInput";
import type { JobFilters, JobType, WorkArrangement } from "../../types/job";

interface FilterModalProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  filters: JobFilters;
  onApply: (filters: JobFilters) => void;
  resultCount?: number;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
];

const WORK_ARRANGEMENTS: { value: WorkArrangement; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
];

const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead", "Executive"];

const DATE_POSTED_OPTIONS: { value: string; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "Any time" },
];

function ChipSelect<T extends string>({
  options,
  selected,
  onToggle,
  multi = true,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  multi?: boolean;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt.value);
        return (
          <TouchableOpacity
            key={opt.value}
            className={`rounded-full border px-3.5 py-2 ${
              isActive ? "border-primary bg-primary" : "border-border bg-white"
            }`}
            onPress={() => onToggle(opt.value)}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? "text-white" : "text-text-secondary"
              }`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function FilterModal({
  bottomSheetRef,
  filters: initialFilters,
  onApply,
  resultCount,
}: FilterModalProps) {
  const snapPoints = useMemo(() => ["85%"], []);
  const [localFilters, setLocalFilters] = useState<JobFilters>(initialFilters);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const toggleJobType = (type: JobType) => {
    const current = localFilters.job_types ?? [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setLocalFilters({ ...localFilters, job_types: updated });
  };

  const toggleWorkArrangement = (wa: WorkArrangement) => {
    const current = localFilters.work_arrangements ?? [];
    const updated = current.includes(wa)
      ? current.filter((w) => w !== wa)
      : [...current, wa];
    setLocalFilters({ ...localFilters, work_arrangements: updated });
  };

  const setExperienceLevel = (level: string) => {
    setLocalFilters({
      ...localFilters,
      experience_level: localFilters.experience_level === level ? undefined : level,
    });
  };

  const setDatePosted = (value: string) => {
    setLocalFilters({
      ...localFilters,
      date_posted: value as JobFilters["date_posted"],
    });
  };

  const resetFilters = () => {
    setLocalFilters({ q: initialFilters.q });
  };

  const handleApply = () => {
    onApply(localFilters);
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ borderRadius: 20 }}
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-text-primary">Filters</Text>
          <TouchableOpacity onPress={resetFilters}>
            <Text className="text-sm font-medium text-primary">Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <Text className="mb-2 text-sm font-semibold text-text-primary">Location</Text>
        <LocationInput
          value={localFilters.location ?? ""}
          onSelect={(loc) => setLocalFilters({ ...localFilters, location: loc || undefined })}
          placeholder="Search city, region..."
          compact
        />

        {/* Job Type */}
        <Text className="mb-2 mt-5 text-sm font-semibold text-text-primary">Job Type</Text>
        <ChipSelect
          options={JOB_TYPES}
          selected={localFilters.job_types ?? []}
          onToggle={toggleJobType}
        />

        {/* Work Arrangement */}
        <Text className="mb-2 mt-5 text-sm font-semibold text-text-primary">
          Work Arrangement
        </Text>
        <ChipSelect
          options={WORK_ARRANGEMENTS}
          selected={localFilters.work_arrangements ?? []}
          onToggle={toggleWorkArrangement}
        />

        {/* Salary Range */}
        <Text className="mb-2 mt-5 text-sm font-semibold text-text-primary">
          Salary Range
        </Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 rounded-md border border-border bg-white px-3 py-2.5">
            <Text className="text-xs text-text-secondary">Min</Text>
            <Text className="text-sm font-medium text-text-primary">
              {localFilters.salary_min ? `£${localFilters.salary_min / 1000}k` : "Any"}
            </Text>
          </View>
          <Text className="text-text-secondary">—</Text>
          <View className="flex-1 rounded-md border border-border bg-white px-3 py-2.5">
            <Text className="text-xs text-text-secondary">Max</Text>
            <Text className="text-sm font-medium text-text-primary">
              {localFilters.salary_max ? `£${localFilters.salary_max / 1000}k` : "Any"}
            </Text>
          </View>
        </View>

        {/* Quick salary presets */}
        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {[
            { min: 0, max: 30000, label: "<£30k" },
            { min: 30000, max: 50000, label: "£30-50k" },
            { min: 50000, max: 80000, label: "£50-80k" },
            { min: 80000, max: 120000, label: "£80-120k" },
            { min: 120000, max: 0, label: "£120k+" },
          ].map((preset) => {
            const isActive =
              localFilters.salary_min === preset.min &&
              localFilters.salary_max === (preset.max || undefined);
            return (
              <TouchableOpacity
                key={preset.label}
                className={`rounded-full border px-2.5 py-1.5 ${
                  isActive ? "border-primary bg-primary-light" : "border-border bg-white"
                }`}
                onPress={() =>
                  setLocalFilters({
                    ...localFilters,
                    salary_min: preset.min || undefined,
                    salary_max: preset.max || undefined,
                  })
                }
              >
                <Text
                  className={`text-xs font-medium ${
                    isActive ? "text-primary" : "text-text-secondary"
                  }`}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Experience Level */}
        <Text className="mb-2 mt-5 text-sm font-semibold text-text-primary">
          Experience Level
        </Text>
        <ChipSelect
          options={EXPERIENCE_LEVELS.map((l) => ({ value: l, label: l }))}
          selected={localFilters.experience_level ? [localFilters.experience_level] : []}
          onToggle={setExperienceLevel}
        />

        {/* Date Posted */}
        <Text className="mb-2 mt-5 text-sm font-semibold text-text-primary">
          Date Posted
        </Text>
        <ChipSelect
          options={DATE_POSTED_OPTIONS}
          selected={localFilters.date_posted ? [localFilters.date_posted] : ["all"]}
          onToggle={setDatePosted}
        />

        {/* Apply button */}
        <Button
          title={
            resultCount !== undefined
              ? `Show ${resultCount} Results`
              : "Apply Filters"
          }
          size="lg"
          className="mt-8"
          onPress={handleApply}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

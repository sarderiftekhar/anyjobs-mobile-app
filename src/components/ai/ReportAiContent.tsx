import { useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { safetyApi, type AiReportReason } from "../../api/safety";
import { ReportSheet, type ReportReasonOption } from "../safety/ReportSheet";

const AI_REPORT_REASONS: ReportReasonOption<AiReportReason>[] = [
  { value: "offensive", label: "Offensive or harmful" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "inaccurate", label: "Wrong or misleading" },
  { value: "other", label: "Something else" },
];

/**
 * "Report AI content" link shown under AI-generated text (Google Play's
 * AI-generated content policy: users must be able to flag it in-app).
 */
export function ReportAiContent({
  feature,
  content,
  className = "",
}: {
  /** Where the text came from, e.g. "cover_letter", "job_description". */
  feature: string;
  content: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!content.trim()) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className={`flex-row items-center self-start py-2 ${className}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Report AI-generated content"
      >
        <Ionicons name="flag-outline" size={14} color="#6B7F94" />
        <Text className="ml-1.5 text-xs font-medium text-ink-muted">Report AI content</Text>
      </TouchableOpacity>
      <ReportSheet
        visible={open}
        title="Report AI-generated content"
        subtitle="Tell us what's wrong. We use reports to improve the AI."
        reasons={AI_REPORT_REASONS}
        onClose={() => setOpen(false)}
        onSubmit={async (reason, details) => {
          await safetyApi.reportAiContent(feature, content, reason, details || undefined);
          setOpen(false);
          Alert.alert("Thanks for reporting", "We'll review this AI response.");
        }}
      />
    </>
  );
}

import { useState } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { safetyApi, type ReportReason } from "../../api/safety";
import { ReportSheet, type ReportReasonOption } from "./ReportSheet";

export const USER_REPORT_REASONS: ReportReasonOption<ReportReason>[] = [
  { value: "harassment", label: "Harassment or abuse" },
  { value: "spam", label: "Spam or scam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fake", label: "Fake profile or job" },
  { value: "other", label: "Something else" },
];

/**
 * "Report / Block" for another person (Google Play UGC policy). Render
 * `element` once in the screen and call `openMenu()` from a header button.
 */
export function useUserSafety(
  user: { id: number; name: string } | null | undefined,
  opts: { onBlocked?: () => void } = {},
) {
  const qc = useQueryClient();
  const [reporting, setReporting] = useState(false);

  const block = () => {
    if (!user) return;
    Alert.alert(
      `Block ${user.name}?`,
      "They won't be able to message you, and you won't see your conversation with them. You can unblock them in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              await safetyApi.block(user.id);
              qc.invalidateQueries({ queryKey: ["messages", "conversations"] });
              qc.invalidateQueries({ queryKey: ["blocked-users"] });
              Alert.alert("Blocked", `You won't hear from ${user.name} again.`);
              opts.onBlocked?.();
            } catch (e: any) {
              Alert.alert("Couldn't block", e?.response?.data?.message ?? "Please try again.");
            }
          },
        },
      ],
    );
  };

  const openMenu = () => {
    if (!user) return;
    Alert.alert(user.name, undefined, [
      { text: "Report", onPress: () => setReporting(true) },
      { text: "Block", style: "destructive", onPress: block },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const element = (
    <ReportSheet
      visible={reporting}
      title={user ? `Report ${user.name}` : "Report"}
      subtitle="Reports are confidential. Our team reviews every one."
      reasons={USER_REPORT_REASONS}
      onClose={() => setReporting(false)}
      onSubmit={async (reason, details) => {
        if (!user) return;
        await safetyApi.reportUser(user.id, reason, details || undefined);
        setReporting(false);
        Alert.alert("Thanks for reporting", "Our team will review this.");
      }}
    />
  );

  return { openMenu, element };
}

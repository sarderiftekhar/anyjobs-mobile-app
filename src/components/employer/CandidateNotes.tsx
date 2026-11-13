import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { candidateNotesApi } from "../../api/candidateNotes";
import { isUpgradeRequired, planLimitMessage } from "../../lib/apiErrors";
import { Button, Card } from "../ui";

/**
 * Private team notes on a candidate (the website's candidate notebook).
 * Professional plan and up; otherwise a quiet "not in your plan" card.
 */
export function CandidateNotes({ candidateId }: { candidateId: number }) {
  const qc = useQueryClient();
  const key = ["candidate-notes", candidateId];
  const [draft, setDraft] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => candidateNotesApi.list(candidateId),
    enabled: Number.isFinite(candidateId),
    retry: (count, err) => !isUpgradeRequired(err) && count < 2,
  });

  const add = useMutation({
    mutationFn: (body: string) => candidateNotesApi.add(candidateId, body),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e: any) => Alert.alert("Couldn't save note", e?.response?.data?.message ?? "Please try again."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => candidateNotesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: () => Alert.alert("Couldn't delete note", "Please try again."),
  });

  const confirmRemove = (id: number) =>
    Alert.alert("Delete note?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(id) },
    ]);

  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center">
        <Ionicons name="document-text-outline" size={16} color="#1A2230" />
        <Text className="ml-1.5 text-sm font-bold text-ink">Team notes</Text>
        <Text className="ml-2 text-xs text-ink-muted">Only your team sees these</Text>
      </View>

      <Card animated={false}>
        {isUpgradeRequired(error) ? (
          <View className="flex-row items-center">
            <Ionicons name="lock-closed-outline" size={16} color="#6B7F94" />
            <Text className="ml-2 flex-1 text-sm text-ink-muted">{planLimitMessage(error)}</Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator color="#0064EC" />
        ) : (
          <>
            <TextInput
              className="min-h-[64px] rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm text-ink"
              placeholder="Add a note about this candidate…"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              maxLength={5000}
              value={draft}
              onChangeText={setDraft}
            />
            <View className="mt-2 self-end">
              <Button
                title="Add note"
                size="sm"
                disabled={!draft.trim()}
                loading={add.isPending}
                onPress={() => add.mutate(draft.trim())}
              />
            </View>

            {error ? <Text className="mt-3 text-sm text-red-600">Couldn't load notes.</Text> : null}

            {data?.length ? (
              data.map((n) => (
                <View key={`${n.kind}-${n.id}`} className="mt-3 border-t border-gray-100 pt-3">
                  <View className="flex-row items-center">
                    <Text className="flex-1 text-xs font-semibold text-ink">{n.author.name}</Text>
                    <Text className="text-[11px] text-ink-muted">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </Text>
                    {n.can_delete ? (
                      <TouchableOpacity
                        onPress={() => confirmRemove(n.id)}
                        className="ml-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="Delete note"
                      >
                        <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <Text className="mt-1 text-sm leading-5 text-ink">{n.body}</Text>
                </View>
              ))
            ) : !error ? (
              <Text className="mt-3 text-xs text-ink-muted">No notes yet.</Text>
            ) : null}
          </>
        )}
      </Card>
    </View>
  );
}

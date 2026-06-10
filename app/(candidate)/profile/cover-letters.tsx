import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Card, Badge, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import { ScreenHeader } from "../../../src/components/form";
import {
  useCoverLetters,
  useCreateCoverLetter,
  useUpdateCoverLetter,
  useDeleteCoverLetter,
  useSetDefaultCoverLetter,
} from "../../../src/hooks/useCoverLetters";
import type { CoverLetter } from "../../../src/types/user";

export default function CoverLettersScreen() {
  const insets = useSafeAreaInsets();
  const { data: letters, isLoading } = useCoverLetters();
  const create = useCreateCoverLetter();
  const update = useUpdateCoverLetter();
  const remove = useDeleteCoverLetter();
  const setDefault = useSetDefaultCoverLetter();

  const [editing, setEditing] = useState<CoverLetter | "new" | null>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const openNew = () => {
    setEditing("new");
    setName("");
    setContent("");
  };
  const openEdit = (l: CoverLetter) => {
    setEditing(l);
    setName(l.name);
    setContent(l.content);
  };

  const save = async () => {
    if (!name.trim() || !content.trim()) {
      Alert.alert("Missing fields", "Give your cover letter a name and content.");
      return;
    }
    try {
      if (editing === "new") {
        await create.mutateAsync({ name, content });
      } else if (editing) {
        await update.mutateAsync({ id: editing.id, payload: { name, content } });
      }
      setEditing(null);
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.response?.data?.message ?? "Please try again.");
    }
  };

  const confirmDelete = (l: CoverLetter) =>
    Alert.alert("Delete cover letter", `Delete "${l.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(l.id) },
    ]);

  if (editing) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          <ScreenHeader title={editing === "new" ? "New Cover Letter" : "Edit Cover Letter"} onBack={() => setEditing(null)} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
          <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Default, Design roles" />
          <Input
            label="Content"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={12}
            style={{ minHeight: 240, textAlignVertical: "top" }}
            placeholder="Write your cover letter..."
          />
        </ScrollView>
        <View className="absolute inset-x-0 bottom-0 border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
          <Button title="Save" loading={create.isPending || update.isPending} onPress={save} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Cover Letters"
          right={
            <TouchableOpacity onPress={openNew} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="add-circle" size={26} color="#0064EC" />
            </TouchableOpacity>
          }
        />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading cover letters..." />
      ) : !letters || letters.length === 0 ? (
        <EmptyState icon="document-text-outline" title="No cover letters" description="Save reusable cover letters to apply faster." actionTitle="Create one" onAction={openNew} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          {letters.map((l) => (
            <Card key={l.id} className="mb-3" animated={false}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>{l.name}</Text>
                {l.is_default && <Badge text="Default" variant="primary" />}
              </View>
              <Text className="text-sm text-ink-muted" numberOfLines={2}>{l.content}</Text>
              <View className="mt-3 flex-row items-center">
                <TouchableOpacity className="mr-5 flex-row items-center" onPress={() => openEdit(l)}>
                  <Ionicons name="create-outline" size={16} color="#3A4F64" />
                  <Text className="ml-1 text-sm text-ink-soft">Edit</Text>
                </TouchableOpacity>
                {!l.is_default && (
                  <TouchableOpacity className="mr-5 flex-row items-center" onPress={() => setDefault.mutate(l.id)}>
                    <Ionicons name="star-outline" size={16} color="#3A4F64" />
                    <Text className="ml-1 text-sm text-ink-soft">Set default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity className="flex-row items-center" onPress={() => confirmDelete(l)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text className="ml-1 text-sm text-danger">Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Card, EmptyState } from "../../../src/components/ui";
import { ScreenHeader } from "../../../src/components/form";
import { useAuthStore } from "../../../src/stores/authStore";
import { useUpdateReferences } from "../../../src/hooks/useProfile";
import type { ReferenceEntry } from "../../../src/types/user";

export default function ReferencesScreen() {
  const insets = useSafeAreaInsets();
  const existing = useAuthStore((s) => s.user?.profile?.references) ?? [];
  const [items, setItems] = useState<ReferenceEntry[]>(() => existing.map((r) => ({ ...r })));
  const mutation = useUpdateReferences();

  const update = (i: number, k: keyof ReferenceEntry, v: string) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const add = () => setItems((arr) => [...arr, { name: "" }]);
  const remove = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  const onSave = async () => {
    const cleaned = items.filter((r) => r.name.trim());
    try {
      await mutation.mutateAsync(cleaned);
      router.back();
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.response?.data?.message ?? "Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="References" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        {items.length === 0 ? (
          <EmptyState icon="people-outline" title="No references yet" description="Add professional references employers can contact." actionTitle="Add reference" onAction={add} />
        ) : (
          items.map((r, i) => (
            <Card key={i} className="mb-3" animated={false}>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-ink-muted">Reference {i + 1}</Text>
                <TouchableOpacity onPress={() => remove(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Input label="Name" value={r.name} onChangeText={(v) => update(i, "name", v)} placeholder="Jane Smith" autoCapitalize="words" />
              <Input label="Relationship" value={r.relationship ?? ""} onChangeText={(v) => update(i, "relationship", v)} placeholder="Former manager" />
              <Input label="Company" value={r.company ?? ""} onChangeText={(v) => update(i, "company", v)} />
              <Input label="Email" value={r.email ?? ""} onChangeText={(v) => update(i, "email", v)} keyboardType="email-address" icon="mail-outline" />
              <Input label="Phone" value={r.phone ?? ""} onChangeText={(v) => update(i, "phone", v)} keyboardType="phone-pad" icon="call-outline" />
            </Card>
          ))
        )}
        {items.length > 0 && (
          <Button title="Add another" variant="outline" icon={<Ionicons name="add" size={18} color="#0064EC" />} onPress={add} />
        )}
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button title="Save" loading={mutation.isPending} onPress={onSave} />
      </View>
    </View>
  );
}

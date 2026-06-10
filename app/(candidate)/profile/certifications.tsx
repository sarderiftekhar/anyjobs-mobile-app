import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Card, EmptyState } from "../../../src/components/ui";
import { ScreenHeader } from "../../../src/components/form";
import { useAuthStore } from "../../../src/stores/authStore";
import { useUpdateCertifications } from "../../../src/hooks/useProfile";
import type { CertificationEntry } from "../../../src/types/user";

export default function CertificationsScreen() {
  const insets = useSafeAreaInsets();
  const existing = useAuthStore((s) => s.user?.profile?.certifications) ?? [];
  const [items, setItems] = useState<CertificationEntry[]>(() => existing.map((c) => ({ ...c })));
  const mutation = useUpdateCertifications();

  const update = (i: number, k: keyof CertificationEntry, v: string) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const add = () => setItems((arr) => [...arr, { name: "" }]);
  const remove = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  const onSave = async () => {
    const cleaned = items.filter((c) => c.name.trim());
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
        <ScreenHeader title="Certifications" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        {items.length === 0 ? (
          <EmptyState icon="ribbon-outline" title="No certifications yet" description="Add your professional certifications to stand out." actionTitle="Add certification" onAction={add} />
        ) : (
          items.map((c, i) => (
            <Card key={i} className="mb-3" animated={false}>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-ink-muted">Certification {i + 1}</Text>
                <TouchableOpacity onPress={() => remove(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Input label="Name" value={c.name} onChangeText={(v) => update(i, "name", v)} placeholder="AWS Solutions Architect" />
              <Input label="Issuer" value={c.issuer ?? ""} onChangeText={(v) => update(i, "issuer", v)} placeholder="Amazon" />
              <Input label="Year" value={c.year ?? ""} onChangeText={(v) => update(i, "year", v)} keyboardType="number-pad" placeholder="2024" />
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

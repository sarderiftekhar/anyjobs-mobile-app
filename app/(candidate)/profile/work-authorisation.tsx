import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, EmptyState, LoadingSpinner, Select } from "../../../src/components/ui";
import { ScreenHeader, ChipSelect } from "../../../src/components/form";
import { profileApi } from "../../../src/api/profile";
import { publicApiClient } from "../../../src/api/client";
import type { Country } from "../../../src/types/profileExtras";

const MAX_ROWS = 10; // backend limit for both lists

type Row = { country_id: string; status: string };

/**
 * "Where can you work?" — mirrors the web profile's WorkAuthorisationEditor.
 * Employers see it on applications; candidates who need sponsorship are
 * pointed at jobs that offer it.
 */
export default function WorkAuthorisationScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile", "work-authorisation"],
    queryFn: profileApi.getWorkAuthorisation,
  });
  const { data: countries } = useQuery({
    queryKey: ["location", "countries"],
    queryFn: () =>
      publicApiClient
        .get<{ data: Country[] }>("/location/countries")
        .then((r) => r.data.data ?? []),
    staleTime: Infinity,
  });

  const [rows, setRows] = useState<Row[]>([]);
  const [relocation, setRelocation] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    setRows(data.items.map((i) => ({ ...i })));
    setRelocation(data.relocation_countries);
  }, [data]);

  const countryOptions = useMemo(
    () => (countries ?? []).map((c) => ({ value: String(c.id), label: c.name })),
    [countries],
  );
  const countryName = (id: string) => countryOptions.find((c) => c.value === id)?.label ?? "";
  const statuses = data?.statuses ?? [];

  const save = useMutation({
    mutationFn: () =>
      profileApi.updateWorkAuthorisation({
        authorisations: rows
          .filter((r) => r.country_id && r.status)
          .map((r) => ({ country_id: Number(r.country_id), status: r.status })),
        relocation_countries: relocation.map(Number),
      }),
    onSuccess: (fresh) => {
      qc.setQueryData(["profile", "work-authorisation"], fresh);
      router.back();
    },
    onError: (e: any) =>
      Alert.alert("Couldn't save", e?.response?.data?.message ?? "Please try again."),
  });

  const update = (i: number, patch: Partial<Row>) =>
    setRows((arr) => arr.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = () => setRows((arr) => [...arr, { country_id: "", status: statuses[0]?.value ?? "" }]);
  const remove = (i: number) => setRows((arr) => arr.filter((_, idx) => idx !== i));

  const onSave = () => {
    const ids = rows.filter((r) => r.country_id).map((r) => r.country_id);
    if (new Set(ids).size !== ids.length) {
      Alert.alert("Duplicate country", "Each country can only be listed once.");
      return;
    }
    save.mutate();
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Where you can work" />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load"
          description="Check your connection and try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-4 text-sm leading-5 text-ink-muted">
            Tell employers which countries you can work in. It's shown on your applications.
          </Text>

          {rows.length === 0 ? (
            <EmptyState
              icon="globe-outline"
              title="No countries yet"
              description="Add the countries you're allowed to work in."
              actionTitle="Add country"
              onAction={add}
            />
          ) : (
            rows.map((r, i) => (
              <Card key={i} className="mb-3" animated={false}>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-ink-muted">Country {i + 1}</Text>
                  <TouchableOpacity
                    onPress={() => remove(i)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Remove country"
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Select
                  label="Country"
                  placeholder="Choose a country"
                  value={r.country_id}
                  options={countryOptions}
                  searchable
                  onChange={(v) => update(i, { country_id: v })}
                />
                <Text className="mb-2 text-sm font-medium text-ink">Your status there</Text>
                <ChipSelect
                  options={statuses}
                  value={r.status ? [r.status] : []}
                  onChange={(next) => update(i, { status: next[0] ?? "" })}
                  multiple={false}
                />
              </Card>
            ))
          )}
          {rows.length > 0 && rows.length < MAX_ROWS && (
            <Button
              title="Add another country"
              variant="outline"
              icon={<Ionicons name="add" size={18} color="#0064EC" />}
              onPress={add}
            />
          )}

          <Text className="mb-1 mt-8 text-base font-semibold text-ink">Open to relocating to</Text>
          <Text className="mb-3 text-sm text-ink-muted">Optional. Up to {MAX_ROWS} countries.</Text>
          {relocation.map((id) => (
            <View
              key={id}
              className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-white px-4"
              style={{ minHeight: 48 }}
            >
              <Text className="text-sm text-ink">{countryName(id) || `Country #${id}`}</Text>
              <TouchableOpacity
                onPress={() => setRelocation((arr) => arr.filter((x) => x !== id))}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Remove relocation country"
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
          {relocation.length < MAX_ROWS && (
            <Select
              placeholder="Add a country"
              value=""
              options={countryOptions.filter((c) => !relocation.includes(c.value))}
              searchable
              icon="add-circle-outline"
              onChange={(v) => v && setRelocation((arr) => [...arr, v])}
            />
          )}
        </ScrollView>
      )}

      {!isLoading && !isError && (
        <View
          className="absolute inset-x-0 bottom-0 border-t border-border bg-surface px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button title="Save" loading={save.isPending} onPress={onSave} />
        </View>
      )}
    </View>
  );
}

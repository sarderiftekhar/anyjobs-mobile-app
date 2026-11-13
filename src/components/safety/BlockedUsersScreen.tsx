import { View, Text, FlatList, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safetyApi, type BlockedUser } from "../../api/safety";
import { ScreenHeader } from "../form";
import { Avatar, Button, Card, EmptyState, LoadingSpinner } from "../ui";

/** Settings → Blocked users: everyone you've blocked, with Unblock. */
export function BlockedUsersScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: safetyApi.blockedUsers,
  });

  const unblock = useMutation({
    mutationFn: (id: number) => safetyApi.unblock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocked-users"] });
      qc.invalidateQueries({ queryKey: ["messages", "conversations"] });
    },
    onError: () => Alert.alert("Couldn't unblock", "Please try again."),
  });

  const confirmUnblock = (u: BlockedUser) =>
    Alert.alert(`Unblock ${u.name}?`, "They'll be able to message you again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Unblock", onPress: () => unblock.mutate(u.id) },
    ]);

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Blocked users" />
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
      ) : !data?.length ? (
        <EmptyState
          icon="shield-checkmark-outline"
          title="No one blocked"
          description="People you block from a chat appear here. They can't message you."
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => (
            <Card className="mb-3" animated={false}>
              <View className="flex-row items-center">
                <Avatar name={item.name} uri={item.avatar_url ?? undefined} size="sm" />
                <Text className="ml-3 flex-1 text-sm font-semibold text-ink" numberOfLines={1}>
                  {item.name}
                </Text>
                <Button
                  title="Unblock"
                  size="sm"
                  variant="outline"
                  loading={unblock.isPending && unblock.variables === item.id}
                  onPress={() => confirmUnblock(item)}
                />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button, Card, LoadingSpinner, EmptyState } from "../../../src/components/ui";
import {
  useCompany,
  useCompanyGallery,
  useDeleteGalleryImage,
  useReorderGallery,
  useUploadBanner,
  useUploadGalleryImage,
  useUploadLogo,
} from "../../../src/hooks/useCompany";
import type { CompanyGalleryImage } from "../../../src/types/company";

// Launch the OS photo library and return the chosen asset (or null if the user
// cancels / denies permission).
async function pickImageAsset(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      "Photo access needed",
      "Allow photo library access in Settings to upload images."
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

// Build a multipart payload from a picked asset. Backend field names:
// logo -> "logo", banner -> "banner", gallery -> "image".
function assetToFormData(
  asset: ImagePicker.ImagePickerAsset,
  field: "logo" | "banner" | "image"
): FormData {
  const name = asset.fileName ?? asset.uri.split("/").pop() ?? `${field}.jpg`;
  const type = asset.mimeType ?? "image/jpeg";
  const form = new FormData();
  // RN FormData accepts the { uri, name, type } file shape.
  form.append(field, { uri: asset.uri, name, type } as any);
  return form;
}

export default function CompanyGalleryScreen() {
  const insets = useSafeAreaInsets();
  const { data: company } = useCompany();
  const { data: gallery, isLoading } = useCompanyGallery();

  const uploadLogo = useUploadLogo();
  const uploadBanner = useUploadBanner();
  const uploadImage = useUploadGalleryImage();
  const deleteImage = useDeleteGalleryImage();
  const reorder = useReorderGallery();

  // Local order state so up/down buttons are snappy; persists on "Save order".
  const [localOrder, setLocalOrder] = useState<CompanyGalleryImage[] | null>(
    null
  );
  const items = useMemo<CompanyGalleryImage[]>(
    () => localOrder ?? gallery ?? [],
    [localOrder, gallery]
  );

  const handleUpload = async (target: "logo" | "banner" | "gallery") => {
    const asset = await pickImageAsset();
    if (!asset) return;
    try {
      if (target === "logo") {
        await uploadLogo.mutateAsync(assetToFormData(asset, "logo"));
      } else if (target === "banner") {
        await uploadBanner.mutateAsync(assetToFormData(asset, "banner"));
      } else {
        await uploadImage.mutateAsync(assetToFormData(asset, "image"));
      }
    } catch {
      Alert.alert("Upload failed", "Could not upload the image. Please try again.");
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLocalOrder(next);
  };

  const saveOrder = async () => {
    if (!localOrder) return;
    try {
      await reorder.mutateAsync(localOrder.map((i) => i.id));
      setLocalOrder(null);
      Alert.alert("Saved", "Gallery order updated.");
    } catch {
      Alert.alert("Error", "Could not save order.");
    }
  };

  const remove = (id: number | string) => {
    Alert.alert("Delete image?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteImage.mutate(id),
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">
          Gallery & Images
        </Text>
      </View>

      {/* Logo */}
      <Card className="mx-4 mt-2">
        <Text className="mb-2 text-sm font-semibold text-ink">Logo</Text>
        <View className="flex-row items-center">
          <View className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
            {company?.logo_url ? (
              <Image
                source={{ uri: company.logo_url }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={28} color="#9CA3AF" />
              </View>
            )}
          </View>
          <View className="ml-4 flex-1">
            <Button
              title="Change logo"
              variant="outline"
              size="sm"
              onPress={() => handleUpload("logo")}
              loading={uploadLogo.isPending}
            />
          </View>
        </View>
      </Card>

      {/* Banner */}
      <Card className="mx-4 mt-3">
        <Text className="mb-2 text-sm font-semibold text-ink">
          Banner
        </Text>
        <View className="mb-3 h-28 w-full overflow-hidden rounded-xl bg-gray-100">
          {company?.banner_url ? (
            <Image
              source={{ uri: company.banner_url }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={28} color="#9CA3AF" />
            </View>
          )}
        </View>
        <Button
          title="Change banner"
          variant="outline"
          size="sm"
          onPress={() => handleUpload("banner")}
          loading={uploadBanner.isPending}
        />
      </Card>

      {/* Gallery grid */}
      <View className="mx-4 mt-3 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-ink">
          Gallery
        </Text>
        <TouchableOpacity
          onPress={() => handleUpload("gallery")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add-circle" size={28} color="#0064EC" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon="images-outline"
          title="No images yet"
          description="Upload photos of your workspace, team and events."
        />
      ) : (
        <View className="mx-4 mt-2">
          {items.map((img, i) => (
            <View
              key={img.id}
              className="mb-2 flex-row items-center rounded-xl bg-white p-2"
              style={{ borderWidth: 1, borderColor: "#F3F4F6" }}
            >
              <Image
                source={{ uri: img.url }}
                style={{ width: 72, height: 72, borderRadius: 10 }}
              />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-ink-muted" numberOfLines={2}>
                  {img.caption ?? `Image ${i + 1}`}
                </Text>
              </View>
              <TouchableOpacity
                className="p-2"
                onPress={() => move(i, -1)}
                disabled={i === 0}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={i === 0 ? "#D1D5DB" : "#0064EC"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2"
                onPress={() => move(i, 1)}
                disabled={i === items.length - 1}
              >
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color={i === items.length - 1 ? "#D1D5DB" : "#0064EC"}
                />
              </TouchableOpacity>
              <TouchableOpacity className="p-2" onPress={() => remove(img.id)}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}

          {localOrder && (
            <Button
              title="Save order"
              onPress={saveOrder}
              loading={reorder.isPending}
              className="mt-2"
            />
          )}
        </View>
      )}

      {uploadImage.isPending && (
        <Text className="mt-3 text-center text-xs text-ink-muted">
          Uploading…
        </Text>
      )}
    </ScrollView>
  );
}

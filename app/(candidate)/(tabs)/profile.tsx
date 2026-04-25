import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "../../../src/stores/authStore";
import {
  useUpdateProfile,
  useAddExperience,
  useDeleteExperience,
  useAddEducation,
  useDeleteEducation,
} from "../../../src/hooks/useProfile";
import { Avatar, Card, Badge, Button } from "../../../src/components/ui";
import type { Experience, Education } from "../../../src/types/user";
import { format } from "date-fns";

function ExperienceModal({
  visible,
  onClose,
  onSave,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      company: "",
      location: "",
      start_date: "",
      description: "",
      is_current: false,
    },
  });

  const submit = (data: any) => {
    onSave(data);
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white p-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-ink">Add Experience</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#1A2230" />
          </TouchableOpacity>
        </View>

        <ScrollView className="mt-6" showsVerticalScrollIndicator={false}>
          <Controller
            control={control}
            name="title"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="mb-1.5 text-sm font-medium text-ink">Job Title *</Text>
                <TextInput
                  className="rounded-md border border-border px-3 py-3 text-base text-ink"
                  placeholder="e.g. Frontend Developer"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="company"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="mb-1.5 text-sm font-medium text-ink">Company *</Text>
                <TextInput
                  className="rounded-md border border-border px-3 py-3 text-base text-ink"
                  placeholder="e.g. TechCorp"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="mb-1.5 text-sm font-medium text-ink">Location</Text>
                <TextInput
                  className="rounded-md border border-border px-3 py-3 text-base text-ink"
                  placeholder="e.g. London, UK"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="start_date"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="mb-1.5 text-sm font-medium text-ink">Start Date *</Text>
                <TextInput
                  className="rounded-md border border-border px-3 py-3 text-base text-ink"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="mb-1.5 text-sm font-medium text-ink">Description</Text>
                <TextInput
                  className="min-h-[100px] rounded-md border border-border px-3 py-3 text-base text-ink"
                  placeholder="Describe your responsibilities..."
                  value={value}
                  onChangeText={onChange}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            )}
          />
        </ScrollView>

        <Button title="Save" loading={isLoading} onPress={handleSubmit(submit)} />
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const addExperience = useAddExperience();
  const deleteExperience = useDeleteExperience();
  const addEducation = useAddEducation();
  const deleteEducation = useDeleteEducation();

  const [showExpModal, setShowExpModal] = useState(false);

  const handleAddExperience = async (data: any) => {
    try {
      await addExperience.mutateAsync(data);
      setShowExpModal(false);
    } catch {
      Alert.alert("Error", "Failed to add experience.");
    }
  };

  const handleDeleteExperience = (id: number) => {
    Alert.alert("Delete Experience", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteExperience.mutate(id),
      },
    ]);
  };

  // Calculate profile strength
  const strengthItems = [
    !!user?.profile?.title,
    !!user?.profile?.bio,
    (user?.experiences?.length ?? 0) > 0,
    (user?.educations?.length ?? 0) > 0,
    (user?.skills?.length ?? 0) > 0,
    !!user?.profile?.avatar_url,
  ];
  const strengthPercent = Math.round(
    (strengthItems.filter(Boolean).length / strengthItems.length) * 100
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand-tinted hero — avatar + identity */}
      <View
        className="bg-primary-light px-4 pb-12"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-end">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            onPress={() => router.push("/(candidate)/settings")}
          >
            <Ionicons name="settings-outline" size={20} color="#1A2230" />
          </TouchableOpacity>
        </View>

        <View className="mt-2 items-center">
          <View
            className="rounded-full bg-white p-1.5"
            style={{ shadowColor: "#0A2540", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
          >
            <Avatar name={user?.name} size="xl" uri={user?.profile?.avatar_url} />
          </View>
          <Text className="mt-3 text-xl font-bold text-ink">{user?.name}</Text>
          <Text className="mt-0.5 text-sm text-ink-soft">
            {user?.profile?.title ?? "Add your professional title"}
          </Text>
          {user?.profile?.location && (
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#3A4F64" />
              <Text className="ml-1 text-sm text-ink-soft">
                {user.profile.location}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats row — overlaps the hero edge */}
      <View
        className="-mt-7 mx-4 flex-row rounded-2xl border border-border bg-surface p-4"
        style={{ shadowColor: "#0A2540", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 3 }, elevation: 3 }}
      >
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-primary">0</Text>
          <Text className="mt-0.5 text-xs font-medium text-ink-muted">Applications</Text>
        </View>
        <View className="mx-2 w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-primary">0</Text>
          <Text className="mt-0.5 text-xs font-medium text-ink-muted">Saved</Text>
        </View>
        <View className="mx-2 w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-primary">0</Text>
          <Text className="mt-0.5 text-xs font-medium text-ink-muted">Interviews</Text>
        </View>
      </View>

      {/* Profile strength */}
      <Card className="mx-4 mt-4" delay={50}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="trending-up" size={18} color="#0064EC" />
            <Text className="ml-2 text-sm font-semibold text-ink">
              Profile Strength
            </Text>
          </View>
          <Text className="text-base font-bold text-primary">{strengthPercent}%</Text>
        </View>
        <View className="mt-3 h-2 rounded-full bg-primary/10 overflow-hidden">
          <View
            className="h-2 rounded-full bg-primary"
            style={{ width: `${strengthPercent}%` }}
          />
        </View>
        {strengthPercent < 100 && (
          <Text className="mt-2.5 text-xs text-ink-muted">
            {!user?.profile?.title && "Add a professional title. "}
            {(user?.experiences?.length ?? 0) === 0 && "Add work experience. "}
            {(user?.skills?.length ?? 0) === 0 && "Add your skills. "}
          </Text>
        )}
      </Card>

      {/* Experience section */}
      <Card className="mx-4 mt-4" delay={120}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">Experience</Text>
          <TouchableOpacity onPress={() => setShowExpModal(true)}>
            <Ionicons name="add-circle-outline" size={22} color="#0064EC" />
          </TouchableOpacity>
        </View>
        {user?.experiences && user.experiences.length > 0 ? (
          user.experiences.map((exp) => (
            <View key={exp.id} className="mt-3 border-t border-gray-100 pt-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink">
                    {exp.title}
                  </Text>
                  <Text className="text-xs text-ink-muted">
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </Text>
                  <Text className="text-xs text-ink-muted">
                    {exp.start_date} — {exp.is_current ? "Present" : exp.end_date}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteExperience(exp.id)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
              {exp.description && (
                <Text className="mt-1 text-xs text-ink-muted" numberOfLines={2}>
                  {exp.description}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text className="mt-2 text-sm text-ink-muted">
            Add your work experience to stand out to employers.
          </Text>
        )}
      </Card>

      {/* Education section */}
      <Card className="mx-4 mt-3" delay={180}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">Education</Text>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={22} color="#0064EC" />
          </TouchableOpacity>
        </View>
        {user?.educations && user.educations.length > 0 ? (
          user.educations.map((edu) => (
            <View key={edu.id} className="mt-3 border-t border-gray-100 pt-3">
              <Text className="text-sm font-semibold text-ink">
                {edu.degree} {edu.field ? `in ${edu.field}` : ""}
              </Text>
              <Text className="text-xs text-ink-muted">
                {edu.school} · {edu.start_date} — {edu.end_date ?? "Present"}
              </Text>
            </View>
          ))
        ) : (
          <Text className="mt-2 text-sm text-ink-muted">
            Add your education background.
          </Text>
        )}
      </Card>

      {/* Skills section */}
      <Card className="mx-4 mt-3" delay={240}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">Skills</Text>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={22} color="#0064EC" />
          </TouchableOpacity>
        </View>
        {user?.skills && user.skills.length > 0 ? (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {user.skills.map((skill) => (
              <Badge key={skill.id} text={skill.name} variant="primary" />
            ))}
          </View>
        ) : (
          <Text className="mt-2 text-sm text-ink-muted">
            Add your skills to match with relevant jobs.
          </Text>
        )}
      </Card>

      {/* Bio section */}
      <Card className="mx-4 mt-3" delay={300}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">About</Text>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color="#0064EC" />
          </TouchableOpacity>
        </View>
        <Text className="mt-2 text-sm text-ink-muted">
          {user?.profile?.bio ?? "Tell employers about yourself, your career goals, and what makes you unique."}
        </Text>
      </Card>

      {/* Sign out */}
      <View className="mx-4 mt-8">
        <Button
          title="Sign Out"
          variant="outline"
          onPress={logout}
          icon={<Ionicons name="log-out-outline" size={18} color="#0064EC" />}
        />
      </View>

      {/* Experience modal */}
      <ExperienceModal
        visible={showExpModal}
        onClose={() => setShowExpModal(false)}
        onSave={handleAddExperience}
        isLoading={addExperience.isPending}
      />
    </ScrollView>
  );
}

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLoadProfile } from "@/hooks/useLoadProfile";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";

interface ProfileEditFormState {
  avatar_id: string | null;
  organization_id: string;
  job_title_id: string;
  address: string;
  phone: string;
  email: string;
  custom_job_title: string;
}

interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useProfileEdit(userId: string | undefined) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<ProfileEditFormState>({
    avatar_id: null,
    organization_id: "",
    job_title_id: "",
    address: "",
    phone: "",
    email: "",
    custom_job_title: "",
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropState | null>(null);

  const loadProfile = useLoadProfile();

  const initializeForm = (profile: Profile | null) => {
    if (!profile) return;

    setEditForm(() => ({
      avatar_id: profile.avatar_id ?? null,
      organization_id: profile.organization_id || "",
      job_title_id: profile.job_title_id || "",
      address: profile.location || "",
      phone: profile.phone || "",
      email: profile.email || "",
      custom_job_title: profile.job_titles?.is_custom ? profile.job_titles.title : "",
    }));
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!e?.target?.name) return;
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = async (url: string) => {
    if (!userId) return;

    try {
      await supabase
        .from("profiles")
        .update({ avatar_id: url.split("/").pop() })
        .eq("id", userId);

      const updatedProfile = await loadProfile(userId);
      if (updatedProfile) {
        useAuthStore.getState().setProfile(updatedProfile);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      let jobTitleId = editForm.job_title_id;

      if (!jobTitleId && editForm.custom_job_title.trim()) {
        const { data: newJT, error: jtErr } = await supabase
          .from("job_titles")
          .insert({
            title: editForm.custom_job_title.trim(),
            is_custom: true,
          })
          .select()
          .single();

        if (jtErr || !newJT) {
          toast.error("Failed to create job title.");
          return;
        }

        jobTitleId = newJT.id;
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          avatar_id: editForm.avatar_id,
          organization_id: editForm.organization_id,
          job_title_id: jobTitleId,
          phone: editForm.phone,
          email: editForm.email,
          location: editForm.address,
        })
        .eq("id", userId);

      if (updErr) {
        toast.error("Failed to update profile.");
        return;
      }

      const updatedProfile = await loadProfile(userId);
      if (!updatedProfile) {
        toast.error("Failed to reload profile.");
        return;
      }

      useAuthStore.getState().setProfile(updatedProfile);
      setIsModalOpen(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile.");
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editForm,
    selectedImage,
    crop,
    zoom,
    croppedAreaPixels,
    initializeForm,
    handleFormChange,
    handleAvatarUpload,
    handleAvatarSelect,
    handleSaveProfile,
    setCrop,
    setZoom,
    setCroppedAreaPixels,
  };
}

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useAuthStore, type EnrichedProfile } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import type { Database, Tables } from '@/lib/database.types';
import { USER_ROLE_TYPE_OPTIONS } from '@/lib/types';
import { formatPhoneUS } from '@/lib/utils/formatters';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import ImageCropper from '@/pages/StandardPages/StandardPageComponents/ImageCropper';

type JobTitleRow = Tables<'job_titles'>;
type AvatarRow = Tables<'avatars'>;

let cachedJobTitles: JobTitleRow[] | null = null;
let cachedAvatars: AvatarRow[] | null = null;

interface EditProfileModalProps {
  isOpen: boolean;
  profile: EnrichedProfile;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, profile, onClose }: EditProfileModalProps) {
  const { user, setProfile } = useAuthStore();

  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [phone, setPhone] = useState(formatPhoneUS(profile.phone ?? ''));
  const [jobTitleId, setJobTitleId] = useState<string | null>(profile.job_title_id ?? null);
  const [jobTitleQuery, setJobTitleQuery] = useState(profile.job_title ?? '');
  const [jobTitles, setJobTitles] = useState<JobTitleRow[]>([]);
  const [isAddingJobTitle, setIsAddingJobTitle] = useState(false);
  const [isJobTitleOpen, setIsJobTitleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Database['public']['Enums']['user_role_type'] | null>(
    profile.role ?? 'org_user'
  );

  const [avatars, setAvatars] = useState<AvatarRow[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(profile.avatar_id ?? null);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    avatarImageSrc,
    pendingAvatarBlob,
    pendingAvatarPreviewUrl,
    isUploadingAvatar,
    avatarInputRef,
    handleAvatarFileSelected,
    handleAvatarCropped,
    uploadAvatar,
    resetPendingAvatar,
  } = useAvatarUpload({
    userId: user?.id ?? null,
    onCustomAvatarSelected: () => setSelectedAvatarId(null),
  });

  const resolveAvatarUrl = async (avatarId: string | null): Promise<string | null> => {
    if (!avatarId) return null;
    const data = await rpcClient.get_avatar_by_id_public({ p_avatar_id: avatarId });
    return typeof data?.url === 'string' ? data.url : null;
  };

  useEffect(() => {
    if (!isOpen) {
      setIsPresetModalOpen(false);
      setIsJobTitleOpen(false);
      resetPendingAvatar();
      setIsSaving(false);
      return;
    }

    setFullName(profile.full_name ?? '');
    setPhone(formatPhoneUS(profile.phone ?? ''));
    setJobTitleId(profile.job_title_id ?? null);
    setJobTitleQuery(profile.job_title ?? '');
    setSelectedAvatarId(profile.avatar_id ?? null);
    resetPendingAvatar();
    setSelectedRole(profile.role ?? 'org_user');
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async (): Promise<void> => {
      try {
        if (cachedJobTitles && cachedAvatars) {
          setJobTitles(cachedJobTitles);
          setAvatars(cachedAvatars);
          return;
        }

        const [jobTitleRows, avatarRows] = await Promise.all([
          rpcClient.get_job_titles_public(),
          rpcClient.get_preset_avatars_public(),
        ]);

        const resolvedJobTitles = Array.isArray(jobTitleRows) ? jobTitleRows : [];
        const resolvedAvatars = Array.isArray(avatarRows) ? avatarRows : [];
        cachedJobTitles = resolvedJobTitles;
        cachedAvatars = resolvedAvatars;
        setJobTitles(resolvedJobTitles);
        setAvatars(resolvedAvatars);
      } catch (err) {
        console.error(err);
        toast.error('Unable to load profile options. Please refresh.');
      }
    };

    void loadOptions();
  }, [isOpen]);

  useEffect(() => {
    if (!jobTitleId || jobTitleQuery.trim() !== '') return;
    const match = jobTitles.find((title) => title.id === jobTitleId);
    if (match) {
      setJobTitleQuery(match.name);
    }
  }, [jobTitleId, jobTitleQuery, jobTitles]);

  const filteredJobTitles = useMemo(() => {
    const query = jobTitleQuery.trim().toLowerCase();
    if (!query) return jobTitles;
    return jobTitles.filter((title) => title.name.toLowerCase().includes(query));
  }, [jobTitleQuery, jobTitles]);

  const handleAddCustomJobTitle = async (): Promise<void> => {
    if (!jobTitleQuery.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    setIsAddingJobTitle(true);
    try {
      const newJobTitle = await rpcClient.insert_job_title_public({ p_name: jobTitleQuery.trim() });
      if (!newJobTitle) {
        throw new Error('No job title returned');
      }

      setJobTitles((prev) => [newJobTitle, ...prev]);
      cachedJobTitles = [newJobTitle, ...(cachedJobTitles ?? [])];
      setJobTitleId(newJobTitle.id);
      setJobTitleQuery(newJobTitle.name);
      toast.success('Job title added');
    } catch (err) {
      console.error(err);
      toast.error('Unable to add job title');
    } finally {
      setIsAddingJobTitle(false);
    }
  };


  const getAvatarLabel = (avatar: AvatarRow): string => {
    const maybeName = (avatar as { name?: string }).name;
    if (typeof maybeName === 'string' && maybeName.trim() !== '') {
      return maybeName.trim();
    }
    if (typeof avatar.url === 'string' && avatar.url.trim() !== '') {
      try {
        const url = new URL(avatar.url);
        const fileName = url.pathname.split('/').pop() ?? '';
        const base = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
        if (base) {
          return base.replace(/\b\w/g, (char) => char.toUpperCase());
        }
      } catch {
        // ignore invalid URLs
      }
    }
    return 'Avatar';
  };

  const handleSubmit = async (evt: React.FormEvent): Promise<void> => {
    evt.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSaving(true);
    try {
      let resolvedAvatarId = selectedAvatarId || null;
      if (pendingAvatarBlob) {
        const uploadedAvatar = await uploadAvatar(pendingAvatarBlob);
        if (uploadedAvatar) {
          setAvatars((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === uploadedAvatar.id);
            if (existingIndex >= 0) {
              const next = [...prev];
              next[existingIndex] = uploadedAvatar;
              return next;
            }
            return [uploadedAvatar, ...prev];
          });
          cachedAvatars = cachedAvatars
            ? cachedAvatars.some((item) => item.id === uploadedAvatar.id)
              ? cachedAvatars.map((item) => (item.id === uploadedAvatar.id ? uploadedAvatar : item))
              : [uploadedAvatar, ...cachedAvatars]
            : [uploadedAvatar];
          setSelectedAvatarId(uploadedAvatar.id);
          resolvedAvatarId = uploadedAvatar.id;
          resetPendingAvatar();
          toast.success('Avatar uploaded');
        } else {
          throw new Error('Unable to save avatar');
        }
      }

      const payload = {
        p_full_name: fullName.trim(),
        p_phone: phone.trim() || null,
        p_job_title_id: jobTitleId || null,
        p_avatar_id: resolvedAvatarId,
        p_role: selectedRole ?? profile.role ?? null,
      } as unknown as Database['public']['Functions']['update_my_profile']['Args'];

      const updatedRows = await rpcClient.update_my_profile(payload);
      const updatedProfile = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
      if (updatedProfile) {
        const avatarUrl = await resolveAvatarUrl(updatedProfile.avatar_id ?? null);
        const enriched: EnrichedProfile = {
          id: updatedProfile.id,
          full_name: updatedProfile.full_name,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          role: updatedProfile.role as EnrichedProfile['role'],
          job_title_id: updatedProfile.job_title_id,
          organization_id: updatedProfile.organization_id,
          organization_address: profile.organization_address ?? null,
          avatar_id: updatedProfile.avatar_id,
          avatar_url: avatarUrl,
          job_title: profile.job_title ?? null,
          organization_name: profile.organization_name ?? null,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at,
          deleted_at: updatedProfile.deleted_at,
          profile_completed_at: updatedProfile.profile_completed_at ?? null,
        };
        setProfile(enriched);
      } else {
        await useAuthStore.getState().loadProfile(user.id);
      }

      toast.success('Profile updated');
      onClose();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      const isNetworkError = message.includes('Failed to fetch')
        || message.includes('ERR_CONNECTION_CLOSED')
        || message.includes('NetworkError');
      toast.error(
        isNetworkError
          ? 'Network error, try again in a minute.'
          : 'Unable to update your profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-background-lighter bg-background-light p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-300 hover:text-white"
          >
            Close
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5">
          <div>
            <label htmlFor="profile-full-name" className="block text-sm text-gray-300 mb-2">
              Full name
            </label>
            <input
              id="profile-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSaving}
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-sm text-gray-300 mb-2">
              Phone (optional)
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneUS(e.target.value))}
              disabled={isSaving}
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="profile-job-title-search" className="block text-sm text-gray-300 mb-2">
              Job title (optional)
            </label>
            <div className="relative">
              <input
                id="profile-job-title-search"
                type="text"
                value={jobTitleQuery}
                onChange={(e) => {
                  setJobTitleQuery(e.target.value);
                  setIsJobTitleOpen(true);
                }}
                onFocus={() => setIsJobTitleOpen(true)}
                onBlur={() => {
                  setTimeout(() => setIsJobTitleOpen(false), 100);
                }}
                disabled={isSaving}
                className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder="Search job titles"
                autoComplete="off"
              />
              {isJobTitleOpen && (
                <div className="absolute z-10 mt-2 w-full max-h-48 overflow-y-auto rounded-md border border-background-lighter bg-background shadow-lg">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { void handleAddCustomJobTitle(); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-primary hover:bg-background-lighter"
                    disabled={isSaving || isAddingJobTitle}
                  >
                    <span>Add custom job title</span>
                    <span className="text-xs text-gray-400">{jobTitleQuery.trim() || 'Enter a title'}</span>
                  </button>
                  {filteredJobTitles.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">No matches found.</div>
                  ) : (
                    filteredJobTitles.map((title) => (
                      <button
                        key={title.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setJobTitleId(title.id);
                          setJobTitleQuery(title.name);
                          setIsJobTitleOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition ${jobTitleId === title.id
                          ? 'bg-primary/10 text-white'
                          : 'text-gray-200 hover:bg-background-lighter'
                          }`}
                      >
                        <span>{title.name}</span>
                        {jobTitleId === title.id && (
                          <span className="text-xs text-primary">Selected</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="profile-role" className="block text-sm text-gray-300 mb-2">
              Role (optional)
            </label>
            <select
              id="profile-role"
              value={selectedRole ?? ''}
              onChange={(e) => setSelectedRole(e.target.value as Database['public']['Enums']['user_role_type'])}
              disabled={isSaving}
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">Select a role</option>
              {USER_ROLE_TYPE_OPTIONS.filter((role) => role !== 'system_admin').map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-400">
              System admin access is assigned manually.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Avatar (optional)
            </label>
            {selectedAvatarId ? (
              <div className="flex items-center gap-3 rounded-md border border-background-lighter px-3 py-2">
                {(() => {
                  const selected = avatars.find((avatar) => avatar.id === selectedAvatarId);
                  if (selected) {
                    return (
                      <img
                        src={selected.url}
                        alt={getAvatarLabel(selected)}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    );
                  }
                  if (profile.avatar_url && selectedAvatarId === profile.avatar_id) {
                    return (
                      <img
                        src={profile.avatar_url}
                        alt="Current avatar"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    );
                  }
                  return null;
                })()}
                <div className="text-sm text-gray-200">
                  {(() => {
                    const selected = avatars.find((avatar) => avatar.id === selectedAvatarId);
                    if (!selected) return 'Selected avatar';
                    return selected.is_preset ? getAvatarLabel(selected) : 'Current avatar photo';
                  })()}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No avatar selected yet.</p>
            )}
            {pendingAvatarPreviewUrl && (
              <div className="flex items-center gap-3 rounded-md border border-background-lighter px-3 py-2 mt-2">
                <img
                  src={pendingAvatarPreviewUrl}
                  alt="Pending avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="text-sm text-gray-200">Pending avatar</div>
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              aria-label="Upload custom avatar"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleAvatarFileSelected(file);
                }
              }}
              disabled={isSaving || isUploadingAvatar}
            />
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full"
              disabled={isSaving || isUploadingAvatar}
              onClick={() => {
                resetPendingAvatar();
                setIsPresetModalOpen(true);
              }}
            >
              Choose preset avatar
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="mt-2 w-full"
              disabled={isSaving || isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
            >
              {isUploadingAvatar ? 'Uploading...' : 'Upload custom avatar'}
            </Button>
            <p className="mt-2 text-xs text-gray-400">
              Pick an avatar or upload your own.
            </p>
          </div>

          {avatarImageSrc && (
            <div className="mt-4">
              <ImageCropper
                key={avatarImageSrc}
                imageSrc={avatarImageSrc}
                onCropComplete={(blob) => { void handleAvatarCropped(blob); }}
                aspectRatio={1}
                cropShape="round"
                compressionOptions={{
                  mimeType: 'image/jpeg',
                  quality: 0.92,
                  maxWidth: 512,
                  maxHeight: 512,
                }}
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 text-md"
            disabled={isSaving}
            isLoading={isSaving}
          >
            Save profile
          </Button>
        </form>
      </div>

      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-lg border border-background-lighter bg-background-light p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Choose a preset avatar</h2>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="text-sm text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    setSelectedAvatarId(avatar.id);
                    setIsPresetModalOpen(false);
                  }}
                  className={`rounded-md border-2 overflow-hidden transition text-left ${selectedAvatarId === avatar.id
                    ? 'border-primary'
                    : 'border-background-lighter hover:border-primary'
                    }`}
                >
                  <img src={avatar.url} alt={getAvatarLabel(avatar)} className="h-20 w-full object-cover" />
                  <div className="px-2 py-1.5 text-xs text-gray-200">
                    {getAvatarLabel(avatar)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
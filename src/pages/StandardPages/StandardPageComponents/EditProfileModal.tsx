import React from 'react';
import Cropper from 'react-easy-crop';
import { Modal } from './modal';
import { FormSection, FormField } from './form';
import { Input } from './input';
import { Select } from './select';
import { Button } from './button';
import { Plus } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Organization, JobTitle } from '@/lib/types';
import { useAuthStore } from '@/lib/store';

type Avatars = Database['public']['Tables']['avatars']['Row'];
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatars: Avatars[];
  organizations: Organization[];
  jobTitles: JobTitle[];
  editForm: {
    username: string; // Added username
    full_name: string; // Added full_name
    avatar_id?: string;
    organization_id?: string;
    job_title_id?: string;
    address?: string;
    phone?: string;
    email?: string;
    custom_job_title?: string;
  };
  selectedImage: string | null; // Image data URL for the cropper
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels: Area | null;
  onAvatarSelect: (avatarId: string) => void;
  // Renamed from onAvatarUpload
  onRawImageSelected: (file: File) => void;
  // New prop for when "Crop & Upload" is clicked, now directly handles upload
  onImageCroppedAndUpload: (croppedFile: File) => Promise<void>;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (area: Area, areaPixels: Area) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSaveProfile: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  avatars,
  organizations,
  jobTitles,
  editForm, // This now comes directly from useProfileData via Dashboard
  selectedImage,
  crop,
  zoom,
  croppedAreaPixels,
  onAvatarSelect,
  onRawImageSelected,
  onImageCroppedAndUpload,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onFormChange, // This should be the one from useProfileData (handleCustomFormChange or handleFormChange)
  onSaveProfile,
}: EditProfileModalProps) {
  const currentRole = useAuthStore((state) => state.profile?.role ?? null);
  const isSystemAdmin = currentRole === 'system_admin';
  const handleInternalCropAndUpload = async () => {
    if (typeof selectedImage !== 'string' || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(selectedImage, croppedAreaPixels);
      // Ensure the file name is unique or matches Supabase expectations if replacing
      const fileName = `avatar-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      await onImageCroppedAndUpload(file); // Call the updated prop
    } catch (err) {
      console.error('Failed to crop and upload image', err);
      // Potentially show a toast error to the user here
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" className="max-w-lg">
      <div className="px-6 pb-6 custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <FormSection title="Avatar">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {avatars.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => onAvatarSelect(avatar.id)}
                className={`rounded-lg overflow-hidden border-2 ${editForm.avatar_id === avatar.id ? 'border-primary' : 'border-background-lighter'}`}
              >
                <img src={avatar.url} alt="Avatar" className="w-full h-24 object-cover" />
              </button>
            ))}
            <label className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-background-lighter hover:border-primary transition-colors">
              <div className="absolute inset-0 flex items-center justify-center">
                <Plus className="w-8 h-8 mx-auto text-gray-400" />
                <span className="block mt-1 text-sm text-gray-400">Upload</span>
              </div>
              <div className="h-24"></div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                // Call onRawImageSelected when a file is chosen
                onChange={e => e.target.files?.[0] && onRawImageSelected(e.target.files[0])}
              />
            </label>
          </div>
          {typeof selectedImage === 'string' && selectedImage !== '' && (
            <>
              <div className="relative w-full h-64 mb-4"> {/* Container for the Cropper */}
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropComplete={onCropComplete}
                />
              </div>
              {/* Button calls the renamed internal handler */}
              <Button onClick={() => { void handleInternalCropAndUpload(); }} className="mt-2 w-full">
                Crop & Upload
              </Button>
            </>
          )}
        </FormSection>

        <FormSection title="Profile Info">
          <FormField label="Username" htmlFor="username" className="mb-4">
            <Input
              type="text"
              id="username"
              name="username"
              value={editForm.username ?? ''} // Use nullish coalescing
              onChange={onFormChange}
            />
          </FormField>

          <FormField label="Full Name" htmlFor="full_name" className="mb-4">
            <Input
              type="text"
              id="full_name"
              name="full_name"
              value={editForm.full_name ?? ''} // Use nullish coalescing
              onChange={onFormChange}
            />
          </FormField>

          {isSystemAdmin && (
            <FormField label="Organization" htmlFor="organization_id" className="mb-4">
              <Select
                name="organization_id"
                id="organization_id"
                value={editForm.organization_id ?? ''} // Use nullish coalescing
                onChange={onFormChange}
                options={[
                  { value: '', label: 'Select organization' },
                  ...organizations.map(org => ({ value: org.id, label: org.name })),
                  { value: 'create-new', label: '+ Create new organization' },
                ]}
              />
            </FormField>
          )}

          <FormField label="Job Title" htmlFor="job_title_id" className="mb-4">
            <Select
              name="job_title_id"
              id="job_title_id"
              value={editForm.job_title_id ?? ''} // Use nullish coalescing
              onChange={onFormChange}
              options={[
                { value: '', label: 'Select job title' },
                ...jobTitles.map(jt => ({ value: jt.id, label: jt.name })),
              ]}
            />
            {/* Only show custom job title input if job_title_id is empty string and not null/undefined */}
            {editForm.job_title_id === '' && (
              <Input
                type="text"
                name="custom_job_title"
                placeholder="Enter your role"
                value={editForm.custom_job_title ?? ''} // Use nullish coalescing
                onChange={onFormChange}
                className="mt-2"
                aria-label="Custom job title"
              />
            )}
          </FormField>

          <FormField label="Address" htmlFor="address" className="mb-4">
            <Input
              type="text"
              id="address"
              name="address"
              value={editForm.address ?? ''} // Use nullish coalescing
              onChange={onFormChange}
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone" className="mb-4">
            <Input
              type="text"
              id="phone"
              name="phone"
              value={editForm.phone ?? ''} // Use nullish coalescing
              onChange={onFormChange}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" className="mb-4">
            <Input
              type="email"
              id="email"
              name="email"
              value={editForm.email ?? ''} // Use nullish coalescing
              onChange={onFormChange}
            />
          </FormField>

          <Button onClick={() => { void onSaveProfile(); }} className="w-full mt-4">
            Save
          </Button>
        </FormSection>
      </div>
    </Modal>
  );
}
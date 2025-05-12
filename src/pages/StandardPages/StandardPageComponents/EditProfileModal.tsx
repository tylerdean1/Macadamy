import React from 'react';
import Cropper from 'react-easy-crop';
import { Modal } from './modal';
import { FormSection, FormField } from './form';
import { Input } from './input';
import { Select } from './select';
import { Button } from './button';
import { Plus } from 'lucide-react';
import type { Avatars, Organization, JobTitle } from '@/lib/types';
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatars: Avatars[];
  profileAvatarUrl?: string | null;
  organizations: Organization[];
  jobTitles: JobTitle[];
  editForm: {
    avatar_id?: string;
    organization_id?: string;
    job_title_id?: string;
    address?: string;
    phone?: string;
    email?: string;
    custom_job_title?: string;
  };
  selectedImage: string | null;
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels: Area | null;
  onAvatarSelect: (url: string) => void;
  onAvatarUpload: (file: File) => void;
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
  profileAvatarUrl,
  organizations,
  jobTitles,
  editForm,
  selectedImage,
  crop,
  zoom,
  croppedAreaPixels,
  onAvatarSelect,
  onAvatarUpload,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onFormChange,
  onSaveProfile,
}: EditProfileModalProps) {
  // Crop & Upload handler using croppedAreaPixels
  const handleCropAndUpload = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(selectedImage, croppedAreaPixels);
      const file = new File([blob], 'avatar.png', { type: 'image/png' });
      onAvatarUpload(file);
    } catch (err) {
      console.error('Failed to crop image', err);
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
                onClick={() => onAvatarSelect(avatar.url)}
                className={`rounded-lg overflow-hidden border-2 ${profileAvatarUrl === avatar.url ? 'border-primary' : 'border-background-lighter'}`}
              >
                <img src={avatar.url} alt={avatar.name} className="w-full h-24 object-cover" />
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
                onChange={e => e.target.files?.[0] && onAvatarUpload(e.target.files[0])}
              />
            </label>
          </div>
          {selectedImage && (
            <div className="relative w-full h-64 mb-4">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropComplete}
              />
              <Button onClick={handleCropAndUpload} className="mt-2 w-full">
                Crop & Upload
              </Button>
            </div>
          )}
        </FormSection>

        <FormSection title="Profile Info">
          <FormField label="Organization" htmlFor="organization_id" className="mb-4">
            <Select
              name="organization_id"
              id="organization_id"
              value={editForm.organization_id || ''}
              onChange={onFormChange}
              options={[
                { value: '', label: 'Select organization' },
                ...organizations.map(org => ({ value: org.id, label: org.name })),
                { value: 'create-new', label: '+ Create new organization' },
              ]}
            />
          </FormField>

          <FormField label="Job Title" htmlFor="job_title_id" className="mb-4">
            <Select
              name="job_title_id"
              id="job_title_id"
              value={editForm.job_title_id || ''}
              onChange={onFormChange}
              options={[
                { value: '', label: 'Select job title' },
                ...jobTitles.map(jt => ({ value: jt.id, label: jt.title })),
              ]}
            />
            {editForm.job_title_id === '' && (
              <Input
                type="text"
                name="custom_job_title"
                placeholder="Enter your role"
                value={editForm.custom_job_title || ''}
                onChange={onFormChange}
                className="mt-2"
              />
            )}
          </FormField>

          <FormField label="Address" htmlFor="address" className="mb-4">
            <Input
              type="text"
              id="address"
              name="address"
              value={editForm.address || ''}
              onChange={onFormChange}
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone" className="mb-4">
            <Input
              type="text"
              id="phone"
              name="phone"
              value={editForm.phone || ''}
              onChange={onFormChange}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" className="mb-4">
            <Input
              type="email"
              id="email"
              name="email"
              value={editForm.email || ''}
              onChange={onFormChange}
            />
          </FormField>

          <Button onClick={onSaveProfile} className="w-full mt-4">
            Save
          </Button>
        </FormSection>
      </div>
    </Modal>
  );
}
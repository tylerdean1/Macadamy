import { Building2, FileText, MapPin, Phone, Mail, Pencil } from 'lucide-react';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import type { Profile } from '@/lib/types';

export interface ProfileSectionProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileSection({ profile, onEdit }: ProfileSectionProps) {
  return (
    <Card className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Avatar + Welcome */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-[125px] h-[125px] rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {profile.full_name}
              </h1>
              <Button
                onClick={onEdit}
                variant="ghost"
                size="sm"
                className="mt-1"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Optional Metadata */}
          <div className="text-gray-400 space-y-1">
            {profile.organizations?.name && (
              <p className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                {profile.organizations.name}
              </p>
            )}
            {profile.job_titles?.title && (
              <p className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {profile.job_titles.title}
              </p>
            )}
            {profile.organizations?.address && (
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {profile.organizations.address}
              </p>
            )}
            {profile.organizations?.phone && (
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {profile.organizations.phone}
              </p>
            )}
            {profile.organizations?.website && (
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <a
                  href={profile.organizations.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-400"
                >
                  {profile.organizations.website}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
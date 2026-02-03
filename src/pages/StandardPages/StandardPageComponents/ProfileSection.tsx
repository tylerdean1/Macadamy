import { Building2, Phone, Mail, Pencil, Briefcase, MapPin, Shield } from 'lucide-react'; // Removed FileText
import { Link } from 'react-router-dom';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import type { EnrichedProfile } from '@/lib/store';

export interface ProfileSectionProps {
  profile: EnrichedProfile; // Profile data is now directly passed
  onEdit: () => void;
}

export function ProfileSection({ profile, onEdit }: ProfileSectionProps) {
  // No internal state or data fetching needed here anymore
  // All data comes from the `profile` prop
  return (
    <Card className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Avatar + Welcome */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            {typeof profile.avatar_url === 'string' && profile.avatar_url.trim() !== '' && (
              <img
                src={profile.avatar_url} // Use profile.avatar_url directly
                alt="Avatar"
                className="w-[125px] h-[125px] rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {profile.full_name ?? 'there'}
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
            {typeof profile.email === 'string' && profile.email.trim() !== '' && (
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {profile.email}
              </p>
            )}
            {typeof profile.phone === 'string' && profile.phone.trim() !== '' && (
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {profile.phone}
              </p>
            )}
            {typeof profile.organization_name === 'string' && profile.organization_name.trim() !== '' && (
              <Link
                to="/organizations"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {profile.organization_name}
              </Link>
            )}
            {(typeof profile.job_title === 'string' && profile.job_title.trim() !== '') && (
              <p className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                {profile.job_title}
              </p>
            )}
            {(typeof profile.role === 'string' && profile.role.trim() !== '') && (
              <p className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                {profile.role.replace(/_/g, ' ')}
              </p>
            )}
            {(typeof profile.organization_address === 'string' && profile.organization_address.trim() !== '') && (
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {profile.organization_address}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
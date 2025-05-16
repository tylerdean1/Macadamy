import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import type { Profile } from '@/lib/types';

interface ProfileSectionProps {
  profile: Profile;
  onEdit?: () => void;
}

export function ProfileSection({ profile, onEdit }: ProfileSectionProps) {
  const avatarUrl = profile.avatar_id
    ? `https://koaxmrtrzhilnzjbiybr.supabase.co/storage/v1/object/public/avatars-presets/${profile.avatar_id}`
    : `https://api.dicebear.com/6.x/initials/svg?seed=${profile.full_name}&backgroundColor=0f172a&fontWeight=600`;

  return (
    <div className="flex items-center gap-6 bg-background-light p-6 rounded-lg border border-background-lighter">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border border-zinc-700">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col gap-1 text-white">
        <h2 className="text-xl font-bold">{profile.full_name}</h2>
        <p className="text-sm text-gray-400">{profile.email}</p>
        <p className="text-sm text-gray-400">
          @{profile.username ?? 'no-username'}
        </p>
        <p className="text-sm text-gray-400">
          {profile.job_titles?.title ?? 'No Title'} @{' '}
          {profile.organizations?.name ?? 'No Organization'}
        </p>
        <p className="text-sm text-gray-400">
          {profile.phone ?? 'No phone'} · {profile.location ?? 'No location'}
        </p>
      </div>

      {/* Edit Button */}
      {onEdit && (
        <div className="ml-auto">
          <Button size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

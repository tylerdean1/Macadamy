import { Building2, Phone, Mail, Pencil, Briefcase, MapPin, Shield } from 'lucide-react'; // Removed FileText
import { Link } from 'react-router-dom';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import type { EnrichedProfile } from '@/lib/store';
import { formatPhoneUS } from '@/lib/utils/formatters';
import { useMyOrganizations } from '@/hooks/useMyOrganizations';
import { useAuthStore } from '@/lib/store';
import { usePrimaryOrganizationSwitch } from '@/hooks/usePrimaryOrganizationSwitch';

export interface ProfileSectionProps {
  profile: EnrichedProfile; // Profile data is now directly passed
  onEdit: () => void;
  // optional overrides so Dashboard can display a different org/job-title context
  overrideOrgName?: string | null;
  overrideOrgRole?: string | null;
  overrideOrgRoleLines?: string[];
}

export function ProfileSection({ profile, onEdit, overrideOrgName = null, overrideOrgRole = null, overrideOrgRoleLines = [] }: ProfileSectionProps) {
  // Load organizations for the current profile to support org-switcher UI
  const { orgs, loading: orgsLoading } = useMyOrganizations(profile.id);
  const authStore = useAuthStore();
  const selectedOrganizationId = authStore.selectedOrganizationId;
  const { isSwitching: isOrgSwitching, switchPrimaryOrganization } = usePrimaryOrganizationSwitch();

  const handleOrganizationSwitch = async (organizationId: string) => {
    try {
      await switchPrimaryOrganization(organizationId);
    } catch {
      return;
    }
  };

  const displayOrgName = overrideOrgName ?? profile.organization_name;
  const displayMembershipRole = overrideOrgRole;

  // No internal state or data fetching needed here beyond hooks above
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
                {formatPhoneUS(profile.phone)}
              </p>
            )}
            {/* Organization name / org-switcher */}
            {orgsLoading ? (
              <p className="flex items-center text-gray-400">
                <Building2 className="w-4 h-4 mr-2" />
                Loading organizations…
              </p>
            ) : Array.isArray(orgs) && orgs.length > 1 ? (
              (() => {
                const selectedId = selectedOrganizationId ?? profile.organization_id ?? orgs[0].id;
                const selected = orgs.find(o => o.id === selectedId) ?? orgs[0];
                return (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-300" />
                    <select
                      title="Switch organization"
                      aria-label="Switch organization"
                      className={`bg-transparent text-gray-300 border border-transparent focus:border-gray-600 rounded px-2 py-1 ${isOrgSwitching ? 'opacity-70 cursor-not-allowed' : ''}`}
                      value={selected.id}
                      disabled={isOrgSwitching}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        void handleOrganizationSwitch(nextId);
                      }}
                    >
                      {orgs.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}{o.roleLabel ? ` — ${o.roleLabel}` : ''}</option>
                      ))}
                    </select>
                  </div>
                );
              })()
            ) : (typeof displayOrgName === 'string' && displayOrgName.trim() !== '') ? (
              (() => {
                const membership = Array.isArray(orgs) && orgs.length > 0 ? orgs.find(o => o.id === profile.organization_id) : null;
                return (
                  <Link
                    to="/organizations"
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {displayOrgName}
                    {(overrideOrgRole ?? membership?.roleLabel) && (
                      <span className="ml-3 text-xs text-gray-400">{(overrideOrgRole ?? membership?.roleLabel ?? '').replace(/_/g, ' ')}</span>
                    )}
                  </Link>
                );
              })()
            ) : null}
            {(typeof displayMembershipRole === 'string' && displayMembershipRole.trim() !== '') && (
              <p className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                {displayMembershipRole}
              </p>
            )}
            {overrideOrgRoleLines.length > 0 && (
              <div className="space-y-1">
                {overrideOrgRoleLines.map((line) => (
                  <p key={line} className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {line}
                  </p>
                ))}
              </div>
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
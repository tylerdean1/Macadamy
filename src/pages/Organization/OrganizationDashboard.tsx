import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Pencil, Users, Plus } from 'lucide-react';
import { Page, PageContainer, SectionContainer } from '@/components/Layout';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import ImageCropper from '@/pages/StandardPages/StandardPageComponents/ImageCropper';
import { useRequireProfile } from '@/hooks/useRequireProfile';
import { invalidateMyOrganizationsCache, useMyOrganizations } from '@/hooks/useMyOrganizations';
import { invalidateMyInactiveOrganizationsCache } from '@/hooks/useMyInactiveOrganizations';
import { useValidatedSelectedOrganization } from '@/hooks/useValidatedSelectedOrganization';
import { rpcClient } from '@/lib/rpc.client';
import { getStoragePublicUrl, uploadStorageFile } from '@/lib/storageClient';
import { useAuthStore } from '@/lib/store';
import { resolveInviteReviewErrorMessage, resolveOrgMemberActionErrorMessage } from '@/lib/utils/inviteErrorMessages';
import { formatPhoneUS } from '@/lib/utils/formatters';
import { toast } from 'sonner';
import type { Database, Tables } from '@/lib/database.types';

type RoleType = Database['public']['Enums']['user_role_type'];
type OrgRoleType = Database['public']['Enums']['org_role'];
type JobTitleRow = Tables<'job_titles'>;

let cachedJobTitles: JobTitleRow[] | null = null;

interface OrgDashboardPayload {
  organization: {
    id: string;
    name: string;
    description: string | null;
    mission_statement: string | null;
    headquarters: string | null;
    logo_url: string | null;
  };
  service_areas: Array<{ id: string; service_area_text: string }>;
  members: {
    total_count: number;
    items: Array<{
      profile_id: string;
      full_name: string | null;
      email: string;
      global_role: RoleType | null;
      membership_permission_role?: string | null;
      membership_job_title_id?: string | null;
      membership_job_title_name?: string | null;
    }>;
  };
  metrics: {
    total_members: number;
    total_projects: number;
    members_yoy: number;
    projects_yoy: number;
  };
}

type MemberListItem = OrgDashboardPayload['members']['items'][number];

const emptyPayload: OrgDashboardPayload = {
  organization: {
    id: '',
    name: 'Organization',
    description: null,
    mission_statement: null,
    headquarters: null,
    logo_url: null,
  },
  service_areas: [],
  members: {
    total_count: 0,
    items: [],
  },
  metrics: {
    total_members: 0,
    total_projects: 0,
    members_yoy: 0,
    projects_yoy: 0,
  },
};

const ORG_DASHBOARD_TOAST_MESSAGES = {
  loadJobTitlesFailed: 'Unable to load job titles.',
  enterJobTitle: 'Please enter a job title',
  addJobTitleSuccess: 'Job title added',
  addJobTitleFailed: 'Unable to add job title',
  membershipApproved: 'Membership approved',
  memberReadmitted: 'Member re-admitted',
  membershipDeclined: 'Membership declined',
  cannotRemoveSelf: 'You cannot remove your own membership.',
  provideRemovalReason: 'Please provide a removal reason.',
  removeMemberSuccess: 'Member removed and notified.',
  removeMemberFailed: 'Unable to remove member.',
  selectNewJobTitle: 'Please select a new job title.',
  selectedTitleAlreadyAssigned: 'This member already has that title.',
  provideTitleChangeReason: 'Please provide a reason for the job-title change.',
  selectedJobTitleMissing: 'Selected job title could not be found.',
  changeMemberTitleSuccess: 'Member job title updated and notified.',
  changeMemberTitleFailed: 'Unable to change member job title.',
  selectPermissionRole: 'Please select an org role.',
  selectedPermissionRoleAlreadyAssigned: 'This member already has that org role.',
  changePermissionRoleOwnerOnly: 'Only owners can change another owner\'s org role.',
  changeMemberPermissionRoleSuccess: 'Member org role updated.',
  changeMemberPermissionRoleFailed: 'Unable to change member org role.',
  selectOrCreateJobTitleBeforeApproval: 'Please select or create a job title before approval.',
  selectPermissionRoleBeforeApproval: 'Please select an org role before approval.',
  leaveOrganizationConfirm: 'Are you sure you want to leave the organization?',
  leaveOrganizationSuccess: 'You left the organization.',
  leaveOrganizationFailed: 'Unable to leave organization.',
  leaveOrganizationReason: 'Member left organization',
} as const;

const APPROVAL_ORG_ROLE_OPTIONS: ReadonlyArray<OrgRoleType> = [
  'admin',
  'manager',
  'superintendent',
  'foreman',
  'worker',
  'viewer',
  'accountant',
  'hr',
  'estimator',
  'guest',
  'owner',
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORG_ROLE_VALUES: ReadonlySet<OrgRoleType> = new Set([
  'admin',
  'manager',
  'superintendent',
  'foreman',
  'worker',
  'viewer',
  'accountant',
  'hr',
  'estimator',
  'guest',
  'owner',
]);

const isUuid = (value: string | null): boolean =>
  typeof value === 'string' && UUID_PATTERN.test(value);

const asOrgRole = (value: unknown): OrgRoleType | null =>
  typeof value === 'string' && ORG_ROLE_VALUES.has(value as OrgRoleType)
    ? (value as OrgRoleType)
    : null;

const normalizePayload = (raw: unknown): OrgDashboardPayload => {
  if (raw == null || typeof raw !== 'object') {
    return emptyPayload;
  }

  const payload = raw as Record<string, unknown>;
  const organization = (payload.organization ?? {}) as Record<string, unknown>;
  const members = (payload.members ?? {}) as Record<string, unknown>;
  const metrics = (payload.metrics ?? {}) as Record<string, unknown>;
  const serviceAreasRaw = Array.isArray(payload.service_areas) ? payload.service_areas : [];
  const memberItemsRaw = Array.isArray(members.items) ? members.items : [];

  return {
    organization: {
      id: typeof organization.id === 'string' ? organization.id : '',
      name: typeof organization.name === 'string' ? organization.name : 'Organization',
      description: typeof organization.description === 'string' ? organization.description : null,
      mission_statement: typeof organization.mission_statement === 'string' ? organization.mission_statement : null,
      headquarters: typeof organization.headquarters === 'string' ? organization.headquarters : null,
      logo_url: typeof organization.logo_url === 'string' ? organization.logo_url : null,
    },
    service_areas: serviceAreasRaw
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : '',
        service_area_text: typeof item.service_area_text === 'string' ? item.service_area_text : '',
      }))
      .filter((item) => item.id !== '' && item.service_area_text !== ''),
    members: {
      total_count: typeof members.total_count === 'number' ? members.total_count : 0,
      items: memberItemsRaw
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => ({
          profile_id: typeof item.profile_id === 'string' ? item.profile_id : '',
          full_name: typeof item.full_name === 'string' ? item.full_name : null,
          email: typeof item.email === 'string' ? item.email : '',
          global_role: (typeof item.global_role === 'string' ? item.global_role : null) as RoleType | null,
          membership_permission_role: typeof item.membership_permission_role === 'string' ? item.membership_permission_role : null,
          membership_job_title_id: typeof item.membership_job_title_id === 'string' ? item.membership_job_title_id : null,
          membership_job_title_name: typeof item.membership_job_title_name === 'string' ? item.membership_job_title_name : null,
        }))
        .filter((item) => item.profile_id !== '' && item.email !== ''),
    },
    metrics: {
      total_members: typeof metrics.total_members === 'number' ? metrics.total_members : 0,
      total_projects: typeof metrics.total_projects === 'number' ? metrics.total_projects : 0,
      members_yoy: typeof metrics.members_yoy === 'number' ? metrics.members_yoy : 0,
      projects_yoy: typeof metrics.projects_yoy === 'number' ? metrics.projects_yoy : 0,
    },
  };
};

type PendingInviteItem = Database['public']['Tables']['organization_invites']['Row'] & {
  requester_full_name: string | null;
  requester_email: string | null;
  requester_phone: string | null;
  requester_location: string | null;
  requester_avatar_url: string | null;
  requester_avatar_id: string | null;
  requested_job_title_name?: string | null;
  is_rejoin?: boolean;
};

function normalizePendingInviteRows(raw: unknown): PendingInviteItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : '',
      organization_id: typeof item.organization_id === 'string' ? item.organization_id : '',
      invited_profile_id: typeof item.invited_profile_id === 'string' ? item.invited_profile_id : '',
      invited_by_profile_id: typeof item.invited_by_profile_id === 'string' ? item.invited_by_profile_id : '',
      status: typeof item.status === 'string' ? item.status : 'pending',
      role: typeof item.role === 'string' ? item.role : null,
      comment: typeof item.comment === 'string' ? item.comment : null,
      created_at: typeof item.created_at === 'string' ? item.created_at : new Date(0).toISOString(),
      responded_at: typeof item.responded_at === 'string' ? item.responded_at : null,
      requested_permission_role: asOrgRole(item.requested_permission_role),
      requested_job_title_id: typeof item.requested_job_title_id === 'string' ? item.requested_job_title_id : null,
      reviewed_permission_role: asOrgRole(item.reviewed_permission_role),
      reviewed_job_title_id: typeof item.reviewed_job_title_id === 'string' ? item.reviewed_job_title_id : null,
      requester_full_name: typeof item.requester_full_name === 'string' ? item.requester_full_name : null,
      requester_email: typeof item.requester_email === 'string' ? item.requester_email : null,
      requester_phone: typeof item.requester_phone === 'string' ? item.requester_phone : null,
      requester_location: typeof item.requester_location === 'string' ? item.requester_location : null,
      requester_avatar_url: typeof item.requester_avatar_url === 'string' ? item.requester_avatar_url : null,
      requester_avatar_id: typeof item.requester_avatar_id === 'string' ? item.requester_avatar_id : null,
      requested_job_title_name: typeof item.requested_job_title_name === 'string' ? item.requested_job_title_name : null,
      is_rejoin: typeof item.is_rejoin === 'boolean' ? item.is_rejoin : false,
    }))
    .filter((item) => item.id !== '' && item.organization_id !== '' && item.invited_profile_id !== '');
}

export default function OrganizationDashboard(): JSX.Element {
  useRequireProfile();

  const { profile, setProfile, setSelectedOrganizationId } = useAuthStore();
  const [payload, setPayload] = useState<OrgDashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [editStep, setEditStep] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    mission_statement: '',
    headquarters: '',
    logo_url: '',
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [logoImageSrc, setLogoImageSrc] = useState<string | null>(null);
  const [pendingLogoBlob, setPendingLogoBlob] = useState<Blob | null>(null);
  const [pendingLogoPreviewUrl, setPendingLogoPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Array<{
    id: string;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string | null;
  }>>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // pending org membership requests (admins only)
  const [pendingInvites, setPendingInvites] = useState<PendingInviteItem[]>([]);
  const [pendingInvitesLoading, setPendingInvitesLoading] = useState(false);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<JobTitleRow[]>([]);
  const [approveJobTitleIdByInviteId, setApproveJobTitleIdByInviteId] = useState<Record<string, string>>({});
  const [approvePermissionRoleByInviteId, setApprovePermissionRoleByInviteId] = useState<Record<string, OrgRoleType>>({});
  const [approveJobTitleQueryByInviteId, setApproveJobTitleQueryByInviteId] = useState<Record<string, string>>({});
  const [jobTitleOpenInviteId, setJobTitleOpenInviteId] = useState<string | null>(null);
  const [addingJobTitleInviteId, setAddingJobTitleInviteId] = useState<string | null>(null);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<MemberListItem | null>(null);
  const [removeMemberReason, setRemoveMemberReason] = useState('');
  const [changeTitleDialogOpen, setChangeTitleDialogOpen] = useState(false);
  const [memberToRetitle, setMemberToRetitle] = useState<MemberListItem | null>(null);
  const [changeTitleReason, setChangeTitleReason] = useState('');
  const [changeTitleJobTitleId, setChangeTitleJobTitleId] = useState('');
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [memberToReRole, setMemberToReRole] = useState<MemberListItem | null>(null);
  const [changeRolePermissionRole, setChangeRolePermissionRole] = useState<OrgRoleType | ''>('');
  const [leaveOrganizationDialogOpen, setLeaveOrganizationDialogOpen] = useState(false);
  const [memberActionBusyKey, setMemberActionBusyKey] = useState<string | null>(null);
  const hasStartedOrganizationsLoadRef = useRef(false);
  const { orgs: myOrganizations, loading: myOrganizationsLoading } = useMyOrganizations(profile?.id);
  const {
    activeOrgIds: activeOrganizationIds,
    validatedSelectedOrganizationId,
  } = useValidatedSelectedOrganization(myOrganizations.map((org) => org.id));
  const activeOrganizationId = validatedSelectedOrganizationId
    ?? (profile?.organization_id && activeOrganizationIds.has(profile.organization_id) ? profile.organization_id : null)
    ?? (myOrganizations[0]?.id ?? null);
  const safePayload = payload ?? emptyPayload;
  const canManagePendingInvites = profile?.role === 'system_admin' || profile?.role === 'org_admin';

  useEffect(() => {
    if (myOrganizationsLoading || myOrganizations.length > 0 || profile?.id == null) {
      hasStartedOrganizationsLoadRef.current = true;
    }
  }, [myOrganizations.length, myOrganizationsLoading, profile?.id]);

  const actorOrgRole = useMemo<OrgRoleType | null>(() => {
    if (!activeOrganizationId) {
      return null;
    }

    const orgMembership = myOrganizations.find((org) => org.id === activeOrganizationId);
    const fromOrgMembership = asOrgRole(orgMembership?.permissionRole ?? orgMembership?.role ?? null);
    if (fromOrgMembership) {
      return fromOrgMembership;
    }

    const profileId = profile?.id;
    if (!profileId) {
      return null;
    }

    const selfMember = safePayload.members.items.find((member) => member.profile_id === profileId);
    return asOrgRole(selfMember?.membership_permission_role ?? null);
  }, [activeOrganizationId, myOrganizations, profile?.id, safePayload.members.items]);

  const canManageMemberActions = actorOrgRole === 'admin' || actorOrgRole === 'hr' || actorOrgRole === 'owner';

  const serviceAreas = useMemo(() => {
    return [...safePayload.service_areas].sort((a, b) => a.service_area_text.localeCompare(b.service_area_text));
  }, [safePayload.service_areas]);

  const jobTitleNameById = useMemo(() => {
    return new Map(jobTitles.map((title) => [title.id, title.name]));
  }, [jobTitles]);

  const organization = safePayload.organization;
  const headquarters = organization.headquarters?.trim() || 'Headquarters not set.';
  const initials = organization.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ORG';
  const logoPreviewSrc = pendingLogoPreviewUrl ?? logoImageSrc ?? formState.logo_url;

  const totalMembers = safePayload.members.total_count;
  const sortedMembers = useMemo(() => {
    const rows = [...safePayload.members.items];
    if (!profile?.id) {
      return rows;
    }

    rows.sort((left, right) => {
      const leftIsSelf = left.profile_id === profile.id ? 1 : 0;
      const rightIsSelf = right.profile_id === profile.id ? 1 : 0;
      if (leftIsSelf !== rightIsSelf) {
        return rightIsSelf - leftIsSelf;
      }

      const leftName = (left.full_name ?? left.email).toLowerCase();
      const rightName = (right.full_name ?? right.email).toLowerCase();
      return leftName.localeCompare(rightName);
    });

    return rows;
  }, [profile?.id, safePayload.members.items]);
  const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const formatGlobalRole = (role: string | null): string => {
    if (!role || role === 'unassigned') return 'Unassigned';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatMembershipRole = (role: string | null): string => {
    if (!role || role === 'unassigned') return 'Unassigned';

    if (isUuid(role)) {
      return jobTitleNameById.get(role) ?? role;
    }

    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const resolveMemberPermissionRole = (member: MemberListItem): string => {
    return formatGlobalRole(member.membership_permission_role ?? null);
  };

  const resolveMemberJobTitle = (member: MemberListItem): string => {
    if (member.membership_job_title_name) {
      return member.membership_job_title_name;
    }

    if (member.membership_job_title_id) {
      return formatMembershipRole(member.membership_job_title_id);
    }

    return 'Unassigned';
  };

  const resolveInviteRequestedRole = (invite: PendingInviteItem): string => {
    if (invite.requested_permission_role) {
      return formatGlobalRole(invite.requested_permission_role);
    }

    return 'Not specified';
  };

  const resolveInviteRequestedTitle = (invite: PendingInviteItem): string => {
    if (invite.requested_job_title_name) {
      return invite.requested_job_title_name;
    }

    if (invite.requested_job_title_id) {
      return formatMembershipRole(invite.requested_job_title_id);
    }

    return 'Not specified';
  };

  const getProjectStatusCounts = () => {
    const counts: Record<Database['public']['Enums']['project_status'] | 'unknown', number> = {
      planned: 0,
      active: 0,
      complete: 0,
      archived: 0,
      on_hold: 0,
      canceled: 0,
      unknown: 0,
    };

    projects.forEach(project => {
      const status = project.status;
      if (status === 'planned' || status === 'active' || status === 'complete' || status === 'archived' || status === 'on_hold' || status === 'canceled') {
        counts[status] += 1;
      } else {
        counts.unknown += 1;
      }
    });

    return counts;
  };

  useEffect(() => {
    setPage(1);
  }, [activeOrganizationId]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!activeOrganizationId) {
        setProjects([]);
        return;
      }

      setProjectsLoading(true);
      try {
        const data = await rpcClient.filter_projects({
          _filters: { organization_id: activeOrganizationId },
          _limit: 5, // Show only first 5 projects
          _order_by: 'created_at',
          _direction: 'desc'
        });
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    void fetchProjects();
  }, [activeOrganizationId]);

  useEffect(() => {
    if (!isEditOpen) return;
    setEditStep(0);
    setEditError(null);
    setLogoImageSrc(null);
    if (pendingLogoPreviewUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(pendingLogoPreviewUrl);
      }, 0);
    }
    setPendingLogoPreviewUrl(null);
    setPendingLogoBlob(null);
    setFormState({
      name: safePayload.organization.name,
      description: safePayload.organization.description ?? '',
      mission_statement: safePayload.organization.mission_statement ?? '',
      headquarters: safePayload.organization.headquarters ?? '',
      logo_url: safePayload.organization.logo_url ?? '',
    });
  }, [isEditOpen, safePayload.organization]);

  useEffect(() => {
    if (!(canManagePendingInvites || canManageMemberActions)) {
      return;
    }

    const loadJobTitles = async () => {
      try {
        if (cachedJobTitles) {
          setJobTitles(cachedJobTitles);
          return;
        }

        const rows = await rpcClient.get_job_titles_public();
        const resolvedRows = Array.isArray(rows) ? rows : [];
        cachedJobTitles = resolvedRows;
        setJobTitles(resolvedRows);
      } catch (err) {
        console.error('[OrganizationDashboard] load job titles', err);
        toast.error(ORG_DASHBOARD_TOAST_MESSAGES.loadJobTitlesFailed);
      }
    };

    void loadJobTitles();
  }, [canManageMemberActions, canManagePendingInvites]);

  const loadPendingInvites = useCallback(async () => {
    if (!activeOrganizationId || !canManagePendingInvites) {
      setPendingInvites([]);
      setPendingInvitesLoading(false);
      return;
    }

    setPendingInvitesLoading(true);
    try {
      const richData = await rpcClient.get_pending_organization_invites_with_profiles({
        p_organization_id: activeOrganizationId,
      });

      setPendingInvites(normalizePendingInviteRows(richData));
    } catch (err) {
      console.error('[OrganizationDashboard] load pending invites', err);
      setPendingInvites([]);
    } finally {
      setPendingInvitesLoading(false);
    }
  }, [activeOrganizationId, canManagePendingInvites]);

  useEffect(() => {
    if (pendingInvites.length === 0) {
      return;
    }

    setApprovePermissionRoleByInviteId((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const invite of pendingInvites) {
        if (next[invite.id]) {
          continue;
        }

        const defaultRole = invite.requested_permission_role ?? 'worker';
        next[invite.id] = defaultRole;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [pendingInvites]);

  useEffect(() => {
    if (pendingInvites.length === 0) {
      return;
    }

    setApproveJobTitleIdByInviteId((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const invite of pendingInvites) {
        if (next[invite.id]) {
          continue;
        }

        if (invite.requested_job_title_id) {
          next[invite.id] = invite.requested_job_title_id;
          changed = true;
        }
      }

      return changed ? next : prev;
    });

    setApproveJobTitleQueryByInviteId((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const invite of pendingInvites) {
        if (next[invite.id]) {
          continue;
        }

        if (invite.requested_job_title_name) {
          next[invite.id] = invite.requested_job_title_name;
          changed = true;
          continue;
        }

        if (invite.requested_job_title_id) {
          const derivedName = jobTitleNameById.get(invite.requested_job_title_id);
          if (derivedName) {
            next[invite.id] = derivedName;
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [jobTitleNameById, pendingInvites]);

  // load pending membership requests for org admins
  useEffect(() => {
    void loadPendingInvites();
  }, [loadPendingInvites]);

  const handleAddCustomJobTitle = async (inviteId: string): Promise<void> => {
    const currentQuery = (approveJobTitleQueryByInviteId[inviteId] ?? '').trim();
    if (!currentQuery) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.enterJobTitle);
      return;
    }

    setAddingJobTitleInviteId(inviteId);
    try {
      const newJobTitle = await rpcClient.insert_job_title_public({ p_name: currentQuery });
      if (!newJobTitle) {
        throw new Error('No job title returned');
      }

      setJobTitles((prev) => [newJobTitle, ...prev]);
      cachedJobTitles = [newJobTitle, ...(cachedJobTitles ?? [])];
      setApproveJobTitleIdByInviteId((prev) => ({ ...prev, [inviteId]: newJobTitle.id }));
      setApproveJobTitleQueryByInviteId((prev) => ({ ...prev, [inviteId]: newJobTitle.name }));
      setJobTitleOpenInviteId((current) => (current === inviteId ? null : current));
      toast.success(ORG_DASHBOARD_TOAST_MESSAGES.addJobTitleSuccess);
    } catch (err) {
      console.error(err);
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.addJobTitleFailed);
    } finally {
      setAddingJobTitleInviteId((current) => (current === inviteId ? null : current));
    }
  };

  const handleReviewInvite = async (
    invite: PendingInviteItem,
    decision: 'accepted' | 'declined',
    selectedJobTitleId?: string | null,
    selectedPermissionRole?: OrgRoleType | null,
  ) => {
    if (inviteActionId != null) return;
    setInviteActionId(invite.id);
    try {
      const respondedAtIso = new Date().toISOString();
      await rpcClient.review_organization_invite({
        p_invite_id: invite.id,
        p_decision: decision,
        p_responded_at: respondedAtIso,
        p_selected_job_title_id: selectedJobTitleId ?? undefined,
        p_selected_permission_role: selectedPermissionRole ?? undefined,
      });

      toast.success(decision === 'accepted'
        ? (invite.is_rejoin ? ORG_DASHBOARD_TOAST_MESSAGES.memberReadmitted : ORG_DASHBOARD_TOAST_MESSAGES.membershipApproved)
        : ORG_DASHBOARD_TOAST_MESSAGES.membershipDeclined);
      await Promise.all([
        loadDashboard(),
        loadPendingInvites(),
      ]);
    } catch (err) {
      console.error('[OrganizationDashboard] review invite error', err);
      toast.error(resolveInviteReviewErrorMessage(err));
    } finally {
      setInviteActionId(null);
      setJobTitleOpenInviteId((current) => (current === invite.id ? null : current));
    }
  };

  const openRemoveMemberDialog = (member: MemberListItem): void => {
    setMemberToRemove(member);
    setRemoveMemberReason('');
    setRemoveMemberDialogOpen(true);
  };

  const openChangeTitleDialog = (member: MemberListItem): void => {
    setMemberToRetitle(member);
    setChangeTitleReason('');
    setChangeTitleJobTitleId('');
    setChangeTitleDialogOpen(true);
  };

  const openChangeRoleDialog = (member: MemberListItem): void => {
    setMemberToReRole(member);
    setChangeRolePermissionRole(asOrgRole(member.membership_permission_role) ?? '');
    setChangeRoleDialogOpen(true);
  };

  const handleRemoveMember = async (): Promise<void> => {
    if (!activeOrganizationId || !memberToRemove) {
      return;
    }

    const profileId = profile?.id;
    if (!profileId) {
      return;
    }

    if (memberToRemove.profile_id === profileId) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.cannotRemoveSelf);
      return;
    }

    const reason = removeMemberReason.trim();
    if (!reason) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.provideRemovalReason);
      return;
    }

    setMemberActionBusyKey(`remove:${memberToRemove.profile_id}`);
    try {
      await rpcClient.remove_org_member_with_reason({
        p_org_id: activeOrganizationId,
        p_profile_id: memberToRemove.profile_id,
        p_reason: reason,
      });

      toast.success(ORG_DASHBOARD_TOAST_MESSAGES.removeMemberSuccess);
      setRemoveMemberDialogOpen(false);
      setMemberToRemove(null);
      setRemoveMemberReason('');
      await loadDashboard();
    } catch (err) {
      console.error('[OrganizationDashboard] remove member', err);
      toast.error(resolveOrgMemberActionErrorMessage(err, ORG_DASHBOARD_TOAST_MESSAGES.removeMemberFailed));
    } finally {
      setMemberActionBusyKey(null);
    }
  };

  const handleChangeMemberJobTitle = async (): Promise<void> => {
    if (!activeOrganizationId || !memberToRetitle) {
      return;
    }

    const reason = changeTitleReason.trim();
    if (!changeTitleJobTitleId) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.selectNewJobTitle);
      return;
    }
    if (!reason) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.provideTitleChangeReason);
      return;
    }

    const selectedTitle = jobTitles.find((title) => title.id === changeTitleJobTitleId);
    if (!selectedTitle) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.selectedJobTitleMissing);
      return;
    }

    const currentMembershipRole = memberToRetitle.membership_job_title_id
      ?? memberToRetitle.membership_job_title_name;
    const isAlreadyAssigned =
      currentMembershipRole === selectedTitle.id ||
      (typeof currentMembershipRole === 'string' && currentMembershipRole.toLowerCase() === selectedTitle.name.toLowerCase());

    if (isAlreadyAssigned) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.selectedTitleAlreadyAssigned);
      return;
    }

    setMemberActionBusyKey(`title:${memberToRetitle.profile_id}`);
    try {
      await rpcClient.change_org_member_job_title_with_reason({
        p_org_id: activeOrganizationId,
        p_profile_id: memberToRetitle.profile_id,
        p_job_title_id: selectedTitle.id,
        p_reason: reason,
      });

      toast.success(ORG_DASHBOARD_TOAST_MESSAGES.changeMemberTitleSuccess);
      setChangeTitleDialogOpen(false);
      setMemberToRetitle(null);
      setChangeTitleReason('');
      setChangeTitleJobTitleId('');
      await loadDashboard();
    } catch (err) {
      console.error('[OrganizationDashboard] update member job title', err);
      toast.error(resolveOrgMemberActionErrorMessage(err, ORG_DASHBOARD_TOAST_MESSAGES.changeMemberTitleFailed));
    } finally {
      setMemberActionBusyKey(null);
    }
  };

  const handleLeaveOrganization = async (): Promise<void> => {
    if (!profile?.id || !activeOrganizationId) {
      return;
    }

    setMemberActionBusyKey(`leave:${profile.id}`);
    try {
      const leaveOrganizationRpc = (rpcClient as unknown as Record<string, (args: { p_org_id: string; p_reason: string }) => Promise<unknown>>).leave_my_organization;
      if (typeof leaveOrganizationRpc !== 'function') {
        throw new Error('leave_my_organization RPC is unavailable.');
      }

      await leaveOrganizationRpc({
        p_org_id: activeOrganizationId,
        p_reason: ORG_DASHBOARD_TOAST_MESSAGES.leaveOrganizationReason,
      });

      setProfile({
        ...profile,
        organization_id: profile.organization_id === activeOrganizationId ? null : profile.organization_id,
      });
      setSelectedOrganizationId(null);
      invalidateMyOrganizationsCache(profile.id);
      invalidateMyInactiveOrganizationsCache(profile.id);

      setLeaveOrganizationDialogOpen(false);
      toast.success(ORG_DASHBOARD_TOAST_MESSAGES.leaveOrganizationSuccess);
      navigate('/dashboard');
    } catch (err) {
      console.error('[OrganizationDashboard] leave organization', err);
      toast.error(resolveOrgMemberActionErrorMessage(err, ORG_DASHBOARD_TOAST_MESSAGES.leaveOrganizationFailed));
    } finally {
      setMemberActionBusyKey(null);
    }
  };

  const handleChangeMemberPermissionRole = async (): Promise<void> => {
    if (!activeOrganizationId || !memberToReRole) {
      return;
    }

    const selectedRole = asOrgRole(changeRolePermissionRole);
    if (!selectedRole) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.selectPermissionRole);
      return;
    }

    const currentRole = asOrgRole(memberToReRole.membership_permission_role);
    if (currentRole === selectedRole) {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.selectedPermissionRoleAlreadyAssigned);
      return;
    }

    if (currentRole === 'owner' && actorOrgRole !== 'owner') {
      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.changePermissionRoleOwnerOnly);
      return;
    }

    setMemberActionBusyKey(`role:${memberToReRole.profile_id}`);
    try {
      await rpcClient.set_org_member_role({
        p_org_id: activeOrganizationId,
        p_profile_id: memberToReRole.profile_id,
        p_role: selectedRole,
      });

      toast.success(ORG_DASHBOARD_TOAST_MESSAGES.changeMemberPermissionRoleSuccess);
      setChangeRoleDialogOpen(false);
      setMemberToReRole(null);
      setChangeRolePermissionRole('');
      await loadDashboard();
    } catch (err) {
      console.error('[OrganizationDashboard] update member org role', err);
      toast.error(resolveOrgMemberActionErrorMessage(err, ORG_DASHBOARD_TOAST_MESSAGES.changeMemberPermissionRoleFailed));
    } finally {
      setMemberActionBusyKey(null);
    }
  };

  const loadDashboard = useCallback(async () => {
    if (!activeOrganizationId) {
      setPayload(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await rpcClient.rpc_org_dashboard_payload({
        p_organization_id: activeOrganizationId,
        p_members_page: page,
        p_page_size: pageSize,
      });
      setPayload(normalizePayload(data));
    } catch (err) {
      setError(err instanceof Error ? err : 'Unable to load organization dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, page]);

  useEffect(() => {
    if (!profile?.id || myOrganizationsLoading) {
      return;
    }

    if (!hasStartedOrganizationsLoadRef.current) {
      return;
    }

    if (!activeOrganizationId) {
      navigate('/dashboard', { replace: true });
    }
  }, [activeOrganizationId, myOrganizationsLoading, navigate, profile?.id]);

  const uploadLogoBlob = useCallback(async (blob: Blob): Promise<string> => {
    if (!safePayload.organization.id) {
      setEditError('Organization is not available yet.');
      throw new Error('Organization is not available yet.');
    }
    if (!profile?.id) {
      setEditError('Profile is not ready yet.');
      throw new Error('Profile is not ready yet.');
    }
    if (!blob || blob.size === 0) {
      setEditError('Selected file is empty.');
      throw new Error('Selected file is empty.');
    }

    setEditError(null);

    try {
      const inferredExt = blob.type?.split('/')?.[1] ?? 'jpg';
      const fileName = `${crypto.randomUUID()}.${inferredExt}`;
      const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
      console.debug('[OrganizationDashboard] Uploading logo', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      const filePath = `${profile.id}/${fileName}`;

      const storedPath = await uploadStorageFile('avatars-personal', filePath, file, {
        module: 'OrganizationDashboard',
        operation: 'upload organization logo',
        trigger: 'user',
        ids: {
          organizationId: safePayload.organization.id,
          profileId: profile.id,
        },
      });

      const publicUrl = getStoragePublicUrl('avatars-personal', storedPath, {
        module: 'OrganizationDashboard',
        operation: 'resolve organization logo url',
        trigger: 'user',
        ids: {
          organizationId: safePayload.organization.id,
          profileId: profile.id,
        },
      });

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to upload logo.';
      setEditError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  }, [profile?.id, safePayload.organization.id]);

  const saveOrganization = useCallback(async () => {
    if (!safePayload.organization.id) {
      setEditError('Organization is not available yet.');
      return;
    }

    const withTimeout = async <T,>(promise: Promise<T>, label: string, timeoutMs = 15000): Promise<T> => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${label} timed out. Please retry.`));
        }, timeoutMs);
      });

      try {
        return await Promise.race([promise, timeoutPromise]);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    const normalizeOptionalText = (value: string): string | null => {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const nextName = formState.name.trim();
    if (!nextName) {
      setEditError('Organization name is required.');
      return;
    }

    const original = safePayload.organization;
    const originalName = original.name.trim();
    const originalDescription = original.description?.trim() ?? null;
    const originalMission = original.mission_statement?.trim() ?? null;
    const originalHeadquarters = original.headquarters?.trim() ?? null;
    const originalLogoUrl = original.logo_url ?? null;
    const nextDescription = normalizeOptionalText(formState.description);
    const nextMission = normalizeOptionalText(formState.mission_statement);
    const nextHeadquarters = normalizeOptionalText(formState.headquarters);
    const nextLogoUrl = normalizeOptionalText(formState.logo_url);

    const updates: Record<string, string | null> = {};
    if (nextName !== originalName) {
      updates.name = nextName;
    }
    if (nextDescription !== originalDescription) {
      updates.description = nextDescription;
    }
    if (nextMission !== originalMission) {
      updates.mission_statement = nextMission;
    }
    if (nextHeadquarters !== originalHeadquarters) {
      updates.headquarters = nextHeadquarters;
    }
    if (!pendingLogoBlob && nextLogoUrl !== originalLogoUrl) {
      updates.logo_url = nextLogoUrl;
    }

    if (!pendingLogoBlob && Object.keys(updates).length === 0) {
      setIsEditOpen(false);
      return;
    }

    setIsSaving(true);
    setEditError(null);
    console.debug('[OrganizationDashboard] Saving organization updates', updates);

    try {
      if (pendingLogoBlob) {
        setIsUploadingLogo(true);
        try {
          const uploadedUrl = await withTimeout(uploadLogoBlob(pendingLogoBlob), 'Logo upload');
          updates.logo_url = uploadedUrl;
          setFormState((prev) => ({ ...prev, logo_url: uploadedUrl }));
          if (pendingLogoPreviewUrl) {
            URL.revokeObjectURL(pendingLogoPreviewUrl);
          }
          setPendingLogoPreviewUrl(null);
          setPendingLogoBlob(null);
        } finally {
          setIsUploadingLogo(false);
        }
      }

      const rows = await withTimeout(rpcClient.update_my_organization({
        _input: updates,
      }), 'Saving organization');

      const updated = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      if (!updated) {
        throw new Error('Organization update did not return data.');
      }

      setPayload((prev) => {
        const next = prev ? { ...prev } : normalizePayload({});
        return {
          ...next,
          organization: {
            ...next.organization,
            id: updated.id,
            name: updated.name,
            description: updated.description,
            mission_statement: updated.mission_statement,
            headquarters: updated.headquarters,
            logo_url: updated.logo_url,
          },
        };
      });

      setIsEditOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update organization.';
      setEditError(message);
    } finally {
      setIsSaving(false);
    }
  }, [formState, pendingLogoBlob, pendingLogoPreviewUrl, safePayload.organization, uploadLogoBlob]);

  const handleLogoFileSelected = useCallback((file: File): void => {
    setEditError(null);
    if (pendingLogoPreviewUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(pendingLogoPreviewUrl);
      }, 0);
      setPendingLogoPreviewUrl(null);
    }
    setPendingLogoBlob(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoImageSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [pendingLogoPreviewUrl]);

  const handleLogoCropped = useCallback(async (blob: Blob): Promise<void> => {
    setEditError(null);
    const previousUrl = pendingLogoPreviewUrl;
    setPendingLogoBlob(blob);
    const previewUrl = URL.createObjectURL(blob);
    if (previousUrl && previousUrl !== previewUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(previousUrl);
      }, 0);
    }
    setPendingLogoPreviewUrl(previewUrl);
    setLogoImageSrc(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, [pendingLogoPreviewUrl]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <Page>
        <PageContainer>
          <LoadingState message="Loading organization dashboard…" />
        </PageContainer>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageContainer>
          <ErrorState error={error} onRetry={() => { void loadDashboard(); }} />
        </PageContainer>
      </Page>
    );
  }

  if (!payload) {
    return (
      <Page>
        <PageContainer>
          <EmptyState
            icon={<Building2 className="h-8 w-8" />}
            message="Organization not available"
            description="We couldn't load your organization dashboard yet."
          />
        </PageContainer>
      </Page>
    );
  }

  return (
    <Page>
      <PageContainer>
        <SectionContainer className="py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Organization Dashboard</h1>
            <p className="text-sm text-gray-400">Organization-wide snapshot and member roster.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b-4 border-indigo-500/20 pb-3 mb-4">
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex-shrink-0 h-24 w-24 rounded-lg bg-background-lighter flex items-center justify-center overflow-hidden">
                    {organization.logo_url ? (
                      <img src={organization.logo_url} alt={`${organization.name} logo`} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-lg font-semibold text-white">{initials}</span>
                    )}
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-white text-center flex-1">{organization.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-background-lighter text-gray-300 hover:text-white h-9 w-9 p-0"
                  aria-label="Edit organization info"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col gap-3 min-w-0 flex-[0_0_15%]">
                  <div>
                    <span className="text-base font-semibold text-indigo-500">Headquarters:</span>
                    <p className="text-sm text-gray-300 mt-1">{headquarters}</p>
                  </div>
                </div>

                <div className="border-l-4 border-indigo-500/20"></div>

                <div className="flex flex-col gap-3 min-w-0 flex-[0_0_85%] pr-[35px]">
                  {organization.description && (
                    <div className="overflow-hidden">
                      <span className="text-base font-semibold text-indigo-500">Company description:</span>
                      <p className="text-sm text-gray-300 mt-1 break-words overflow-wrap-anywhere max-w-full">{organization.description}</p>
                    </div>
                  )}
                  {organization.mission_statement && (
                    <div className="overflow-hidden">
                      <span className="text-base font-semibold text-indigo-500">Mission Statement:</span>
                      <p className="text-sm text-gray-300 mt-1 break-words overflow-wrap-anywhere max-w-full">{organization.mission_statement}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-2xl font-semibold text-indigo-500 text-center border-b-4 border-indigo-500/20 pb-3 mb-4">Metrics:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-background-light p-4">
                  <p className="text-xs uppercase text-gray-400">Total Members</p>
                  <p className="text-2xl font-semibold text-white">{safePayload.metrics.total_members}</p>
                  <p className="text-xs text-gray-500">
                    <span className={safePayload.metrics.members_yoy >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ({safePayload.metrics.members_yoy >= 0 ? '+' : ''}{safePayload.metrics.members_yoy} YOY)
                    </span>
                  </p>
                </div>
                <div className="rounded-lg bg-background-light p-4">
                  <p className="text-xs uppercase text-gray-400">Total Projects</p>
                  <p className="text-2xl font-semibold text-white">{safePayload.metrics.total_projects}</p>
                  <p className="text-xs text-gray-500">
                    <span className={safePayload.metrics.projects_yoy >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ({safePayload.metrics.projects_yoy >= 0 ? '+' : ''}{safePayload.metrics.projects_yoy} YOY)
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-base font-semibold text-indigo-500">Total Project Breakdown:</span>
                <div className="flex flex-col gap-1 mt-2">
                  {Object.entries(getProjectStatusCounts()).map(([status, count]) => (
                    <p key={status} className="text-sm text-gray-400">
                      #{status}: {count}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert('Organization finances feature coming soon!')}
                  className="text-indigo-500 hover:text-indigo-400"
                >
                  View Finances
                </Button>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-indigo-500 text-center border-b-4 border-indigo-500/20 pb-3 mb-4">Service Areas:</h3>
              <div className="flex items-center justify-center min-h-[120px]">
                {serviceAreas.length === 0 ? (
                  <EmptyState
                    message="No service areas"
                    description="Add service areas to highlight where your organization operates."
                  />
                ) : (
                  <ul className="space-y-2 text-center">
                    {serviceAreas.map((area) => (
                      <li key={area.id} className="text-sm text-gray-300">
                        {area.service_area_text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-indigo-500 text-center border-b-4 border-indigo-500/20 pb-3 mb-4">Members:</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">{totalMembers} total</p>
                </div>
                <Users className="h-5 w-5 text-gray-500" />
              </div>

              {sortedMembers.length === 0 ? (
                <EmptyState
                  message="No members"
                  description="Invite teammates to start collaborating."
                />
              ) : (
                <div className="space-y-3">
                  {sortedMembers.map((member) => (
                    <div
                      key={member.profile_id}
                      className="rounded-lg border border-background-lighter p-3"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {member.full_name || member.email}
                          </p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          <span className="block">Global role: {formatGlobalRole(member.global_role)}</span>
                          <span className="block">Org role: {resolveMemberPermissionRole(member)}</span>
                          <span className="block">Job title: {resolveMemberJobTitle(member)}</span>
                        </div>
                      </div>

                      {(canManageMemberActions || member.profile_id === profile?.id) && (
                        <div className="mt-3 flex items-center justify-end gap-2">
                          {canManageMemberActions && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openChangeTitleDialog(member)}
                                disabled={memberActionBusyKey != null}
                              >
                                Change Title
                              </Button>
                              {((asOrgRole(member.membership_permission_role) !== 'owner') || actorOrgRole === 'owner') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openChangeRoleDialog(member)}
                                  disabled={memberActionBusyKey != null}
                                >
                                  Edit Permission Role
                                </Button>
                              )}
                            </>
                          )}
                          {member.profile_id === profile?.id ? (
                            <button
                              type="button"
                              onClick={() => setLeaveOrganizationDialogOpen(true)}
                              disabled={memberActionBusyKey != null}
                              className="px-3 py-1 rounded border border-red-500 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              Leave Organization
                            </button>
                          ) : canManageMemberActions ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRemoveMemberDialog(member)}
                              disabled={memberActionBusyKey != null}
                            >
                              Remove Member
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canManagePendingInvites && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-3">Pending membership requests</h4>
                  {pendingInvitesLoading ? (
                    <LoadingState />
                  ) : pendingInvites.length === 0 ? (
                    <EmptyState message="No pending requests" description="No one has requested to join your organization." />
                  ) : (
                    <div className="space-y-3">
                      {pendingInvites.map((inv) => (
                        <div key={inv.id}>
                          <div className="rounded-lg border border-background-lighter p-3 flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-background-light overflow-hidden flex items-center justify-center shrink-0">
                                {inv.requester_avatar_url ? (
                                  <img src={inv.requester_avatar_url} alt="Requester avatar" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-xs text-gray-300 font-semibold">
                                    {(inv.requester_full_name ?? inv.requester_email ?? inv.invited_profile_id).slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white">{inv.requester_full_name ?? inv.invited_profile_id}</p>
                                  {inv.is_rejoin && (
                                    <span className="rounded border border-blue-500/50 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                                      Rejoin Request
                                    </span>
                                  )}
                                </div>
                                {inv.requester_email && <p className="text-xs text-gray-400">{inv.requester_email}</p>}
                                {inv.requester_phone && <p className="text-xs text-gray-400">{formatPhoneUS(inv.requester_phone)}</p>}
                                {inv.requester_location && <p className="text-xs text-gray-400">{inv.requester_location}</p>}
                                <p className="text-xs text-gray-400">Requested org role: {resolveInviteRequestedRole(inv)}</p>
                                <p className="text-xs text-gray-400">Requested job title: {resolveInviteRequestedTitle(inv)}</p>
                                <p className="text-xs text-gray-500 mt-1">Requested at: {new Date(inv.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="w-72 flex flex-col gap-2">
                              <div className="relative">
                                <input
                                  id={`approve-job-title-search-${inv.id}`}
                                  type="text"
                                  value={approveJobTitleQueryByInviteId[inv.id] ?? ''}
                                  onChange={(event) => {
                                    const nextQuery = event.target.value;
                                    setApproveJobTitleQueryByInviteId((prev) => ({ ...prev, [inv.id]: nextQuery }));
                                    setJobTitleOpenInviteId(inv.id);
                                  }}
                                  onFocus={() => setJobTitleOpenInviteId(inv.id)}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      setJobTitleOpenInviteId((current) => (current === inv.id ? null : current));
                                    }, 100);
                                  }}
                                  placeholder="Select or add job title"
                                  className="w-full bg-background border border-background-lighter text-gray-100 px-3 py-2 rounded-md focus:ring-2 focus:ring-primary text-sm"
                                  disabled={inviteActionId != null}
                                />

                                {jobTitleOpenInviteId === inv.id && (
                                  <div className="absolute z-50 mt-1 w-full bg-background border border-background-lighter rounded-md max-h-48 overflow-y-auto">
                                    {jobTitles
                                      .filter((title) => {
                                        const query = (approveJobTitleQueryByInviteId[inv.id] ?? '').trim().toLowerCase();
                                        if (!query) return true;
                                        return title.name.toLowerCase().includes(query);
                                      })
                                      .map((title) => (
                                        <button
                                          key={title.id}
                                          type="button"
                                          className={`w-full text-left px-3 py-2 text-sm hover:bg-background-light ${approveJobTitleIdByInviteId[inv.id] === title.id ? 'text-white' : 'text-gray-300'}`}
                                          onMouseDown={(event) => {
                                            event.preventDefault();
                                            setApproveJobTitleIdByInviteId((prev) => ({ ...prev, [inv.id]: title.id }));
                                            setApproveJobTitleQueryByInviteId((prev) => ({ ...prev, [inv.id]: title.name }));
                                            setJobTitleOpenInviteId(null);
                                          }}
                                        >
                                          {title.name}
                                        </button>
                                      ))}

                                    {jobTitles.filter((title) => {
                                      const query = (approveJobTitleQueryByInviteId[inv.id] ?? '').trim().toLowerCase();
                                      if (!query) return true;
                                      return title.name.toLowerCase().includes(query);
                                    }).length === 0 && (
                                        <button
                                          type="button"
                                          className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-background-light"
                                          onMouseDown={(event) => {
                                            event.preventDefault();
                                            void handleAddCustomJobTitle(inv.id);
                                          }}
                                          disabled={addingJobTitleInviteId === inv.id || !(approveJobTitleQueryByInviteId[inv.id] ?? '').trim()}
                                        >
                                          {addingJobTitleInviteId === inv.id ? 'Adding…' : 'Add custom job title'}
                                        </button>
                                      )}
                                  </div>
                                )}
                              </div>

                              <label htmlFor={`approve-org-role-${inv.id}`} className="text-xs text-gray-400">
                                Org role for approval
                              </label>
                              <select
                                id={`approve-org-role-${inv.id}`}
                                value={approvePermissionRoleByInviteId[inv.id] ?? ''}
                                onChange={(event) => {
                                  const selected = asOrgRole(event.target.value);
                                  if (!selected) return;
                                  setApprovePermissionRoleByInviteId((prev) => ({
                                    ...prev,
                                    [inv.id]: selected,
                                  }));
                                }}
                                className="w-full bg-background border border-background-lighter text-gray-100 px-3 py-2 rounded-md focus:ring-2 focus:ring-primary text-sm"
                                disabled={inviteActionId != null}
                              >
                                <option value="" disabled>Select org role</option>
                                {APPROVAL_ORG_ROLE_OPTIONS.map((roleOption) => (
                                  <option key={roleOption} value={roleOption}>
                                    {formatGlobalRole(roleOption)}
                                  </option>
                                ))}
                              </select>

                              <div className="flex justify-end gap-2">
                                <button
                                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  onClick={() => {
                                    const selectedTitleId = approveJobTitleIdByInviteId[inv.id] ?? null;
                                    const selectedPermissionRole = approvePermissionRoleByInviteId[inv.id] ?? null;
                                    if (!selectedTitleId) {
                                      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.selectOrCreateJobTitleBeforeApproval);
                                      return;
                                    }
                                    if (!selectedPermissionRole) {
                                      toast.error(ORG_DASHBOARD_TOAST_MESSAGES.selectPermissionRoleBeforeApproval);
                                      return;
                                    }
                                    void handleReviewInvite(inv, 'accepted', selectedTitleId, selectedPermissionRole);
                                  }}
                                  disabled={
                                    inviteActionId != null
                                    || !approveJobTitleIdByInviteId[inv.id]
                                    || !approvePermissionRoleByInviteId[inv.id]
                                  }
                                >
                                  {inviteActionId === inv.id ? 'Updating…' : (inv.is_rejoin ? 'Re-admit User' : 'Approve')}
                                </button>
                                <button
                                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  onClick={() => { void handleReviewInvite(inv, 'declined'); }}
                                  disabled={inviteActionId != null}
                                >
                                  {inviteActionId === inv.id ? 'Updating…' : 'Deny'}
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-indigo-500 text-center border-b-4 border-indigo-500/20 pb-3 mb-4">Projects:</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                  {Object.entries(getProjectStatusCounts()).map(([status, count]) => (
                    <p key={status} className="text-sm text-gray-400">
                      #{status}: {count}
                    </p>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/projects/create')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </div>

              {projectsLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <EmptyState
                  message="No projects"
                  description="Create your first project to get started."
                />
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-lg border border-background-lighter p-3 cursor-pointer hover:bg-background-lighter transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-white">
                          {project.name}
                        </p>
                        {project.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {project.start_date && (
                            <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                          )}
                          {project.status && (
                            <span className="px-2 py-1 rounded bg-background text-xs text-gray-300">
                              {project.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {safePayload.metrics.total_projects > 5 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className="text-purple-500 hover:text-purple-400"
                      >
                        View all projects
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </SectionContainer>
      </PageContainer>

      <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Remove {memberToRemove?.full_name ?? memberToRemove?.email ?? 'this member'} from {safePayload.organization.name}. A notification with your reason will be sent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="remove-member-reason" className="text-sm text-gray-300">Reason</label>
            <textarea
              id="remove-member-reason"
              className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
              rows={4}
              placeholder="Reason for removal"
              value={removeMemberReason}
              onChange={(event) => setRemoveMemberReason(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRemoveMemberDialogOpen(false);
                setMemberToRemove(null);
                setRemoveMemberReason('');
              }}
              disabled={memberActionBusyKey != null}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { void handleRemoveMember(); }}
              disabled={memberActionBusyKey != null || removeMemberReason.trim().length === 0}
            >
              {memberActionBusyKey?.startsWith('remove:') ? 'Removing…' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changeTitleDialogOpen} onOpenChange={setChangeTitleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Change member job title</DialogTitle>
            <DialogDescription>
              Update the job title for {memberToRetitle?.full_name ?? memberToRetitle?.email ?? 'this member'}. A notification with your reason will be sent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="change-member-title" className="text-sm text-gray-300">Job title</label>
              <select
                id="change-member-title"
                className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                value={changeTitleJobTitleId}
                onChange={(event) => setChangeTitleJobTitleId(event.target.value)}
              >
                <option value="">Select a job title</option>
                {jobTitles.map((title) => (
                  <option key={title.id} value={title.id}>{title.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="change-member-title-reason" className="text-sm text-gray-300">Reason</label>
              <textarea
                id="change-member-title-reason"
                className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                rows={4}
                placeholder="Reason for title change"
                value={changeTitleReason}
                onChange={(event) => setChangeTitleReason(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChangeTitleDialogOpen(false);
                setMemberToRetitle(null);
                setChangeTitleReason('');
                setChangeTitleJobTitleId('');
              }}
              disabled={memberActionBusyKey != null}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { void handleChangeMemberJobTitle(); }}
              disabled={memberActionBusyKey != null || !changeTitleJobTitleId || changeTitleReason.trim().length === 0}
            >
              {memberActionBusyKey?.startsWith('title:') ? 'Updating…' : 'Update Title'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Change member permission role</DialogTitle>
            <DialogDescription>
              Update the organization role for {memberToReRole?.full_name ?? memberToReRole?.email ?? 'this member'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="change-member-permission-role" className="text-sm text-gray-300">Org role</label>
              <select
                id="change-member-permission-role"
                className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                value={changeRolePermissionRole}
                onChange={(event) => {
                  const nextRole = asOrgRole(event.target.value);
                  setChangeRolePermissionRole(nextRole ?? '');
                }}
              >
                <option value="">Select an org role</option>
                {APPROVAL_ORG_ROLE_OPTIONS.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>{formatGlobalRole(roleOption)}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChangeRoleDialogOpen(false);
                setMemberToReRole(null);
                setChangeRolePermissionRole('');
              }}
              disabled={memberActionBusyKey != null}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { void handleChangeMemberPermissionRole(); }}
              disabled={memberActionBusyKey != null || !changeRolePermissionRole}
            >
              {memberActionBusyKey?.startsWith('role:') ? 'Updating…' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={leaveOrganizationDialogOpen} onOpenChange={setLeaveOrganizationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Leave organization</DialogTitle>
            <DialogDescription>
              {ORG_DASHBOARD_TOAST_MESSAGES.leaveOrganizationConfirm}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveOrganizationDialogOpen(false)}
              disabled={memberActionBusyKey != null}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { void handleLeaveOrganization(); }}
              disabled={memberActionBusyKey != null}
            >
              Yes, I am sure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit organization</DialogTitle>
            <DialogDescription>
              Update your organization profile, mission, and branding.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {/* Wizard body */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                {['Basics', 'Mission', 'Branding'].map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${index <= editStep ? 'bg-primary' : 'bg-gray-600'}`} />
                    <span>{label}</span>
                    {index < 2 && <span className="text-gray-600">/</span>}
                  </div>
                ))}
              </div>

              {editStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300">Organization name</label>
                    <input
                      className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                      value={formState.name}
                      onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Macadamy"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Description</label>
                    <textarea
                      className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                      rows={4}
                      placeholder="Short description of your organization"
                    />
                  </div>
                </div>
              )}

              {editStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300">Mission statement</label>
                    <textarea
                      className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                      value={formState.mission_statement}
                      onChange={(event) => setFormState((prev) => ({ ...prev, mission_statement: event.target.value }))}
                      rows={4}
                      placeholder="Describe your mission"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Headquarters</label>
                    <input
                      className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                      value={formState.headquarters}
                      onChange={(event) => setFormState((prev) => ({ ...prev, headquarters: event.target.value }))}
                      placeholder="City, State"
                    />
                  </div>
                </div>
              )}

              {editStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-background-lighter flex items-center justify-center overflow-hidden">
                      {logoPreviewSrc ? (
                        <img src={logoPreviewSrc} alt="Organization logo" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-white">{initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Logo preview</p>
                      <p className="text-xs text-gray-500">Upload a square image for best results.</p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="org-logo-upload" className="text-sm text-gray-300">Organization logo</label>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        id="org-logo-upload"
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        aria-label="Upload organization logo"
                        title="Upload organization logo"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            handleLogoFileSelected(file);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        isLoading={isUploadingLogo}
                      >
                        Upload logo
                      </Button>
                      {formState.logo_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (pendingLogoPreviewUrl) {
                              setTimeout(() => {
                                URL.revokeObjectURL(pendingLogoPreviewUrl);
                              }, 0);
                            }
                            setPendingLogoPreviewUrl(null);
                            setPendingLogoBlob(null);
                            setLogoImageSrc(null);
                            setFormState((prev) => ({ ...prev, logo_url: '' }));
                          }}
                          disabled={isUploadingLogo}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {logoImageSrc && (
                    <div className="mt-4">
                      <ImageCropper
                        key={logoImageSrc}
                        imageSrc={logoImageSrc}
                        onCropComplete={(blob) => { void handleLogoCropped(blob); }}
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
                </div>
              )}

              {editError && (
                <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {editError}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditStep((prev) => Math.max(prev - 1, 0))}
                  disabled={editStep === 0 || isSaving}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditStep((prev) => Math.min(prev + 1, 2))}
                  disabled={editStep === 2 || isSaving}
                >
                  Next
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)} disabled={isSaving || isUploadingLogo}>
                  Cancel
                </Button>
                {editStep === 2 && (
                  <Button size="sm" onClick={() => { void saveOrganization(); }} isLoading={isSaving} disabled={isUploadingLogo}>
                    Save changes
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Page>
  );
}

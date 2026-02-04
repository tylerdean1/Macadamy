import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Pencil, Users } from 'lucide-react';
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
import { rpcClient } from '@/lib/rpc.client';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import type { Database } from '@/lib/database.types';

type RoleType = Database['public']['Enums']['user_role_type'];

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
      membership_role: string | null;
    }>;
  };
  metrics: {
    total_members: number;
    total_projects: number;
  };
}

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
  },
};

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
          membership_role: typeof item.membership_role === 'string' ? item.membership_role : null,
        }))
        .filter((item) => item.profile_id !== '' && item.email !== ''),
    },
    metrics: {
      total_members: typeof metrics.total_members === 'number' ? metrics.total_members : 0,
      total_projects: typeof metrics.total_projects === 'number' ? metrics.total_projects : 0,
    },
  };
};

export default function OrganizationDashboard(): JSX.Element {
  useRequireProfile();

  const { profile } = useAuthStore();
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
  const safePayload = payload ?? emptyPayload;

  const serviceAreas = useMemo(() => {
    return [...safePayload.service_areas].sort((a, b) => a.service_area_text.localeCompare(b.service_area_text));
  }, [safePayload.service_areas]);

  const organization = safePayload.organization;
  const mission = organization.mission_statement?.trim()
    || organization.description?.trim()
    || 'No mission statement yet.';
  const headquarters = organization.headquarters?.trim() || 'Headquarters not set.';
  const initials = organization.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ORG';
  const logoPreviewSrc = pendingLogoPreviewUrl ?? logoImageSrc ?? formState.logo_url;

  const totalMembers = safePayload.members.total_count;
  const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  useEffect(() => {
    setPage(1);
  }, [profile?.organization_id]);

  useEffect(() => {
    if (!isEditOpen) return;
    setEditStep(0);
    setEditError(null);
    setLogoImageSrc(null);
    if (pendingLogoPreviewUrl) {
      URL.revokeObjectURL(pendingLogoPreviewUrl);
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
  }, [isEditOpen, pendingLogoPreviewUrl, safePayload.organization]);

  const loadDashboard = useCallback(async () => {
    if (!profile?.organization_id) {
      setPayload(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await rpcClient.rpc_org_dashboard_payload({
        p_organization_id: profile.organization_id,
        p_members_page: page,
        p_page_size: pageSize,
      });
      setPayload(normalizePayload(data));
    } catch (err) {
      setError(err instanceof Error ? err : 'Unable to load organization dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [page, profile?.organization_id]);

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

      const { data, error } = await supabase.storage
        .from('avatars-personal')
        .upload(filePath, file, {
          upsert: false,
          cacheControl: '3600',
          contentType: file.type || 'image/png',
        });

      if (error) {
        console.error('[OrganizationDashboard] Logo upload error', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars-personal')
        .getPublicUrl(data.path);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Unable to generate logo URL');
      }

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

    if (!formState.name.trim()) {
      setEditError('Organization name is required.');
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      let nextLogoUrl = formState.logo_url.trim() || null;
      if (pendingLogoBlob) {
        setIsUploadingLogo(true);
        try {
          const uploadedUrl = await uploadLogoBlob(pendingLogoBlob);
          nextLogoUrl = uploadedUrl;
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

      const updates = {
        name: formState.name.trim(),
        description: formState.description.trim() || null,
        mission_statement: formState.mission_statement.trim() || null,
        headquarters: formState.headquarters.trim() || null,
        logo_url: nextLogoUrl,
      };

      const rows = await rpcClient.update_organizations({
        _id: safePayload.organization.id,
        _input: updates,
      });

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
  }, [formState, pendingLogoBlob, pendingLogoPreviewUrl, safePayload.organization.id, uploadLogoBlob]);

  const handleLogoFileSelected = useCallback((file: File): void => {
    setEditError(null);
    if (pendingLogoPreviewUrl) {
      URL.revokeObjectURL(pendingLogoPreviewUrl);
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
    setPendingLogoBlob(blob);
    const previewUrl = URL.createObjectURL(blob);
    if (pendingLogoPreviewUrl) {
      URL.revokeObjectURL(pendingLogoPreviewUrl);
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
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-16 w-16 rounded-full bg-background-lighter flex items-center justify-center overflow-hidden">
                    {organization.logo_url ? (
                      <img src={organization.logo_url} alt={`${organization.name} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-white">{initials}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white">{organization.name}</h2>
                    <p className="text-sm text-gray-300">{mission}</p>
                    <p className="text-sm text-gray-400">Headquarters: {headquarters}</p>
                  </div>
                </div>
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
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-background-light p-4">
                  <p className="text-xs uppercase text-gray-400">Total Members</p>
                  <p className="text-2xl font-semibold text-white">{safePayload.metrics.total_members}</p>
                </div>
                <div className="rounded-lg bg-background-light p-4">
                  <p className="text-xs uppercase text-gray-400">Total Projects</p>
                  <p className="text-2xl font-semibold text-white">{safePayload.metrics.total_projects}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Areas</h3>
              {serviceAreas.length === 0 ? (
                <EmptyState
                  message="No service areas"
                  description="Add service areas to highlight where your organization operates."
                />
              ) : (
                <ul className="space-y-2">
                  {serviceAreas.map((area) => (
                    <li key={area.id} className="text-sm text-gray-300">
                      {area.service_area_text}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Members</h3>
                  <p className="text-sm text-gray-400">{totalMembers} total</p>
                </div>
                <Users className="h-5 w-5 text-gray-500" />
              </div>

              {safePayload.members.items.length === 0 ? (
                <EmptyState
                  message="No members"
                  description="Invite teammates to start collaborating."
                />
              ) : (
                <div className="space-y-3">
                  {safePayload.members.items.map((member) => (
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
                          <span className="block">Global role: {member.global_role ?? 'unassigned'}</span>
                          <span className="block">Membership role: {member.membership_role ?? 'unassigned'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
        </SectionContainer>
      </PageContainer>

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
                              URL.revokeObjectURL(pendingLogoPreviewUrl);
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
                        cropShape="rect"
                        compressionOptions={{
                          mimeType: 'image/jpeg',
                          quality: 0.8,
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
                <Button size="sm" onClick={() => { void saveOrganization(); }} isLoading={isSaving} disabled={isUploadingLogo}>
                  Save changes
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

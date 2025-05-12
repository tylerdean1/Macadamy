import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useAuthStore } from '@/lib/store';
import type {
  Profile,
  Avatars,
  Organization,
  JobTitle,
  Contracts
} from '@/lib/types';

import { ProfileSection } from './StandardPageComponents/ProfileSelction';
import { EditProfileModal } from './StandardPageComponents/EditProfileModal';
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';
import { ContractsSection } from './StandardPageComponents/ContractsSection';

export function Dashboard() {
  useRequireProfile();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Local state
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatars, setAvatars] = useState<Avatars[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    avatar_id: '',
    organization_id: '',
    job_title_id: '',
    address: '',
    phone: '',
    email: '',
    custom_job_title: ''
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [metrics, setMetrics] = useState({
    activeContracts: 0,
    openIssues: 0,
    pendingInspections: 0
  });
  const [contracts, setContracts] = useState<Contracts[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // === Handlers ===
  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', user.id);
    setProfile(p => p ? { ...p, avatar_url: url } : p);
    setIsModalOpen(false);
  };

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === 'create-new') {
      navigate('/create-organization');
      return;
    }
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    let jobTitleId = editForm.job_title_id;
    if (!jobTitleId && editForm.custom_job_title.trim()) {
      const { data: newJT, error: jtErr } = await supabase
        .from('job_titles')
        .insert({ title: editForm.custom_job_title.trim(), is_custom: true })
        .select()
        .single();
      if (jtErr || !newJT) {
        toast.error('Failed to create job title.');
        return;
      }
      jobTitleId = newJT.id;
    }

    const { error: updErr } = await supabase
      .from('profiles')
      .update({
        avatar_id: editForm.avatar_id,
        organization_id: editForm.organization_id,
        job_title_id: jobTitleId,
        phone: editForm.phone,
        email: editForm.email,
        location: editForm.address
      })
      .eq('id', user.id);

    if (updErr) {
      toast.error('Failed to update profile.');
      return;
    }

    // Re-fetch profile (including avatar_id)
    const { data: profRes, error: profErr } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        full_name,
        email,
        username,
        phone,
        location,
        avatar_id,
        avatar_url,
        organization_id,
        job_title_id,
        organizations!profiles_organization_id_fkey(name,address,phone,website),
        job_titles!profiles_job_title_id_fkey(title,is_custom)
      `)
      .eq('id', user.id)
      .single();

    if (profErr || !profRes) {
      toast.error('Failed to reload profile.');
      return;
    }
    setProfile({ ...profRes, user_role: profRes.role } as Profile); // Ensure user_role is set
    setIsModalOpen(false);
  };

  // === Data Load ===
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);

      // orgs, job titles, profile (with avatar_id!)
      const [orgRes, jobRes, profRes] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('job_titles').select('*'),
        supabase
          .from('profiles')
          .select(`
            id,
            role,
            full_name,
            email,
            username,
            phone,
            location,
            avatar_id,
            avatar_url,
            organization_id,
            job_title_id,
            organizations!profiles_organization_id_fkey(name,address,phone,website),
            job_titles!profiles_job_title_id_fkey(title,is_custom)
          `)
          .eq('id', user.id)
          .single()
      ]);

      if (profRes.error || !profRes.data) {
        toast.error('Failed to load profile.');
        setLoading(false);
        return;
      }
      const prof = { ...profRes.data, user_role: profRes.data.role } as Profile;
      setProfile(prof);
      setOrganizations(orgRes.data || []);
      setJobTitles(jobRes.data || []);
      setEditForm({
        avatar_id: prof.avatar_id || '',
        organization_id: prof.organization_id || '',
        job_title_id: prof.job_title_id || '',
        address: prof.location || '',
        phone: prof.phone || '',
        email: prof.email || '',
        custom_job_title: prof.job_titles?.is_custom
          ? prof.job_titles.title
          : ''
      });

      // avatars list (used in modal)
      const { data: avs } = await supabase
        .from('avatars')
        .select('*')
        .or(`is_preset.eq.true,profile_id.eq.${user.id}`)
        .order('created_at');
      setAvatars(avs || []);                 // now using setAvatars

      // user_contracts → contract IDs
      const ucRes = await supabase
        .from('user_contracts')
        .select('contract_id')
        .eq('user_id', user.id);
      const ids = ucRes.data?.map(u => u.contract_id) || [];
      if (ids.length === 0) {
        setContracts([]);
        setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
        setLoading(false);
        return;
      }

      // contracts & metrics in parallel
      const [
        { data: contractData },
        { data: activeRows },
        { data: openIssueRows },
        { data: inspectionRows }
      ] = await Promise.all([
        // 1. Full contract list
        supabase
          .from('contracts')
          .select('*')
          .in('id', ids)
          .order('created_at', { ascending: false }),

        // 2. Active contracts (we only need IDs to count)
        supabase
          .from('contracts')
          .select('id')
          .in('id', ids)
          .eq('status', 'Active'),

        // 3. Open issues
        supabase
          .from('issues')
          .select('id')
          .in('contract_id', ids)
          .eq('status', 'Open'),

        // 4. All inspections (no status filter)
        supabase
          .from('inspections')
          .select('id')
          .in('contract_id', ids)
      ]);

      // Compute counts client-side
      const activeCount = activeRows?.length ?? 0;
      const issuesCount = openIssueRows?.length ?? 0;
      const inspCount   = inspectionRows?.length ?? 0;

      // Update your state
      setContracts(contractData || []);
      setMetrics({
        activeContracts:    activeCount,
        openIssues:         issuesCount,
        pendingInspections: inspCount,
      });

      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No profile found
      </div>
    );
  }

  const filteredContracts = contracts.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProfileSection
          profile={profile}
          onEdit={() => setIsModalOpen(true)}
        />

        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          avatars={avatars}
          profileAvatarUrl={profile.avatar_url}
          organizations={organizations}
          jobTitles={jobTitles}
          editForm={editForm}
          selectedImage={selectedImage}
          crop={crop}
          zoom={zoom}
          croppedAreaPixels={croppedAreaPixels}
          onAvatarSelect={handleAvatarSelect}
          onAvatarUpload={handleAvatarUpload}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, area) => setCroppedAreaPixels(area)}
          onFormChange={handleFormChange}
          onSaveProfile={handleSaveProfile}
        />

        <DashboardMetrics
          activeContracts={metrics.activeContracts}
          openIssues={metrics.openIssues}
          pendingInspections={metrics.pendingInspections}
        />

        <ContractsSection
          filteredContracts={filteredContracts}
          searchQuery={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
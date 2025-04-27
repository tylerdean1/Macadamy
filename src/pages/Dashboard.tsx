import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Mail, MapPin, Phone, Plus, Search, FileText, Calendar,
  DollarSign, AlertTriangle, ClipboardList, Pencil
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import type { Profile } from '@/lib/types';
import type { Area, Avatars, Organization, JobTitle } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField, FormSection } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { UserRole } from '@/lib/enums';
import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useAuthStore } from '@/lib/store';
import { logError } from '@/utils/errorLogger';



interface EditForm {
  avatar_id?: string;
  organization_id?: string;
  job_title_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  custom_job_title?: string;
}

export function Dashboard() {
  useRequireProfile();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [contracts, setContracts] = useState<Database['public']['Tables']['contracts']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatars, setAvatars] = useState<Avatars[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [job_titles, setJobTitles] = useState<JobTitle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    avatar_id: '',
    organization_id: '',
    job_title_id: '',
    address: '',
    phone: '',
    email: '',
    custom_job_title: ''
  });
  
  const [metrics, setMetrics] = useState({
    activeContracts: 0,
    openIssues: 0,
    pendingInspections: 0
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    if (profile) {
      setProfile({ ...profile, avatar_url: url });
    }
    setIsModalOpen(false);
  };

  const handleAvatarUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropAndUpload = async () => {
    if (!selectedImage || !croppedAreaPixels || !user) return;
    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
      const fileName = 'avatar';
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('avatar-private')
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('avatar-private').getPublicUrl(filePath);
      await handleAvatarSelect(publicUrl);
      toast.success('Avatar uploaded successfully!');
      setSelectedImage(null);
    } catch (error: unknown) {
      logError('Dashboard handleAvatarUpload', error);
      toast.error('Upload failed');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === 'create-new') {
      navigate('/create-organization');
      return;
    }
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    let jobTitleId = editForm.job_title_id;
    if (!jobTitleId && editForm.custom_job_title?.trim()) {
      const { data: newJobTitle, error } = await supabase
        .from('job_titles')
        .insert({ title: editForm.custom_job_title.trim(), is_custom: true })
        .select()
        .single();
      if (error) {
        toast.error('Failed to create job title.');
        return;
      }
      jobTitleId = newJobTitle.id;
    }
    const { error: updateError } = await supabase.from('profiles').update({
      organization_id: editForm.organization_id,
      job_title_id: jobTitleId,
      phone: editForm.phone,
      email: editForm.email,
      location: editForm.address
    }).eq('id', user.id);

    if (updateError) {
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile updated!');
      const { data: updatedProfile, error: updatedProfileError } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          full_name,
          email,
          username,
          phone,
          location,
          avatar_url,
          organization_id,
          job_title_id,
          organizations!profiles_organization_id_fkey ( name, address, phone, website ),
          job_titles!profiles_job_title_id_fkey ( title, is_custom )
        `)
        .eq('id', user.id)
        .single();

      if (updatedProfileError || !updatedProfile) {
        console.error('Failed to refetch updated profile:', updatedProfileError?.message || 'No profile data found.');
        toast.error('Failed to reload profile after saving.');
        return;
      }
      
      setProfile(updatedProfile as unknown as Profile);
      setIsModalOpen(false);
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contract.description && contract.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    contract.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        console.error('User not available yet.');
        return;
      }
    
      setLoading(true);
      try {
        // Fetch profile and supporting tables in parallel
        const [organizationsData, jobData, profileResponse] = await Promise.all([
          supabase.from('organizations').select('*'),
          supabase.from('job_titles').select('*'),
          supabase
            .from('profiles')
            .select(`
              id, role, full_name, email, username, phone, location, avatar_url,
              organization_id, job_title_id,
              organizations!profiles_organization_id_fkey (name, address, phone, website),
              job_titles!profiles_job_title_id_fkey (title, is_custom)
            `)
            .eq('id', user.id)
            .single()
        ]);
        console.log('✅ Organizations loaded:', organizationsData.data);

        if (!profileResponse.data || profileResponse.error) {
          console.error('Failed to fetch profile:', profileResponse.error?.message);
          return;
        }
        
        console.log('✅ Profile loaded:', profileResponse.data);
    
        const validRoles = Object.values(UserRole);
        const safeProfile = {
          id: profileResponse.data.id,
          user_role: validRoles.includes(profileResponse.data.role as UserRole)
            ? (profileResponse.data.role as UserRole)
            : UserRole.Admin,
          full_name: profileResponse.data.full_name,
          email: profileResponse.data.email,
          username: profileResponse.data.username,
          phone: profileResponse.data.phone,
          location: profileResponse.data.location,
          avatar_url: profileResponse.data.avatar_url,
          organization_id: profileResponse.data.organization_id,
          job_title_id: profileResponse.data.job_title_id,
          organizations: profileResponse.data.organizations,
          job_titles: profileResponse.data.job_titles,
        } as Profile;
    
        console.log('✅ Safe profile created:', safeProfile);
        setProfile(safeProfile);
        setOrganizations(organizationsData.data || []);
        setJobTitles(jobData.data || []);
    
        let customJobTitle = '';
        if (safeProfile.job_title_id && jobData.data) {
          const match = jobData.data.find(j => j.id === safeProfile.job_title_id);
          if (match?.is_custom) customJobTitle = match.title ?? '';
        }
        setEditForm({
          avatar_id: safeProfile.avatar_url ?? '',
          organization_id: safeProfile.organization_id ?? '',
          job_title_id: safeProfile.job_title_id ?? '',
          address: safeProfile.location ?? '',
          phone: safeProfile.phone ?? '',
          email: safeProfile.email ?? '',
          custom_job_title: customJobTitle,
        });
        
        console.log('✅ Edit form set:', editForm);
    
        // Fetch avatars separately
        const { data: avatarData } = await supabase
          .from('avatars')
          .select('*')
          .or(`is_preset.eq.true,profile_id.eq.${user.id}`)
          .order('created_at');
        setAvatars((avatarData || []) as Avatars[]);
        console.log('✅ Avatars loaded:', avatarData);

        // Fetch user contracts
        const { data: userContracts, error: userContractsError } = await supabase
          .from('user_contracts')
          .select('contract_id')
          .eq('user_id', user.id);
    
        if (userContractsError || !userContracts) {
          console.error('Failed to fetch user contracts', userContractsError?.message);
          setContracts([]);
          return;
        }
    
        const contractIds = userContracts.map(uc => uc.contract_id);
        if (contractIds.length === 0) {
          setContracts([]);
          setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
          return;
        }
        console.log('✅ User contracts loaded:', userContracts);

        // Fetch contracts
        const [{ data: contractData }, { data: activeContracts }, { count: issuesCount }] = await Promise.all([
          supabase.from('contracts').select('*').in('id', contractIds).order('created_at', { ascending: false }),
          supabase.from('contracts').select('id').in('id', contractIds).eq('status', 'Active'),
          supabase.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'Open').in('contract_id', contractIds),
        ]);
        console.log('✅ Contracts loaded:', contractData);
    
        setContracts(contractData || []);
        setMetrics({
          activeContracts: activeContracts?.length || 0,
          openIssues: issuesCount || 0,
          pendingInspections: 0,
        });
        console.log('✅ Metrics set:', metrics);
      } catch (error: unknown) {
        logError('Dashboard fetchData', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user || typeof user !== 'object') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-400">Loading user information...</div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-400">Loading profile information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt="Avatar" className="w-14 h-14 rounded-full border border-background-lighter" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Welcome back, {profile?.full_name}
                  </h1>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="mt-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
              {(profile?.organizations || profile?.job_titles) && (
                <div className="text-gray-400 space-y-1">
                  {profile?.organizations?.name && (
                    <p className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      {profile.organizations.name.replace(/\s+\(DEMO:.*?\)/, '')}
                    </p>
                  )}
                  {profile?.job_titles?.title && (
                    <p className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {profile.job_titles.title}
                    </p>
                  )}
                  {profile?.organizations?.address && (
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {profile.organizations.address}
                    </p>
                  )}
                  {profile?.organizations?.phone && (
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {profile.organizations.phone}
                    </p>
                  )}
                  {profile?.organizations?.website && (
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
              )}
            </div>
          </div>
        </Card>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Edit Profile"
          className="max-w-lg"
        >
          <div className="px-6 pb-6 custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <FormSection title="Avatar">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.url)}
                    className={`rounded-lg overflow-hidden border-2 ${profile?.avatar_url === avatar.url ? 'border-primary' : 'border-background-lighter'}`}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-full h-24 object-cover" />
                  </button>
                ))}
                <label
                  className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-background-lighter hover:border-primary transition-colors"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto text-gray-400" />
                      <span className="block mt-1 text-sm text-gray-400">Upload</span>
                    </div>
                  </div>
                  <div className="h-24"></div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file); // Handle avatar upload
                      }
                    }}
                  />
                </label>
              </div>

              {selectedImage && (
                <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden mt-4">
                  <Cropper
                    image={selectedImage} // Set the selected image for cropping
                    crop={crop} // Current crop coordinates
                    zoom={zoom} // Zoom level
                    aspect={1} // Aspect ratio for cropping
                    cropShape="round" // Shape of the crop
                    showGrid={false} // Disable the grid
                    onCropChange={setCrop} // Update crop coordinates
                    onZoomChange={setZoom} // Update zoom level
                    onCropComplete={(_, croppedAreaPixels) =>
                      setCroppedAreaPixels(croppedAreaPixels)} // Save the cropped area
                  />
                  <Button
                    className="absolute bottom-3 right-3"
                    onClick={handleCropAndUpload} // Upload cropped image
                    size="sm"
                  >
                    Crop & Upload
                  </Button>
                </div>
              )}
            </FormSection>

            <FormField
              label="Organization"
              htmlFor="organization_id"
              className="mb-4"
            >
              <Select
                id="organization_id"
                name="organization_id"
                value={editForm.organization_id || ''}
                onChange={handleFormChange}
                options={[
                  { value: "", label: "-- Select Organization --" },
                  ...organizations.map(org => ({ value: org.id, label: org.name })),
                  { value: "create-new", label: "➕ Add New Organization" }
                ]}
              />
            </FormField>

            <FormField
              label="Role"
              htmlFor="job_title_id"
              className="mb-4"
            >
              <Select
                id="job_title_id"
                name="job_title_id"
                value={editForm.job_title_id || ''}
                onChange={(e) => {
                  if (e.target.value === 'custom-role') {
                    setEditForm((prev) => ({ ...prev, job_title_id: '', custom_job_title: '' }));
                  } else {
                    handleFormChange(e);
                  }
                }}
                options={[
                  { value: "", label: "-- Select Role --" },
                  ...job_titles.map(title => ({ value: title.id, label: title.title })),
                  { value: "custom-role", label: "➕ Add Custom Role" }
                ]}
              />
              {editForm.job_title_id === '' && (
                <Input
                  type="text"
                  name="custom_job_title"
                  placeholder="Enter your role"
                  value={editForm.custom_job_title || ''}
                  onChange={handleFormChange}
                  className="mt-2"
                />
              )}
            </FormField>

            <FormField
              label="Address"
              htmlFor="address"
              className="mb-4"
            >
              <Input
                type="text"
                id="address"
                name="address"
                value={editForm.address || ''}
                onChange={handleFormChange}
              />
            </FormField>

            <FormField
              label="Phone"
              htmlFor="phone"
              className="mb-4"
            >
              <Input
                type="text"
                id="phone"
                name="phone"
                value={editForm.phone || ''}
                onChange={handleFormChange}
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="email"
              className="mb-4"
            >
              <Input
                type="email"
                id="email"
                name="email"
                value={editForm.email || ''}
                onChange={handleFormChange}
              />
            </FormField>

            <Button
              onClick={handleSaveProfile} // Save changes to the profile
              className="w-full mt-4"
            >
              Save
            </Button>
          </div>
        </Modal>

        {/* Metrics and Contracts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-white">Active Contracts</h3>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.activeContracts}</p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-medium text-white">Open Issues</h3>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.openIssues}</p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-white">Pending Inspections</h3>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.pendingInspections}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-white mb-6">Contracts</h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search contracts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Handle search input for filtering contracts
                    className="w-full sm:w-64 pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={() => navigate('/ContractCreation')} // Navigate to create a new contract
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Contract
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Contracts Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery
                    ? "No contracts match your search criteria"
                    : "Start by creating your first contract"}
                </p>
              </div>
            ) : (
              <>
                {filteredContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                    onClick={() => {
                      if (!contract?.id) {
                        toast.error('Contract ID is missing, cannot open contract.');
                        console.error('Contract ID missing for selected contract:', contract);
                        return;
                      }
                      navigate(`/contracts/${contract.id}`);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          {contract.title?.replace(/\s*\(Demo:.*?\)/i, '')?.trim() || 'N/A'}
                          {contract.title?.includes('(Demo:') && (
                            <span className="ml-2 text-xs text-yellow-400 font-semibold">Demo</span>
                          )}
                        </h3>
                        <p className="text-gray-400 mb-4">{contract.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          {contract.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {contract.location}
                            </div>
                          )}
                          {contract.start_date && contract.end_date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                            </div>
                          )}
                          {typeof contract.budget === 'number' && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              ${contract.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            contract.status === 'Active'
                              ? 'success'
                              : contract.status === 'Final Review'
                              ? 'info'
                              : contract.status === 'Closed'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {contract.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
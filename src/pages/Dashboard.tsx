import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Mail, MapPin, Phone, Plus, Search, FileText, Calendar,
  DollarSign, AlertTriangle, ClipboardList, Pencil
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import type { Profile } from '@/lib/types';
import type { Area, Avatar, Organization, JobTitle } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField, FormSection } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';

// Definition for the editable form structure when modifying user information
interface EditForm {
  avatar_id?: string; // Avatar ID of the user
  organization_id?: string; // Organization affiliation
  job_title_id?: string; // Job title ID
  address?: string; // User's address
  phone?: string; // User's phone number
  email?: string; // User's email
  custom_job_title?: string; // Custom job title if applicable
}

export function Dashboard() {
  const navigate = useNavigate(); // Hook for navigation
  const { user } = useAuthStore(); // Get the authenticated user information
  const [contracts, setContracts] = useState<Database['public']['Tables']['contracts']['Row'][]>([]); // Contracts associated with the user
  const [loading, setLoading] = useState(true); // Loading state for initial data fetching
  const [searchQuery, setSearchQuery] = useState(''); // Search input for filtering contracts
  const [profile, setProfile] = useState<Profile | null>(null); // User profile information
  const [avatars, setAvatars] = useState<Avatar[]>([]); // Store available avatars
  const [organizations, setOrganizations] = useState<Organization[]>([]); // Store organizations
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]); // Store job titles
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for editing profile
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
  }); // Store metrics for dashboard overview
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // Crop coordinates for the avatar image
  const [zoom, setZoom] = useState(1); // Zoom level for cropping avatar
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Store selected image for cropping
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null); // Store cropped area dimensions

  // Handle the crop and upload action for the user's avatar
  const handleCropAndUpload = async () => {
    if (!selectedImage || !croppedAreaPixels || !user) return;
  
    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels); // Get the cropped image blob
  
      const fileName = `avatar`; // Define the file name for the image
      const filePath = `${user.id}/${fileName}`; // File path
        
      const { error } = await supabase.storage
        .from('avatar-private')
        .upload(filePath, croppedBlob, {
          upsert: true, // Allows overwriting the file
          contentType: 'image/jpeg', // Set content type for the uploaded image
        });

      if (error) throw error;

      // Get URL of the uploaded image
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatar-private')
        .getPublicUrl(filePath);

      await handleAvatarSelect(publicUrl); // Update avatar in user profile

      toast.success('Avatar uploaded successfully!'); // Notify the user
      setSelectedImage(null); // Reset the selected image
    } catch (err) {
      console.error(err);
      toast.error('Upload failed'); // Notify of potential errors
    }
  };

  // Fetch data for the dashboard when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        if (!user) {
          navigate('/'); // Redirect if the user is not authenticated
          return;
        }

        // Fetch organizations
        const { data: organizationsData } = await supabase.from('organizations').select('*');
        setOrganizations(organizationsData || []);

        // Fetch job titles
        const { data: jobData } = await supabase.from('job_titles').select('*');
        setJobTitles(jobData || []);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            role,
            full_name,
            email,
            username,
            phone,
            location,
            avatarUrl,
            organization_id,
            job_title_id,
            organizations!profiles_organization_id_fkey (
              name,
              address,
              phone,
              website
            ),
            job_titles!profiles_job_title_id_fkey (
              title,
              is_custom
            )
          `)
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError; // Handle errors while fetching profile

        const safeProfile = profileData as unknown as Profile; // Typecast the fetched profile data
        setProfile(safeProfile);

        // Determine if the job title is custom
        const resolvedJobTitleId = profileData.job_title_id;
        let customJobTitle = '';

        // Check if job titles exist and get custom title if applicable
        if (profileData.job_title_id && jobData && jobData.length > 0) {
          const matchingTitle = jobData.find(j => j.id === profileData.job_title_id);
          if (matchingTitle?.is_custom) {
            customJobTitle = matchingTitle.title ?? '';
          }
        }

        // Set edit form values
        setEditForm({
          avatar_id: profileData.avatarUrl ?? '',
          organization_id: profileData.organization_id ?? '',
          job_title_id: resolvedJobTitleId ?? '',
          address: profileData.location ?? '',
          phone: profileData.phone ?? '',
          email: profileData.email ?? '',
          custom_job_title: customJobTitle,
        });

        // Fetch user avatars
        const { data: avatarData } = await supabase
          .from('avatars')
          .select('*')
          .or(`is_preset.eq.true,profile_id.eq.${user.id}`)
          .order('created_at');

        setAvatars(avatarData || []);

        // Fetch user contracts
        const { data: userContracts, error: userContractsError } = await supabase
          .from('user_contracts')
          .select('contract_id')
          .eq('user_id', user.id);

        if (userContractsError) throw userContractsError;

        const contractIds = userContracts?.map((uc) => uc.contract_id) || []; // Extract contract IDs

        if (contractIds.length === 0) {
          setContracts([]); // No contracts found
          setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
          return;
        }

        // Fetch contracts data associated with the user
        const { data: contractData, error: contractError } = await supabase
          .from('contracts')
          .select(`
            id,
            title,
            description,
            location,
            status,
            budget,
            start_date,
            end_date,
            created_at,
            updated_at,
            created_by
          `)
          .in('id', contractIds)
          .order('created_at', { ascending: false });

        if (contractError) throw contractError;

        setContracts(contractData || []); // Set the contracts data

        // Fetch active contracts
        const { data: activeContracts, error: activeError } = await supabase
          .from('contracts')
          .select('id')
          .in('id', contractIds)
          .eq('status', 'Active');

        if (activeError) throw activeError;

        // Fetch open issues count
        const { count: issuesCount, error: issuesError } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Open')
          .in('contract_id', contractIds);

        if (issuesError) throw issuesError;

        setMetrics({
          activeContracts: activeContracts?.length || 0,
          openIssues: issuesCount || 0,
          pendingInspections: 0 // Placeholder to track pending inspections
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false); // Stop loading when data fetching is complete
      }
    }

    fetchData(); // Call fetch data function
  }, [user, navigate]);

  // Handle avatar selection and update profile
  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    if (profile) {
      setProfile({ ...profile, avatarUrl: url });
    }
    setIsModalOpen(false);
  };

  // Handle changes in profile form inputs
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === 'create-new') {
      navigate('/create-organization'); // Redirect to create new organization
      return;
    }
    setEditForm(prev => ({ ...prev, [name]: value })); // Update the edit form state
  };

  // Save profile information
  const handleSaveProfile = async () => {
    if (!user) return;

    let jobTitleId = editForm.job_title_id;
    
    // Insert custom job title if needed
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
      jobTitleId = newJobTitle.id; // Retrieve the custom job title ID
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
      // Re-fetch profile data
      const { data: updatedProfile } = await supabase
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

      setProfile(updatedProfile as unknown as Profile); // Update profile state
      setIsModalOpen(false); // Close the modal
    }
  };

  const handleAvatarUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string); // Set selected image for cropping
    };
    reader.readAsDataURL(file);
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contract.description && contract.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    contract.location.toLowerCase().includes(searchQuery.toLowerCase()) // Filtering contracts based on the search query
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                {profile?.avatarUrl && (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full border border-background-lighter" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Welcome back, {profile?.fullName}
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
              {(profile?.organizations || profile?.jobTitles) && (
                <div className="text-gray-400 space-y-1">
                  {profile?.organizations?.name && (
                    <p className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      {profile.organizations.name}
                    </p>
                  )}
                  {profile?.jobTitles?.title && (
                    <p className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {profile.jobTitles.title}
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
                    className={`rounded-lg overflow-hidden border-2 ${profile?.avatarUrl === avatar.url ? 'border-primary' : 'border-background-lighter'}`}
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
                  ...jobTitles.map(title => ({ value: title.id, label: title.title })),
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
            {filteredContracts.length === 0 ? ( // Check if there are no contracts matching the search
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
              filteredContracts.map((contract) => ( // Map over filtered contracts to display them
                <div
                  key={contract.id}
                  className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/contracts/${contract.id}`)} // Navigate to contract details
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">{contract.title}</h3>
                      <p className="text-gray-400 mb-4">{contract.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {contract.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${contract.budget.toLocaleString()} {/* Display contract budget */}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          contract.status === 'Active' ? 'success' :
                          contract.status === 'Final Review' ? 'info' :
                          contract.status === 'Closed' ? 'danger' :
                          'warning'
                        }
                      >
                        {contract.status} {/* Display the contract status with appropriate coloring */}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
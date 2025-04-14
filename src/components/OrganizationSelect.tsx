import { useEffect, useState } from 'react'; // Import necessary hooks
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { Input } from '@/components/ui/input'; // Import UI input component
import { Button } from '@/components/ui/button'; // Import UI button component
import { Card } from '@/components/ui/card'; // Import UI card component
import type { Organization } from '@/lib/types'; // Import Organization type
import { Search, Plus } from 'lucide-react'; // Import icons

// Define props for the OrganizationSelect component
interface OrganizationSelectProps {
  selectedId: string | null; // The currently selected organization ID
  onSelect: (org: Organization) => void; // Callback to handle organization selection
}

// OrganizationSelect component for selecting an organization from a list
export default function OrganizationSelect({ selectedId, onSelect }: OrganizationSelectProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]); // State for the list of organizations
  const [search, setSearch] = useState(''); // State for the search input
  const [loading, setLoading] = useState(true); // Loading state while fetching organizations
  const navigate = useNavigate(); // Hook for navigation

  // Fetch organizations from Supabase when the component mounts
  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true); // Set loading state
      try {
        const { data, error } = await supabase.from('organizations').select('*').order('name'); // Fetch organizations
        if (error) throw error; // Handle errors
        setOrganizations(data || []); // Update state with fetched organizations
      } catch (error) {
        console.error('Error loading organizations:', error); // Log errors
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchOrganizations(); // Call the fetch function
  }, []);

  // Filter organizations based on search input
  const filtered = organizations.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="space-y-4">
      {/* Search input for filtering organizations */}
      <Input
        placeholder="Search organizations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)} // Update search state
        startAdornment={<Search className="w-4 h-4 text-gray-400" />} // Add search icon
        fullWidth
      />

      <div className="max-h-40 overflow-y-auto rounded border border-background-lighter p-2">
        {loading ? ( // Show loading spinner if still fetching
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? ( // Show message if no matches found
          <p className="text-sm text-gray-500 py-2 text-center">No matches found.</p>
        ) : (
          filtered.map((org) => ( // Map through filtered organizations to display them
            <div
              key={org.id}
              className={`cursor-pointer rounded px-3 py-2 hover:bg-gray-800 ${org.id === selectedId ? 'bg-gray-700' : ''}`} // Highlight selected organization
              onClick={() => onSelect(org)} // Handle selection
            >
              {org.name} {/* Display organization name */}
            </div>
          ))
        )}
      </div>

      <Button
        variant="outline" // Style for creating a new organization
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => navigate('/organization_creation')} // Navigate to organization creation page
        className="w-full"
      >
        Create New Organization
      </Button>
    </Card>
  );
}
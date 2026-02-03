import { Page, PageContainer } from '@/components/Layout';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Search } from 'lucide-react';
import { useOrganizationsData } from '@/hooks/useOrganizationsData';

export default function OrganizationDashboard() {
  const {
    organizations,
    loading,
    error,
    searchQuery,
    handleSearchChange,
  } = useOrganizationsData();

  if (loading) {
    return (
      <Page>
        <PageContainer>Loading organizations…</PageContainer>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageContainer>Error: {error}</PageContainer>
      </Page>
    );
  }

  return (
    <Page>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4">Organizations</h1>
        <div className="mb-6 max-w-sm">
          <Input
            placeholder="Search organizations"
            value={searchQuery}
            onChange={handleSearchChange}
            startAdornment={<Search className="w-4 h-4 text-gray-400" />}
            fullWidth
          />
        </div>
        <div className="space-y-4">
          {organizations.map(org => (
            <Card key={org.id} className="p-4">
              <h2 className="text-lg font-medium">{org.name}</h2>
              {org.description && (
                <p className="text-sm text-gray-400">{org.description}</p>
              )}
            </Card>
          ))}
        </div>
      </PageContainer>
    </Page>
  );
}

import { useEffect, useState } from 'react';
import { Page, PageContainer } from '@/components/Layout';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { rpcClient } from '@/lib/rpc.client';
import type { OrganizationsRow } from '@/lib/rpc.types';

export default function OrganizationDashboard() {
  const [organizations, setOrganizations] = useState<OrganizationsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const data = await rpcClient.getOrganizations();
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading organizations', err);
        setError('Failed to load organizations.');
      } finally {
        setLoading(false);
      }
    };
    void loadOrgs();
  }, []);

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
        <div className="space-y-4">
          {organizations.map(org => (
            <Card key={org.id} className="p-4">
              <h2 className="text-lg font-medium">{org.name}</h2>
              {org.address && (
                <p className="text-sm text-gray-400">{org.address}</p>
              )}
              {org.phone && (
                <p className="text-sm text-gray-400">{org.phone}</p>
              )}
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary"
                >
                  {org.website}
                </a>
              )}
            </Card>
          ))}
        </div>
      </PageContainer>
    </Page>
  );
}

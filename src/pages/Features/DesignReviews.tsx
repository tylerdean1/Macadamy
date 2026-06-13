import { useCallback, useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type DesignReview = Database['public']['Tables']['quality_reviews']['Row'];
type LoadTrigger = 'user' | 'background';

export default function DesignReviews(): JSX.Element {
  const [reviews, setReviews] = useState<DesignReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async (trigger: LoadTrigger = 'user'): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await rpcClient.filter_quality_reviews({ _filters: {} });
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      logBackendError({
        module: 'Design Reviews',
        operation: 'load quality reviews',
        trigger,
        error,
      });
      setReviews([]);
      setError(getBackendErrorMessage(error));
      if (trigger === 'user') {
        toast.error('Unable to load design reviews.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews('user');
  }, [loadReviews]);

  if (loading) {
    return (
      <Page>
        <LoadingState message="Loading design reviews..." />
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <ErrorState
          title="Unable to load design reviews"
          error={error}
          onRetry={() => { void loadReviews('user'); }}
        />
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Design Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No design reviews found.</p>
      ) : (
        <ul className="space-y-2">
          {reviews.map(r => (
            <li key={r.id} className="border p-2 rounded">
              <span className="font-medium">Quality Review {r.id.substring(0, 8)}</span>
              {r.review_date && (
                <span className="ml-2 text-sm text-gray-500">{r.review_date}</span>
              )}
              {r.reviewer && (
                <span className="ml-2 text-sm text-gray-500">[Reviewer: {r.reviewer}]</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

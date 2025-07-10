import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

// Row type for design_reviews table
interface DesignReview extends Pick<Database['public']['Tables']['projects']['Row'], 'id'> {
  title: string;
  status: string | null;
  notes: string | null;
  review_date: string | null;
  created_at: string | null;
}

export default function DesignReviews() {
  const [reviews, setReviews] = useState<DesignReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase.from('design_reviews').select('*');
      if (!error && Array.isArray(data)) {
        setReviews(data as unknown as DesignReview[]);
      }
      setLoading(false);
    };
    void fetchReviews();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Design Reviews</h1>
      <ul className="space-y-2">
        {reviews.map(r => (
          <li key={r.id} className="border p-2 rounded">
            <span className="font-medium">{r.title}</span>
            {r.review_date && (
              <span className="ml-2 text-sm text-gray-500">{r.review_date}</span>
            )}
            {r.status && (
              <span className="ml-2 text-sm text-gray-500">[{r.status}]</span>
            )}
          </li>
        ))}
      </ul>
    </Page>
  );
}

import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type DesignReview = Database['public']['Tables']['quality_reviews']['Row'];

export default function DesignReviews() {
  const [reviews, setReviews] = useState<DesignReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('quality_reviews')
        .select('*')
        .returns<DesignReview[]>();
      if (!error && Array.isArray(data)) {
        setReviews(data);
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
    </Page>
  );
}

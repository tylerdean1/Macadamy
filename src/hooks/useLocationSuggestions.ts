import { useState, useEffect } from 'react';

export interface LocationSuggestion {
  display_name: string;
}

/**
 * Hook to fetch location suggestions from OpenStreetMap's Nominatim API
 * based on a query string. Returns a list of formatted location names.
 */
export function useLocationSuggestions(query: string): LocationSuggestion[] {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    if (query.trim().length < 2) {
      setSuggestions([]);
      return () => {
        controller.abort();
      };
    }

    const fetchSuggestions = async (): Promise<void> => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'en' } });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ display_name: string }>;
        const list = Array.isArray(data) ? data.map(item => ({ display_name: item.display_name })) : [];
        setSuggestions(list);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error('Failed to fetch location suggestions:', err);
        }
        setSuggestions([]);
      }
    };

    void fetchSuggestions();

    return () => {
      controller.abort();
    };
  }, [query]);

  return suggestions;
}

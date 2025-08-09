import { useEffect, useMemo, useRef, useState } from 'react';
import { googleMapsLoader } from '@/lib/utils/googleMapsLoader';

export interface PlacesSuggestion {
    description: string;
}

interface Options {
    countries?: string[]; // ISO 3166-1 Alpha-2
    debounceMs?: number;
    type?: '(cities)' | 'geocode' | 'establishment';
}

export function usePlacesLocationAutocomplete(query: string, opts?: Options): PlacesSuggestion[] {
    const [suggestions, setSuggestions] = useState<PlacesSuggestion[]>([]);
    const svcRef = useRef<google.maps.places.AutocompleteService | null>(null);
    const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

    const countries = opts?.countries ?? ['us', 'ca', 'mx'];
    const type = opts?.type ?? '(cities)';
    const debounceMs = opts?.debounceMs ?? 200;

    const trimmed = (query ?? '').trim();

    useEffect(() => {
        let cancelled = false;

        if (trimmed.length < 2) {
            setSuggestions([]);
            return;
        }

        const run = async (): Promise<void> => {
            try {
                if (!svcRef.current) {
                    await googleMapsLoader.load();
                    svcRef.current = new google.maps.places.AutocompleteService();
                }
                if (!tokenRef.current) {
                    tokenRef.current = new google.maps.places.AutocompleteSessionToken();
                }

                const req: google.maps.places.AutocompletionRequest = {
                    input: trimmed,
                    // Restrict to NA countries
                    componentRestrictions: { country: countries },
                    // Prefer cities by default for a “standard” location feel
                    types: [type],
                    sessionToken: tokenRef.current,
                } as unknown as google.maps.places.AutocompletionRequest;

                svcRef.current.getPlacePredictions(req, (preds, status) => {
                    if (cancelled) return;
                    const ok =
                        status === google.maps.places.PlacesServiceStatus.OK ||
                        status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS;
                    if (!ok || !Array.isArray(preds)) {
                        setSuggestions([]);
                        return;
                    }
                    const list: PlacesSuggestion[] = preds
                        .map((p) => ({ description: p.description }))
                        .filter((s): s is PlacesSuggestion => Boolean(s.description));
                    setSuggestions(list);
                });
            } catch {
                if (!cancelled) setSuggestions([]);
            }
        };

        const t = setTimeout(() => {
            void run();
        }, debounceMs);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [trimmed, countries.join(','), type, debounceMs]);

    return suggestions;
}

export function useGhostCompletion(input: string, topSuggestion: string): string {
    const ghost = useMemo(() => {
        const a = (input ?? '').trim();
        const b = (topSuggestion ?? '').trim();
        if (!a || !b) return '';
        if (b.toLowerCase().startsWith(a.toLowerCase())) {
            return b.slice(a.length);
        }
        return '';
    }, [input, topSuggestion]);
    return ghost;
}

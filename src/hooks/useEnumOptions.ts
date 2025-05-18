import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook to fetch enum options from the database
 * @param enumType The name of the enum type to fetch
 * @returns Array of enum values as strings
 */
export function useEnumOptions(enumType: string) {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchEnumOptions = async () => {
      try {
        const { data, error } = await supabase.rpc('get_enum_values', {
          enum_type: enumType,
        });

        if (error) throw error;

        const values = data?.map((item: { value: string }) => item.value) || [];
        setOptions(values);
      } catch (error) {
        console.error(`Error loading enum options for ${enumType}:`, error);
        setOptions([]);
      }
    };

    fetchEnumOptions();
  }, [enumType]);

  return options;
}

/**
 * Directly fetch enum options without a hook
 * @param enumType The name of the enum type to fetch
 * @returns Promise that resolves to an array of enum values
 */
export async function fetchEnumOptions(enumType: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_enum_values', {
      enum_type: enumType,
    });

    if (error) throw error;

    return data?.map((item: { value: string }) => item.value) || [];
  } catch (error) {
    console.error(`Error fetching enum options for ${enumType}:`, error);
    return [];
  }
}
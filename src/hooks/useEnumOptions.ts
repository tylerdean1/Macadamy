import { useEffect, useState } from 'react';
import { rpcClient } from '@/lib/rpc.client';

/**
 * Custom hook to fetch enum options from the database
 * @param enumType The name of the enum type to fetch
 * @returns Array of enum values as strings
 */
export function useEnumOptions(enumType: string): string[] {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchEnumOptions = async (): Promise<void> => {
      try {
        const data = await rpcClient.getEnumValues({
          enum_type: enumType,
        });
        const values = Array.isArray(data) ? data.map((item: { value: string }) => item.value) : [];
        setOptions(values);
      } catch (error) {
        console.error(`Error loading enum options for ${enumType}:`, error);
        setOptions([]);
      }
    };

    void fetchEnumOptions();
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
    const data = await rpcClient.getEnumValues({
      enum_type: enumType,
    });
    return Array.isArray(data) ? data.map((item: { value: string }) => item.value) : [];
  } catch (error) {
    console.error(`Error fetching enum options for ${enumType}:`, error);
    return [];
  }
}
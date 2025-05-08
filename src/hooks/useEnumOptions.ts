import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useEnumOptions(enumType: string) {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc('get_enum_values', {
        enum_type: enumType,
      });
      if (error) console.error(`Error loading enum: ${enumType}`, error);
      else setOptions(data?.map((item: { value: string }) => item.value) ?? []);
    })();
  }, [enumType]);

  return options;
}
import { useEffect, useState } from 'react';
import { Constants } from '@/lib/database.types';

/**
 * Custom hook to get enum options from the database constants
 * @param enumType The name of the enum type to get
 * @returns Array of enum values as strings
 */
export function useEnumOptions(enumType: string): string[] {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      // Get enum values from database constants instead of RPC
      let values: string[] = [];

      switch (enumType) {
        case 'general_status':
          values = [...Constants.public.Enums.general_status];
          break;
        case 'project_status':
          values = [...Constants.public.Enums.project_status];
          break;
        case 'task_status':
          values = [...Constants.public.Enums.task_status];
          break;
        case 'unit_measure':
          values = [...Constants.public.Enums.unit_measure];
          break;
        case 'org_role':
          values = [...Constants.public.Enums.org_role];
          break;
        case 'user_role_type':
          values = [...Constants.public.Enums.user_role_type];
          break;
        case 'equipment_type':
          values = [...Constants.public.Enums.equipment_type];
          break;
        case 'document_type':
          values = [...Constants.public.Enums.document_type];
          break;
        case 'certification_type':
          values = [...Constants.public.Enums.certification_type];
          break;
        case 'commitment_type':
          values = [...Constants.public.Enums.commitment_type];
          break;
        case 'issue_type':
          values = [...Constants.public.Enums.issue_type];
          break;
        case 'notification_category':
          values = [...Constants.public.Enums.notification_category];
          break;
        case 'workflow_name':
          values = [...Constants.public.Enums.workflow_name];
          break;
        default:
          console.warn(`Unknown enum type: ${enumType}`);
          values = [];
      }

      setOptions(values);
    } catch (error) {
      console.error(`Error loading enum options for ${enumType}:`, error);
      setOptions([]);
    }
  }, [enumType]);

  return options;
}

/**
 * Directly get enum options without a hook
 * @param enumType The name of the enum type to get
 * @returns Array of enum values
 */
export function getEnumOptions(enumType: string): string[] {
  try {
    switch (enumType) {
      case 'general_status':
        return [...Constants.public.Enums.general_status];
      case 'project_status':
        return [...Constants.public.Enums.project_status];
      case 'task_status':
        return [...Constants.public.Enums.task_status];
      case 'unit_measure':
        return [...Constants.public.Enums.unit_measure];
      case 'org_role':
        return [...Constants.public.Enums.org_role];
      case 'user_role_type':
        return [...Constants.public.Enums.user_role_type];
      case 'equipment_type':
        return [...Constants.public.Enums.equipment_type];
      case 'document_type':
        return [...Constants.public.Enums.document_type];
      case 'certification_type':
        return [...Constants.public.Enums.certification_type];
      case 'commitment_type':
        return [...Constants.public.Enums.commitment_type];
      case 'issue_type':
        return [...Constants.public.Enums.issue_type];
      case 'notification_category':
        return [...Constants.public.Enums.notification_category];
      case 'workflow_name':
        return [...Constants.public.Enums.workflow_name];
      default:
        console.warn(`Unknown enum type: ${enumType}`);
        return [];
    }
  } catch (error) {
    console.error(`Error getting enum options for ${enumType}:`, error);
    return [];
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use getEnumOptions instead
 */
export const fetchEnumOptions = getEnumOptions;
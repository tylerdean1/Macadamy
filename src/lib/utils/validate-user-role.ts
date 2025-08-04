import type { UserRoleType } from "../types";

/**
 * Validates the user_role value and ensures it matches a valid UserRole.
 * Returns null if invalid or unexpected data is encountered.
 */
export function validateUserRole(userRole: string | null): UserRoleType | null {
  const validRoles: UserRoleType[] = [
    "system_admin",
    "org_admin",
    "org_supervisor",
    "org_user",
    "org_viewer",
    "inspector",
    "auditor",
  ];

  if (typeof userRole === 'string' && userRole.trim() !== '' && validRoles.includes(userRole as UserRoleType)) {
    return userRole as UserRoleType;
  }

  // Return null if the role is invalid or not found
  return null;
}

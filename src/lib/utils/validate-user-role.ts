import { UserRole } from '../enums'; 

/**
 * Validates the user_role value and ensures it matches a valid UserRole.
 * Falls back to a default role if invalid or unexpected data is encountered.
 */
export function validateUserRole(userRole: string | null): UserRole {
  const validRoles: UserRole[] = [
    UserRole.Admin,
    UserRole.Contractor,
    UserRole.Engineer,
    UserRole.ProjectManager,
    UserRole.Inspector,
  ];

  if (userRole && validRoles.includes(userRole as UserRole)) {
    return userRole as UserRole;
  }

  // Fallback to a default role if invalid
  return UserRole.Admin;
}
import { UserRole } from "../enums";

/**
 * Validates the user_role value and ensures it matches a valid UserRole.
 * Returns null if invalid or unexpected data is encountered.
 */
export function validateUserRole(userRole: string | null): UserRole | null {
  const validRoles: UserRole[] = [
    UserRole.Admin,
    UserRole.Contractor,
    UserRole.Engineer,
    UserRole.ProjectManager,
    UserRole.Inspector,
  ];

  if (typeof userRole === 'string' && userRole.trim() !== '' && validRoles.includes(userRole as UserRole)) {
    return userRole as UserRole;
  }

  // Return null if the role is invalid or not found
  return null;
}

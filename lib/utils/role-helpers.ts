import type { User, Role } from '@/lib/types/api';

/**
 * Extract the role slug from a User object
 * Handles both string and object role formats
 */
export function getUserRoleSlug(user: User | null | undefined): string | undefined {
  if (!user) return undefined;
  return typeof user.role === 'string' ? user.role : user.role?.slug;
}

/**
 * Get displayable role name from a User object
 * Returns formatted name for UI display
 */
export function getUserRoleName(user: User | null | undefined): string {
  if (!user) return 'Guest';
  
  if (typeof user.role === 'string') {
    // Convert slug to readable name
    return user.role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return user.role?.name || 'Unknown';
}

/**
 * Check if user has a specific role
 */
export function userHasRole(user: User | null | undefined, role: string): boolean {
  const userRole = getUserRoleSlug(user);
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function userHasAnyRole(user: User | null | undefined, roles: string[]): boolean {
  const userRole = getUserRoleSlug(user);
  return userRole ? roles.includes(userRole) : false;
}

/**
 * Get role badge color based on role slug
 */
export function getRoleBadgeColor(role: string | Role | undefined): string {
  const slug = typeof role === 'string' ? role : role?.slug;
  
  switch (slug) {
    case 'admin':
    case 'super-admin':
      return 'bg-purple-100 text-purple-800';
    case 'tenant':
      return 'bg-blue-100 text-blue-800';
    case 'staff':
    case 'maintenance_staff':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

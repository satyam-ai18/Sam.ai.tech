// Centralized Role-Based Access Control (RBAC) System
// MK Convent School CMS

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CONTENT_ADMIN: 'CONTENT_ADMIN',
  ADMISSION_ADMIN: 'ADMISSION_ADMIN',
  EDITOR: 'EDITOR',
} as const

export type RoleKey = keyof typeof ROLES

export const PERMISSIONS = {
  MANAGE_ALL: 'manage_all',
  MANAGE_WEBSITE: 'manage_website',
  MANAGE_PAGES: 'manage_pages',
  MANAGE_HOMEPAGE: 'manage_homepage',
  MANAGE_NAVIGATION: 'manage_navigation',
  MANAGE_ACADEMICS: 'manage_academics',
  MANAGE_FACILITIES: 'manage_facilities',
  MANAGE_TEACHERS: 'manage_teachers',
  MANAGE_ADMISSIONS: 'manage_admissions',
  MANAGE_NEWS: 'manage_news',
  MANAGE_EVENTS: 'manage_events',
  MANAGE_NOTICES: 'manage_notices',
  MANAGE_ACHIEVEMENTS: 'manage_achievements',
  MANAGE_TESTIMONIALS: 'manage_testimonials',
  MANAGE_GALLERY: 'manage_gallery',
  MANAGE_MEDIA: 'manage_media',
  MANAGE_COMPLAINTS: 'manage_complaints',
  MANAGE_CONTACT: 'manage_contact',
  MANAGE_SEO: 'manage_seo',
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  EXPORT_DATA: 'export_data',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Matrix of permissions assigned to each role
const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: [
    PERMISSIONS.MANAGE_ALL,
    PERMISSIONS.MANAGE_WEBSITE,
    PERMISSIONS.MANAGE_PAGES,
    PERMISSIONS.MANAGE_HOMEPAGE,
    PERMISSIONS.MANAGE_NAVIGATION,
    PERMISSIONS.MANAGE_ACADEMICS,
    PERMISSIONS.MANAGE_FACILITIES,
    PERMISSIONS.MANAGE_TEACHERS,
    PERMISSIONS.MANAGE_ADMISSIONS,
    PERMISSIONS.MANAGE_NEWS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_NOTICES,
    PERMISSIONS.MANAGE_ACHIEVEMENTS,
    PERMISSIONS.MANAGE_TESTIMONIALS,
    PERMISSIONS.MANAGE_GALLERY,
    PERMISSIONS.MANAGE_MEDIA,
    PERMISSIONS.MANAGE_COMPLAINTS,
    PERMISSIONS.MANAGE_CONTACT,
    PERMISSIONS.MANAGE_SEO,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA,
  ],
  CONTENT_ADMIN: [
    PERMISSIONS.MANAGE_WEBSITE,
    PERMISSIONS.MANAGE_PAGES,
    PERMISSIONS.MANAGE_HOMEPAGE,
    PERMISSIONS.MANAGE_NAVIGATION,
    PERMISSIONS.MANAGE_ACADEMICS,
    PERMISSIONS.MANAGE_FACILITIES,
    PERMISSIONS.MANAGE_TEACHERS,
    PERMISSIONS.MANAGE_NEWS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_NOTICES,
    PERMISSIONS.MANAGE_ACHIEVEMENTS,
    PERMISSIONS.MANAGE_TESTIMONIALS,
    PERMISSIONS.MANAGE_GALLERY,
    PERMISSIONS.MANAGE_MEDIA,
    PERMISSIONS.MANAGE_CONTACT,
    PERMISSIONS.MANAGE_SEO,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA,
  ],
  ADMISSION_ADMIN: [
    PERMISSIONS.MANAGE_ADMISSIONS,
    PERMISSIONS.MANAGE_COMPLAINTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA,
  ],
  EDITOR: [
    PERMISSIONS.MANAGE_PAGES,
    PERMISSIONS.MANAGE_NEWS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_NOTICES,
    PERMISSIONS.MANAGE_GALLERY,
    PERMISSIONS.MANAGE_MEDIA,
  ],
}

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: string | undefined | null, permission: PermissionKey): boolean {
  if (!role) return false
  const upperRole = role.toUpperCase()
  if (upperRole === ROLES.SUPER_ADMIN) return true
  const permissions = ROLE_PERMISSIONS[upperRole] || []
  return permissions.includes(permission)
}

/**
 * Route protection mapping
 */
const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  '/admin/users': PERMISSIONS.MANAGE_USERS,
  '/admin/audit-logs': PERMISSIONS.VIEW_AUDIT_LOGS,
  '/admin/settings': PERMISSIONS.MANAGE_SETTINGS,
  '/admin/website': PERMISSIONS.MANAGE_WEBSITE,
  '/admin/pages': PERMISSIONS.MANAGE_PAGES,
  '/admin/homepage': PERMISSIONS.MANAGE_HOMEPAGE,
  '/admin/navigation': PERMISSIONS.MANAGE_NAVIGATION,
  '/admin/academics': PERMISSIONS.MANAGE_ACADEMICS,
  '/admin/facilities': PERMISSIONS.MANAGE_FACILITIES,
  '/admin/staff': PERMISSIONS.MANAGE_TEACHERS,
  '/admin/teachers': PERMISSIONS.MANAGE_TEACHERS,
  '/admin/admissions': PERMISSIONS.MANAGE_ADMISSIONS,
  '/admin/news': PERMISSIONS.MANAGE_NEWS,
  '/admin/events': PERMISSIONS.MANAGE_EVENTS,
  '/admin/notices': PERMISSIONS.MANAGE_NOTICES,
  '/admin/achievements': PERMISSIONS.MANAGE_ACHIEVEMENTS,
  '/admin/testimonials': PERMISSIONS.MANAGE_TESTIMONIALS,
  '/admin/gallery': PERMISSIONS.MANAGE_GALLERY,
  '/admin/media': PERMISSIONS.MANAGE_MEDIA,
  '/admin/complaints': PERMISSIONS.MANAGE_COMPLAINTS,
  '/admin/contact': PERMISSIONS.MANAGE_CONTACT,
  '/admin/seo': PERMISSIONS.MANAGE_SEO,
}

/**
 * Check if a role can access a given admin route
 */
export function canAccessRoute(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false
  const upperRole = role.toUpperCase()
  if (upperRole === ROLES.SUPER_ADMIN) return true

  // Dashboard is accessible to all authenticated admin roles
  if (pathname === '/admin' || pathname === '/admin/dashboard') {
    return true
  }

  // Find the closest route match
  for (const [routePrefix, requiredPerm] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === routePrefix || pathname.startsWith(routePrefix + '/')) {
      return hasPermission(upperRole, requiredPerm)
    }
  }

  // Default: allow access to unspecified admin subpages if authenticated
  return true
}

/**
 * Visual badge config for roles
 */
export function getRoleBadge(role: string): { label: string; bg: string; color: string } {
  switch (role?.toUpperCase()) {
    case 'SUPER_ADMIN':
      return { label: 'Super Admin', bg: 'hsl(220, 70%, 92%)', color: 'hsl(220, 70%, 30%)' }
    case 'CONTENT_ADMIN':
      return { label: 'Content Admin', bg: 'hsl(160, 60%, 92%)', color: 'hsl(160, 60%, 25%)' }
    case 'ADMISSION_ADMIN':
      return { label: 'Admission Admin', bg: 'hsl(42, 90%, 92%)', color: 'hsl(42, 90%, 25%)' }
    case 'EDITOR':
      return { label: 'Editor', bg: 'hsl(280, 60%, 94%)', color: 'hsl(280, 60%, 30%)' }
    default:
      return { label: role || 'User', bg: 'hsl(220, 10%, 90%)', color: 'hsl(220, 10%, 30%)' }
  }
}

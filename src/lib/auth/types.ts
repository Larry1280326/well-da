export const ADMIN_ROLES = ["root", "owner", "engineer"] as const;

export const RFQ_STATUSES = ["initiated", "reviewing", "quoted"] as const;
export type RfqStatus = (typeof RFQ_STATUSES)[number];
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  role: AdminRole;
  display_name: string | null;
  created_by: number | null;
  created_at: string;
  last_login_at: string | null;
  is_active: boolean;
}

export interface SessionUser {
  userId: number;
  username: string;
  role: AdminRole;
  displayName: string | null;
}

export interface CreateAdminInput {
  username: string;
  password: string;
  role: AdminRole;
  displayName?: string;
}

/**
 * Check if userRole meets or exceeds the required role.
 * Hierarchy: root(3) > owner(2) > engineer(1)
 */
export function roleIsAtLeast(
  userRole: AdminRole,
  required: AdminRole,
): boolean {
  const order: Record<AdminRole, number> = { root: 3, owner: 2, engineer: 1 };
  return order[userRole] >= order[required];
}

import { headers } from 'next/headers';

export interface AuthUser {
  id: string;
  role: string;
}

export function getAuthUser(): AuthUser | null {
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId || !userRole) {
    return null;
  }

  return {
    id: userId,
    role: userRole,
  };
}

export function requireAuth(): AuthUser {
  const user = getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
} 
import { z } from 'zod';
import {
  apiRequest,
  refreshSession,
  setAccessToken,
} from '../../../shared/api/client';
import {
  sessionSchema,
  userSchema,
  type LoginInput,
  type RegisterInput,
  type Role,
  type Session,
} from '../model/user';

export async function login(input: LoginInput): Promise<Session> {
  return sessionSchema.parse(
    await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}
export async function register(input: RegisterInput): Promise<Session> {
  return sessionSchema.parse(
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}
export async function restoreSession(): Promise<Session> {
  return sessionSchema.parse(await refreshSession());
}
export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' });
  setAccessToken(null);
}
export async function getUsers(page: number) {
  return z
    .object({
      content: z.array(userSchema),
      number: z.number(),
      size: z.number(),
      totalElements: z.number(),
      totalPages: z.number(),
    })
    .parse(await apiRequest(`/users?page=${page}&size=10&sort=name,asc`));
}
export async function updateUserRole(input: { id: string; role: Role }) {
  return userSchema.parse(
    await apiRequest(`/users/${input.id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: input.role }),
    }),
  );
}
export async function updateUserStatus(input: { id: string; active: boolean }) {
  return userSchema.parse(
    await apiRequest(`/users/${input.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active: input.active }),
    }),
  );
}

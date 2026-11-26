import { z } from 'zod';
import {
  MAX_PASSWORD_BYTES,
  MIN_PASSWORD_LENGTH,
} from '../../../shared/config';

export const roleSchema = z.enum(['ADMIN', 'LIBRARIAN', 'READER']);
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: roleSchema,
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const sessionSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
  user: userSchema,
});
export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.').max(254),
  password: z
    .string()
    .min(1, 'Informe sua senha.')
    .refine(
      (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
      'A senha excede o limite de 72 bytes.',
    ),
});
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, 'Informe seu nome.').max(100),
  password: loginSchema.shape.password.refine(
    (value) => value.length >= MIN_PASSWORD_LENGTH,
    'Use pelo menos 12 caracteres.',
  ),
});
export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type Role = z.infer<typeof roleSchema>;

export function canManageBooks(user: User | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
}

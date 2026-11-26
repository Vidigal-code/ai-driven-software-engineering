import { expect, it } from 'vitest';
import { canManageBooks, loginSchema, registerSchema, type User } from './user';

const reader: User = {
  id: '1',
  name: 'Leitor',
  email: 'reader@example.test',
  role: 'READER',
  active: true,
  createdAt: '',
  updatedAt: '',
};

it('RF-UI-004 exposes book mutation permissions only to staff', () => {
  expect(canManageBooks(null)).toBe(false);
  expect(canManageBooks(reader)).toBe(false);
  expect(canManageBooks({ ...reader, role: 'ADMIN' })).toBe(true);
  expect(canManageBooks({ ...reader, role: 'LIBRARIAN' })).toBe(true);
});

it('RF-UI-001 validates registration length and bcrypt byte limit', () => {
  const data = {
    name: 'Maria',
    email: 'maria@example.test',
    password: 'long secure password',
  };
  expect(registerSchema.safeParse(data).success).toBe(true);
  expect(registerSchema.safeParse({ ...data, password: 'short' }).success).toBe(
    false,
  );
  expect(
    registerSchema.safeParse({ ...data, password: '💜'.repeat(20) }).success,
  ).toBe(false);
  expect(registerSchema.safeParse({ ...data, name: ' ' }).success).toBe(false);
  expect(
    loginSchema.safeParse({ email: 'invalid', password: '' }).success,
  ).toBe(false);
});

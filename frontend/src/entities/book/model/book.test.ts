import { describe, expect, it } from 'vitest';
import { bookInputSchema, isValidIsbn } from './book';

const valid = {
  title: 'Clean Code',
  author: 'Robert C. Martin',
  isbn: '9780132350884',
  publisher: 'Prentice Hall',
  publicationYear: 2008,
  category: 'Engenharia',
  description: '',
  totalCopies: 3,
  availableCopies: 2,
};

describe('RF-UI-003 book validation', () => {
  it.each([
    ['title', 200],
    ['author', 150],
    ['publisher', 150],
  ])('aligns %s length limits with the API contract', (field, limit) => {
    expect(bookInputSchema.safeParse({ ...valid, [field]: 'a'.repeat(limit) }).success).toBe(true);
    expect(bookInputSchema.safeParse({ ...valid, [field]: 'a'.repeat(limit + 1) }).success).toBe(false);
  });
  it('rejects invalid ISBN checksums before submission', () => {
    expect(
      bookInputSchema.safeParse({ ...valid, isbn: '9780132350885' }).success,
    ).toBe(false);
    expect(bookInputSchema.safeParse(valid).success).toBe(true);
  });
  it.each([
    { title: '' },
    { author: '   ' },
    { publicationYear: new Date().getFullYear() + 1 },
    { totalCopies: -1 },
    { availableCopies: 4 },
    { availableCopies: -1 },
    { totalCopies: 1.5 },
  ])('rejects invalid book values %j', (change) => {
    expect(bookInputSchema.safeParse({ ...valid, ...change }).success).toBe(
      false,
    );
  });
  it.each(['0-8044-2957-X', '0132350882', '978-0-13-235088-4'])(
    'accepts valid ISBN with checksum %s',
    (isbn) => expect(isValidIsbn(isbn)).toBe(true),
  );
  it.each(['', 'invalid', '0132350889', '4006381333931'])(
    'rejects malformed ISBN or non-book EAN %s',
    (isbn) => expect(isValidIsbn(isbn)).toBe(false),
  );
});

import { z } from 'zod';

export function isValidIsbn(raw: string): boolean {
  const isbn = raw.replace(/[\s-]/g, '').toUpperCase();
  if (/^97[89]\d{10}$/.test(isbn)) {
    return (
      [...isbn].reduce(
        (sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 1 : 3),
        0,
      ) %
        10 ===
      0
    );
  }
  if (/^\d{9}[\dX]$/.test(isbn)) {
    return (
      [...isbn].reduce(
        (sum, digit, index) =>
          sum + (digit === 'X' ? 10 : Number(digit)) * (10 - index),
        0,
      ) %
        11 ===
      0
    );
  }
  return false;
}

export const bookFields = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(200),
  author: z.string().trim().min(1, 'Informe o autor.').max(150),
  isbn: z
    .string()
    .trim()
    .refine(isValidIsbn, 'Informe um ISBN-10 ou ISBN-13 válido.'),
  publisher: z.string().max(150),
  publicationYear: z
    .number()
    .int()
    .min(1)
    .max(new Date().getFullYear(), 'O ano não pode estar no futuro.'),
  category: z.string().max(100),
  description: z.string().max(5000),
  totalCopies: z.number().int().min(0, 'Informe uma quantidade não negativa.'),
  availableCopies: z
    .number()
    .int()
    .min(0, 'Informe uma quantidade não negativa.'),
});
export const bookInputSchema = bookFields.refine(
  (book) => book.availableCopies <= book.totalCopies,
  {
    message: 'Disponíveis não pode superar o total.',
    path: ['availableCopies'],
  },
);
export type BookInput = z.infer<typeof bookInputSchema>;
export const bookSchema = bookFields.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publisher: z.string().nullable(),
  category: z.string().nullable(),
  description: z.string().nullable(),
});
export type Book = z.infer<typeof bookSchema>;
export const bookPageSchema = z.object({
  content: z.array(bookSchema),
  number: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
});
export interface BookFilters {
  title: string;
  author: string;
  isbn: string;
  category: string;
  available: string;
  page: number;
  sort: string;
}

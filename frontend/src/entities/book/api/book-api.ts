import { z } from 'zod';
import { apiRequest } from '../../../shared/api/client';
import { PAGE_SIZE } from '../../../shared/config';
import {
  bookPageSchema,
  bookSchema,
  type BookFilters,
  type BookInput,
} from '../model/book';

export async function getBooks(filters: BookFilters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(PAGE_SIZE),
    sort: filters.sort,
  });
  for (const key of ['title', 'author', 'isbn', 'category', 'available'] as const) {
    const value = filters[key];
    if (value !== '') params.set(key, value);
  }
  return bookPageSchema.parse(await apiRequest(`/books?${params}`));
}
export async function getBook(id: string) {
  return bookSchema.parse(await apiRequest(`/books/${id}`));
}
export async function createBook(input: BookInput) {
  return bookSchema.parse(
    await apiRequest('/books', { method: 'POST', body: JSON.stringify(input) }),
  );
}
export async function updateBook(input: { id: string; values: BookInput }) {
  return bookSchema.parse(
    await apiRequest(`/books/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input.values),
    }),
  );
}
export async function deleteBook(id: string): Promise<void> {
  await apiRequest(`/books/${id}`, { method: 'DELETE' });
}
const dashboardSchema = z.object({
  totalTitles: z.number(),
  totalCopies: z.number(),
  availableCopies: z.number(),
  unavailableCopies: z.number(),
  totalCategories: z.number(),
  recentBooks: z.array(bookSchema),
});
export async function getDashboard() {
  return dashboardSchema.parse(await apiRequest('/dashboard/summary'));
}

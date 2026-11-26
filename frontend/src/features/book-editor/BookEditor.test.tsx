import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { BookEditor } from '.';

it('RF-UI-003 requires title, author and valid ISBN before saving', async () => {
  const save = vi.fn();
  render(<BookEditor onSave={save} onCancel={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Salvar livro' }));
  expect(await screen.findByText('Informe o título.')).toBeInTheDocument();
  expect(screen.getByText('Informe o autor.')).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});

it('CA-UI-003b submits edited values through the public form interface', async () => {
  const book = { id: 'b1', title: 'Clean Code', author: 'Robert Martin', isbn: '9780132350884', publisher: null, category: null, description: null, publicationYear: 2008, totalCopies: 3, availableCopies: 2, createdAt: '', updatedAt: '' };
  const save = vi.fn().mockResolvedValue(undefined);
  render(<BookEditor book={book} onSave={save} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Clean Code revisado' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar livro' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Clean Code revisado', availableCopies: 2 }), expect.anything()));
});

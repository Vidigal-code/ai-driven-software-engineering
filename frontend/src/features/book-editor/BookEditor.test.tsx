import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { BookEditor } from '.';
import { ApiError } from '../../shared/api/client';

it('RF-UI-003 requires title, author and valid ISBN before saving', async () => {
  const save = vi.fn();
  render(<BookEditor onSave={save} onCancel={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Salvar livro' }));
  expect(await screen.findByText('Informe o título.')).toBeInTheDocument();
  expect(screen.getByText('Informe o autor.')).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});

it('CA-UX-005 associates server validation with its field and preserves input', async () => {
  const { rerender } = render(<BookEditor onSave={vi.fn()} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Meu livro' } });
  rerender(<BookEditor onSave={vi.fn()} onCancel={vi.fn()} error={new ApiError('Verifique os campos.', 400, { title: 'Título recusado pelo servidor.' })} />);
  expect(await screen.findByText('Título recusado pelo servidor.')).toBeVisible();
  expect(screen.getByLabelText('Título')).toHaveValue('Meu livro');
  expect(screen.getByLabelText('Título')).toBeInvalid();
  expect(screen.getByLabelText('Título')).toHaveAccessibleDescription('Título recusado pelo servidor.');
});

it('CA-UI-003b submits edited values through the public form interface', async () => {
  const book = { id: 'b1', title: 'Clean Code', author: 'Robert Martin', isbn: '9780132350884', publisher: null, category: null, description: null, publicationYear: 2008, totalCopies: 3, availableCopies: 2, createdAt: '', updatedAt: '' };
  const save = vi.fn().mockResolvedValue(undefined);
  render(<BookEditor book={book} onSave={save} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Clean Code revisado' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar livro' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Clean Code revisado', availableCopies: 2 }), expect.anything()));
});

it('CA-UX-006 keeps the editor open and prevents a second submission while saving', async () => {
  const cancel = vi.fn();
  let finish: (() => void) | undefined;
  const save = vi.fn().mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  render(<BookEditor onSave={save} onCancel={cancel} />);
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Refactoring' } });
  fireEvent.change(screen.getByLabelText('Autor'), { target: { value: 'Martin Fowler' } });
  fireEvent.change(screen.getByLabelText('ISBN'), { target: { value: '9780132350884' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar livro' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Salvando...' }));
  expect(cancel).not.toHaveBeenCalled();
  expect(save).toHaveBeenCalledTimes(1);
  finish?.();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar livro' })).toBeEnabled());
});

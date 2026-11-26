import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import {
  bookInputSchema,
  type Book,
  type BookInput,
} from '../../entities/book';
import { ErrorBanner, Field } from '../../shared/ui';

interface BookEditorProps {
  book?: Book;
  onSave: (input: BookInput) => Promise<void>;
  onCancel: () => void;
  error?: unknown;
}
export function BookEditor({ book, onSave, onCancel, error }: BookEditorProps) {
  const form = useForm<BookInput>({
    resolver: zodResolver(bookInputSchema),
    defaultValues: {
      title: book?.title ?? '',
      author: book?.author ?? '',
      isbn: book?.isbn ?? '',
      publisher: book?.publisher ?? '',
      publicationYear: book?.publicationYear ?? new Date().getFullYear(),
      category: book?.category ?? '',
      description: book?.description ?? '',
      totalCopies: book?.totalCopies ?? 1,
      availableCopies: book?.availableCopies ?? 1,
    },
  });
  const errors = form.formState.errors;
  return (
    <form noValidate onSubmit={form.handleSubmit(onSave)}>
      <div className="modal-body">
        {error ? <ErrorBanner error={error} /> : null}
        <div className="form-grid">
          <Field label="Título" error={errors.title?.message}>
            <input
              className="input mt-2"
              autoFocus
              {...form.register('title')}
            />
          </Field>
          <Field label="Autor" error={errors.author?.message}>
            <input className="input mt-2" {...form.register('author')} />
          </Field>
          <Field label="ISBN" error={errors.isbn?.message}>
            <input
              className="input mt-2"
              placeholder="9780132350884"
              {...form.register('isbn')}
            />
          </Field>
          <Field label="Editora" error={errors.publisher?.message}>
            <input className="input mt-2" {...form.register('publisher')} />
          </Field>
          <Field
            label="Ano de publicação"
            error={errors.publicationYear?.message}
          >
            <input
              className="input mt-2"
              type="number"
              {...form.register('publicationYear', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Categoria" error={errors.category?.message}>
            <input className="input mt-2" {...form.register('category')} />
          </Field>
          <Field
            label="Total de exemplares"
            error={errors.totalCopies?.message}
          >
            <input
              className="input mt-2"
              type="number"
              {...form.register('totalCopies', { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Exemplares disponíveis"
            error={errors.availableCopies?.message}
          >
            <input
              className="input mt-2"
              type="number"
              {...form.register('availableCopies', { valueAsNumber: true })}
            />
          </Field>
          <div className="span-full">
            <Field label="Descrição" error={errors.description?.message}>
              <textarea
                className="textarea mt-2"
                rows={3}
                {...form.register('description')}
              />
            </Field>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="button" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="button button-primary"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          <Save size={15} />
          {form.formState.isSubmitting ? 'Salvando...' : 'Salvar livro'}
        </button>
      </div>
    </form>
  );
}

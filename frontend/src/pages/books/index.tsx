import { useCallback, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  createBook,
  deleteBook,
  getBooks,
  updateBook,
  type Book,
  type BookFilters,
  type BookInput,
} from '../../entities/book';
import { canManageBooks, useSession } from '../../entities/user';
import { BookEditor } from '../../features/book-editor';
import { BookDetails } from '../../features/book-details';
import { BookTable } from '../../widgets/book-table';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  Modal,
  PageHeading,
  Toast,
} from '../../shared/ui';

const INITIAL_FILTERS: BookFilters = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  available: '',
  page: 0,
  sort: 'createdAt,desc',
};

export default function BooksPage() {
  const { user } = useSession();
  const manage = canManageBooks(user);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [draft, setDraft] = useState(INITIAL_FILTERS);
  const [editor, setEditor] = useState<{ book?: Book } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [notice, setNotice] = useState('');
  const queryClient = useQueryClient();
  const books = useQuery({
    queryKey: ['books', 'list', filters],
    queryFn: () => getBooks(filters),
  });
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['books'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  };
  const save = useMutation({
    mutationFn: (values: BookInput) =>
      editor?.book
        ? updateBook({ id: editor.book.id, values })
        : createBook(values),
    onSuccess: async () => {
      await invalidate();
      setEditor(null);
      setNotice('Livro salvo com sucesso.');
    },
  });
  const remove = useMutation({
    mutationFn: deleteBook,
    onSuccess: async () => {
      if (books.data?.content.length === 1 && filters.page > 0) {
        setFilters(current => ({ ...current, page: current.page - 1 }));
      }
      await invalidate();
      setDeleting(null);
      setNotice('Livro excluído com sucesso.');
    },
  });
  const dismissNotice = useCallback(() => setNotice(''), []);
  function applyFilters(event: FormEvent) {
    event.preventDefault();
    setFilters({ ...draft, page: 0 });
  }
  async function saveBook(input: BookInput) {
    await save.mutateAsync(input).catch(() => undefined);
  }
  return (
    <>
      <PageHeading
        title="Gerenciamento de livros"
        description="Todo o seu acervo, organizado. Encontre, atualize e acompanhe a disponibilidade dos livros."
      >
        {manage && (
          <button
            className="button button-primary"
            onClick={() => {
              save.reset();
              setEditor({});
            }}
          >
            <Plus size={17} />
            Novo livro
          </button>
        )}
      </PageHeading>
      <form onSubmit={applyFilters}>
        <div className="toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              className="input"
              aria-label="Pesquisar por título"
              placeholder="Pesquisar por título..."
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
          </div>
          <select
            className="select"
            style={{ width: 'auto' }}
            aria-label="Disponibilidade"
            value={draft.available}
            onChange={(event) =>
              setDraft({ ...draft, available: event.target.value })
            }
          >
            <option value="">Todas as disponibilidades</option>
            <option value="true">Disponíveis</option>
            <option value="false">Indisponíveis</option>
          </select>
          <select
            className="select"
            style={{ width: 'auto' }}
            aria-label="Ordenar livros"
            value={draft.sort}
            onChange={(event) => {
              const next = { ...draft, sort: event.target.value, page: 0 };
              setDraft(next);
              setFilters(next);
            }}
          >
            <option value="createdAt,desc">Mais recentes</option>
            <option value="title,asc">Título A–Z</option>
            <option value="title,desc">Título Z–A</option>
            <option value="author,asc">Autor A–Z</option>
            <option value="publicationYear,desc">Ano decrescente</option>
          </select>
          <button className="button" type="submit">
            <Filter size={15} />
            Filtrar
          </button>
        </div>
        <details className="mb-5">
          <summary className="small muted cursor-pointer">
            Mais filtros: autor, ISBN e categoria
          </summary>
          <div className="form-grid mt-3">
            <input
              className="input"
              aria-label="Filtrar autor"
              placeholder="Autor"
              value={draft.author}
              onChange={(event) =>
                setDraft({ ...draft, author: event.target.value })
              }
            />
            <input
              className="input"
              aria-label="Filtrar ISBN"
              placeholder="ISBN"
              value={draft.isbn}
              onChange={(event) =>
                setDraft({ ...draft, isbn: event.target.value })
              }
            />
            <input
              className="input"
              aria-label="Filtrar categoria"
              placeholder="Categoria"
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value })
              }
            />
            <button
              className="button"
              type="button"
              onClick={() => {
                setDraft(INITIAL_FILTERS);
                setFilters(INITIAL_FILTERS);
              }}
            >
              Limpar filtros
            </button>
          </div>
        </details>
      </form>
      <section className="panel">
        <div className="panel-header">
          <h2>Acervo da biblioteca</h2>
          <span className="badge">
            {books.data?.totalElements ?? '—'} títulos
          </span>
        </div>
        {books.isPending && <LoadingState />}
        {books.error && (
          <div className="p-4">
            <ErrorBanner
              error={books.error}
              retry={() => void books.refetch()}
            />
          </div>
        )}
        {books.data?.content.length === 0 && (
          <EmptyState
            title="Nenhum livro encontrado"
            description="Tente outros filtros ou cadastre o primeiro livro do acervo."
          />
        )}
        {books.data && books.data.content.length > 0 && (
          <BookTable
            books={books.data.content}
            onView={(book) => setDetailId(book.id)}
            onEdit={
              manage
                ? (book) => {
                    save.reset();
                    setEditor({ book });
                  }
                : undefined
            }
            onDelete={
              manage
                ? (book) => {
                    remove.reset();
                    setDeleting(book);
                  }
                : undefined
            }
          />
        )}
        {books.data && (
          <div className="pagination">
            <span>
              {books.data.totalElements} títulos · página{' '}
              {books.data.number + 1} de {Math.max(1, books.data.totalPages)}
            </span>
            <div className="pagination-actions">
              <button
                className="button"
                aria-label="Página anterior"
                disabled={filters.page === 0 || books.isFetching}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
              >
                <ChevronLeft size={15} />
                Anterior
              </button>
              <button
                className="button"
                aria-label="Próxima página"
                disabled={
                  filters.page + 1 >= books.data.totalPages || books.isFetching
                }
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
              >
                Próxima
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
      {editor && (
        <Modal
          title={editor.book ? 'Editar livro' : 'Cadastrar livro'}
          onClose={() => setEditor(null)}
        >
          <BookEditor
            book={editor.book}
            onSave={saveBook}
            onCancel={() => setEditor(null)}
            error={save.error}
          />
        </Modal>
      )}
      {detailId && (
        <BookDetails id={detailId} onClose={() => setDetailId(null)} />
      )}
      {deleting && (
        <Modal title="Excluir livro" onClose={() => setDeleting(null)}>
          <div className="modal-body">
            <p>
              Excluir <strong>{deleting.title}</strong> do acervo?
            </p>
            <p className="small muted">
              Esta ação remove o cadastro permanentemente.
            </p>
            {remove.error && <ErrorBanner error={remove.error} />}
          </div>
          <div className="modal-footer">
            <button className="button" onClick={() => setDeleting(null)}>
              Cancelar
            </button>
            <button
              className="button button-danger"
              disabled={remove.isPending}
              onClick={() => remove.mutate(deleting.id)}
            >
              <Trash2 size={15} />
              Confirmar exclusão
            </button>
          </div>
        </Modal>
      )}
      {notice && <Toast message={notice} onClose={dismissNotice} />}
    </>
  );
}

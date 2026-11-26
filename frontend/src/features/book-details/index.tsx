import { useQuery } from '@tanstack/react-query';
import { getBook } from '../../entities/book';
import { ErrorBanner, LoadingState, Modal } from '../../shared/ui';

export function BookDetails({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ['books', 'detail', id],
    queryFn: () => getBook(id),
  });
  const book = query.data;
  return (
    <Modal title="Detalhes do livro" onClose={onClose}>
      <div className="modal-body">
        {query.isPending && <LoadingState />}
        {query.error && (
          <ErrorBanner error={query.error} retry={() => void query.refetch()} />
        )}
        {book && (
          <>
            <span className="badge badge-purple mb-4">
              {book.category || 'Sem categoria'}
            </span>
            <h1>{book.title}</h1>
            <p className="muted">{book.author}</p>
            <dl className="detail-meta">
              <dt>ISBN</dt>
              <dd>{book.isbn}</dd>
              <dt>Editora</dt>
              <dd>{book.publisher || 'Não informada'}</dd>
              <dt>Publicação</dt>
              <dd>{book.publicationYear}</dd>
              <dt>Disponibilidade</dt>
              <dd>
                {book.availableCopies} de {book.totalCopies}
              </dd>
              <dt>Atualização</dt>
              <dd>{new Date(book.updatedAt).toLocaleDateString('pt-BR')}</dd>
            </dl>
            <p className="small">
              {book.description || 'Nenhuma descrição informada.'}
            </p>
          </>
        )}
      </div>
      <div className="modal-footer">
        <button className="button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

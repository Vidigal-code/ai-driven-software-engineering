import { BookOpen, Eye, Pencil, Trash2 } from 'lucide-react';
import type { Book } from '../../entities/book';

interface BookTableProps {
  books: Book[];
  onView: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}
export function BookTable({ books, onView, onEdit, onDelete }: BookTableProps) {
  return (
    <div className="table-scroll book-table-wrap">
      <table className="book-table">
        <thead>
          <tr>
            <th>Livro</th>
            <th>Categoria</th>
            <th>ISBN</th>
            <th>Disponibilidade</th>
            <th>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td className="book-identity">
                <div className="book-cell">
                  <span className="book-cover">
                    <BookOpen size={16} />
                  </span>
                  <div>
                    <strong>{book.title}</strong>
                    <small>{book.author}</small>
                  </div>
                </div>
              </td>
              <td data-label="Categoria">
                <span className="badge">
                  {book.category || 'Sem categoria'}
                </span>
              </td>
              <td className="small muted" data-label="ISBN">{book.isbn}</td>
              <td data-label="Disponibilidade">
                <span
                  className={`badge ${book.availableCopies > 0 ? 'badge-green' : 'badge-orange'}`}
                >
                  {book.availableCopies > 0 ? 'Disponível' : 'Indisponível'} ·{' '}
                  {book.availableCopies}/{book.totalCopies}
                </span>
              </td>
              <td className="book-row-actions">
                <div className="book-actions">
                  <button
                    className="button book-action"
                    aria-label={`Visualizar ${book.title}`}
                    onClick={() => onView(book)}
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  {onEdit && (
                    <button
                      className="button book-action"
                      aria-label={`Editar ${book.title}`}
                      onClick={() => onEdit(book)}
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="button book-action book-delete"
                      aria-label={`Excluir ${book.title}`}
                      onClick={() => onDelete(book)}
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

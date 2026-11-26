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
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Livro</th>
            <th>Categoria</th>
            <th>ISBN</th>
            <th>Disponibilidade</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>
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
              <td>
                <span className="badge">
                  {book.category || 'Sem categoria'}
                </span>
              </td>
              <td className="small muted">{book.isbn}</td>
              <td>
                <span
                  className={`badge ${book.availableCopies > 0 ? 'badge-green' : 'badge-orange'}`}
                >
                  {book.availableCopies > 0 ? 'Disponível' : 'Indisponível'} ·{' '}
                  {book.availableCopies}/{book.totalCopies}
                </span>
              </td>
              <td>
                <div className="flex">
                  <button
                    className="icon-button"
                    aria-label={`Visualizar ${book.title}`}
                    onClick={() => onView(book)}
                  >
                    <Eye size={16} />
                  </button>
                  {onEdit && (
                    <button
                      className="icon-button"
                      aria-label={`Editar ${book.title}`}
                      onClick={() => onEdit(book)}
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="icon-button"
                      aria-label={`Excluir ${book.title}`}
                      onClick={() => onDelete(book)}
                    >
                      <Trash2 size={16} />
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  Layers,
  LibraryBig,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../entities/book';
import { useSession } from '../../entities/user';
import { BookDetails } from '../../features/book-details';
import { BookTable } from '../../widgets/book-table';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeading,
} from '../../shared/ui';

export default function DashboardPage() {
  const { user } = useSession();
  const query = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const [detailId, setDetailId] = useState<string | null>(null);
  const summary = query.data;
  const metrics = [
    {
      title: 'Títulos no acervo',
      value: summary?.totalTitles,
      icon: BookOpen,
      note: 'Livros cadastrados',
    },
    {
      title: 'Total de exemplares',
      value: summary?.totalCopies,
      icon: LibraryBig,
      note: 'Acervo completo',
    },
    {
      title: 'Disponíveis',
      value: summary?.availableCopies,
      icon: CheckCircle2,
      note: `${summary?.unavailableCopies ?? '—'} indisponíveis`,
    },
    {
      title: 'Categorias',
      value: summary?.totalCategories,
      icon: Layers,
      note: 'Áreas de conhecimento',
    },
  ];
  return (
    <>
      <PageHeading
        title={`Olá, ${user?.name.split(' ')[0] ?? 'leitor'}`}
        description="Uma visão completa da sua biblioteca. Todos os indicadores são obtidos do acervo real."
      >
        <Link className="button button-primary" to="/books">
          <BookMarked size={16} />
          Explorar acervo
        </Link>
      </PageHeading>
      {query.error && (
        <ErrorBanner error={query.error} retry={() => void query.refetch()} />
      )}
      <div className="metric-grid">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.title}>
            <div className="metric-top">
              {metric.title}
              <metric.icon size={18} />
            </div>
            <div className="metric-value">
              {query.isPending ? (
                <div className="skeleton h-8 w-16" />
              ) : (
                (metric.value ?? '—')
              )}
            </div>
            <div className="metric-note">{metric.note}</div>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="panel-header">
          <h2>Adicionados recentemente</h2>
          <Link className="small text-brand-400" to="/books">
            Ver todo o acervo
          </Link>
        </div>
        {query.isPending && <LoadingState />}
        {summary?.recentBooks.length === 0 && (
          <EmptyState
            title="Sua biblioteca começa aqui"
            description="Cadastre livros para acompanhar os indicadores e as novidades do acervo."
          />
        )}
        {summary && summary.recentBooks.length > 0 && (
          <BookTable
            books={summary.recentBooks}
            onView={(book) => setDetailId(book.id)}
          />
        )}
      </section>
      <div className="panel mt-6 p-6 flex items-center justify-between gap-5 flex-wrap">
        <div>
          <div className="eyebrow">Além do software</div>
          <h2>Conheça o processo por trás da entrega.</h2>
          <p className="small muted mb-0">
            Explore especificações, testes e Quality Gates no Engineering
            Workflow Studio.
          </p>
        </div>
        <Link className="button" to="/engineering/workflow">
          Abrir Studio
        </Link>
      </div>
      {detailId && (
        <BookDetails id={detailId} onClose={() => setDetailId(null)} />
      )}
    </>
  );
}

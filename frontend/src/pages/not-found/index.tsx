import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/ui';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Página não encontrada"
      description="O endereço pode ter mudado. Continue pelo menu ou volte ao Studio."
    >
      <Link className="button button-primary" to="/engineering/workflow">
        Voltar ao Studio
      </Link>
    </EmptyState>
  );
}

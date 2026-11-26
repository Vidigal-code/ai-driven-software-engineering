import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useSession } from '../../entities/user';
import { AppShell } from '../../widgets/app-shell';
import { EmptyState, LoadingState } from '../../shared/ui';

const WorkflowPage = lazy(() => import('../../pages/engineering-workflow'));
const LoginPage = lazy(() => import('../../pages/login'));
const RegisterPage = lazy(() => import('../../pages/register'));
const BooksPage = lazy(() => import('../../pages/books'));
const DashboardPage = lazy(() => import('../../pages/dashboard'));
const UsersPage = lazy(() => import('../../pages/users'));
const DocumentationPage = lazy(() => import('../../pages/documentation'));
const NotFoundPage = lazy(() => import('../../pages/not-found'));

function RequireSession() {
  const { user, loading } = useSession();
  if (loading) return <LoadingState />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
function RequireAdmin() {
  const { user } = useSession();
  return user?.role === 'ADMIN' ? (
    <Outlet />
  ) : (
    <EmptyState
      title="Acesso restrito"
      description="Somente administradores podem gerenciar usuários."
    />
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppShell />}>
          <Route
            index
            element={<Navigate to="/engineering/workflow" replace />}
          />
          <Route path="/engineering/workflow" element={<WorkflowPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route element={<RequireSession />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

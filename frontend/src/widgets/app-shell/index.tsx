import { useEffect, useState } from 'react';
import {
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  Code2,
  ExternalLink,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useSession } from '../../entities/user';
import { ErrorBanner } from '../../shared/ui';

const PAGE_TITLES: Record<string, string> = { '/engineering/workflow': 'Workflow Studio', '/books': 'Livros', '/users': 'Usuários', '/documentation': 'Documentação' };

export function AppShell() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('library-theme') ?? 'dark',
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('library-theme', theme);
  }, [theme]);
  const title = PAGE_TITLES[location.pathname] ?? 'Visão geral';
  async function logout() {
    try {
      await signOut();
      navigate('/login');
    } catch (cause) {
      setError(cause);
    }
  }
  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Navegação principal"
      >
        <Link className="brand" to="/engineering/workflow">
          <span className="brand-icon">
            <BookOpen size={22} />
          </span>
          <span>
            library<small>ENGINEERING STUDIO</small>
          </span>
        </Link>
        {mobileOpen && (
          <button
            className="icon-button mobile-menu absolute right-1 top-1"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        )}
        <nav>
          <div className="nav-group-label">Library Management</div>
          <NavLink className="nav-link" to="/dashboard" onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={17} />
            Visão geral
          </NavLink>
          <NavLink className="nav-link" to="/books" onClick={() => setMobileOpen(false)}>
            <BookOpen size={17} />
            Gerenciamento de livros
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink className="nav-link" to="/users" onClick={() => setMobileOpen(false)}>
              <Users size={17} />
              Gerenciar usuários
            </NavLink>
          )}
          <div className="nav-group-label mt-7">Engineering</div>
          <NavLink className="nav-link" to="/engineering/workflow" onClick={() => setMobileOpen(false)}>
            <Workflow size={17} />
            Fluxo de desenvolvimento
          </NavLink>
          <NavLink className="nav-link" to="/documentation" onClick={() => setMobileOpen(false)}>
            <BookOpenCheck size={17} />
            Documentação
          </NavLink>
          <a
            className="nav-link"
            href="/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 size={17} />
            Swagger API
            <ExternalLink size={12} className="ml-auto" />
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-note">
            <ShieldCheck size={18} className="text-brand-400 mb-2" />
            <strong>Construído com propósito.</strong>
            <p>
              Especificações claras.
              <br />
              Testes antes do código.
              <br />
              Qualidade em cada entrega.
            </p>
          </div>
          <div className="nav-group-label">Configurações</div>
          <button
            className="nav-link w-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
          {user ? (
            <button className="nav-link w-full" onClick={() => void logout()}>
              <LogOut size={17} />
              Sair
            </button>
          ) : (
            <Link className="nav-link" to="/login">
              <LogIn size={17} />
              Entrar na biblioteca
            </Link>
          )}
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={19} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="badge badge-purple">Spec-to-Production</span>
            <span className="small muted">
              {user?.name ?? 'Explorar demonstração'}
            </span>
            <span className="avatar" title={user?.role ?? 'Visitante'}>
              {user?.name.slice(0, 2).toUpperCase() ?? 'LS'}
            </span>
          </div>
        </header>
        <main className="content" id="main-content">
          {error ? <ErrorBanner error={error} /> : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { BookOpen, GitBranch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Link className="brand" to="/engineering/workflow">
          <span className="brand-icon">
            <BookOpen size={22} />
          </span>
          <span>
            library<small>ENGINEERING STUDIO</small>
          </span>
        </Link>
        <div>
          <div className="eyebrow">Conhecimento em movimento</div>
          <h1>
            Uma boa biblioteca.
            <br />
            <span>Uma engenharia melhor.</span>
          </h1>
          <p>
            Organize o acervo e explore como especificações, testes e qualidade
            constroem software confiável.
          </p>
          <div className="studio-meta">
            <span className="badge badge-purple">
              <GitBranch size={14} />
              SDD + TDD
            </span>
            <span className="badge badge-purple">
              <ShieldCheck size={14} />
              Quality Gates
            </span>
          </div>
        </div>
        <p className="small">
          Library Management · Spec-to-Production Engineering
        </p>
      </aside>
      <main className="auth-form-wrap">
        <section className="auth-form">
          <div className="eyebrow">Library Management</div>
          <h1>{title}</h1>
          <p className="muted small">{description}</p>
          {children}
          <p className="auth-links">
            <Link to="/engineering/workflow">
              Explorar o Engineering Workflow Studio
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

import { BookOpenCheck, FileCode2, GitBranch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EvidencePanel } from '../../widgets/evidence-panel';
import { PageHeading } from '../../shared/ui';

const DOCUMENTS = [
  {
    icon: BookOpenCheck,
    title: 'Especificações primeiro',
    text: 'Cada funcionalidade começa por spec, plan, tasks e acceptance. A constituição centraliza regras e critérios de aprovação.',
    path: 'specs/ · .specify/constitution.md',
  },
  {
    icon: GitBranch,
    title: 'RED → GREEN → REFACTOR',
    text: 'Um teste falha pelo comportamento ausente. A implementação mínima passa. A refatoração melhora o código preservando os testes.',
    path: 'docs/development-workflow.md',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança e Quality Gates',
    text: 'JWT validado, refresh com rotação, perfis de acesso e verificação de dependências. Aprovação unitária não substitui integração e segurança.',
    path: 'docs/security.md · docs/testing.md',
  },
  {
    icon: FileCode2,
    title: 'Contratos e rastreabilidade',
    text: 'Endpoints documentados no OpenAPI, coleção Postman e rastreamento do requisito ao teste. Relatórios reais permanecem separados da demonstração.',
    path: 'docs/traceability.md · postman/',
  },
];
export default function DocumentationPage() {
  return (
    <>
      <PageHeading
        title="Documentação"
        description="A metodologia, os contratos e as evidências que sustentam cada entrega."
      />
      <div className="docs-grid">
        {DOCUMENTS.map((document) => (
          <section className="panel docs-card" key={document.title}>
            <document.icon className="text-brand-400 mb-4" size={24} />
            <h2>{document.title}</h2>
            <p>{document.text}</p>
            <code className="small muted">{document.path}</code>
          </section>
        ))}
      </div>
      <div className="studio-meta">
        <a
          className="button"
          href="/swagger-ui/index.html"
          target="_blank"
          rel="noreferrer"
        >
          Abrir Swagger API
        </a>
        <Link className="button" to="/engineering/workflow">
          Explorar workflow
        </Link>
      </div>
      <EvidencePanel />
    </>
  );
}

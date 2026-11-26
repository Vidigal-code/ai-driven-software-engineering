import { useEffect, useState } from 'react';
import { Braces, FileCode2, Info } from 'lucide-react';
import {
  STATUS_LABELS,
  type NodeStatus,
  type WorkflowStep,
} from '../../entities/workflow';

const CODE_KEYWORDS = new Set(['public', 'record', 'void', 'var', 'if', 'else', 'return', 'throw', 'new', 'static', 'interface', 'extends', 'class', 'true', 'false']);
function tokenClass(token: string): string | undefined {
  if (token.startsWith('"')) return 'code-string';
  if (/^\d+$/.test(token)) return 'code-number';
  if (CODE_KEYWORDS.has(token)) return 'code-keyword';
  return undefined;
}

function HighlightedCode({ code }: { code: string }) {
  const [visible, setVisible] = useState(code.length);
  useEffect(() => {
    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(code.length);
      return;
    }
    setVisible(0);
    let shown = 0;
    const timer = setInterval(() => {
      shown = Math.min(code.length, shown + 18);
      setVisible(shown);
      if (shown === code.length) clearInterval(timer);
    }, 24);
    return () => clearInterval(timer);
  }, [code]);
  const tokens = code
    .slice(0, visible)
    .split(
      /("[^"\n]*"|\b\w+\b)/g,
    );
  return (
    <pre aria-label="Trecho de código demonstrativo">
      <code>
        {tokens.map((token, index) => (
          <span
            key={`${index}-${token}`}
            className={tokenClass(token)}
          >
            {token}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function WorkflowDetails({
  step,
  status,
}: {
  step: WorkflowStep;
  status: NodeStatus;
}) {
  return (
    <aside
      className="panel step-details"
      aria-label="Detalhes da etapa selecionada"
    >
      <div className="panel-header">
        <h2>
          <Info size={15} />
          Detalhes da etapa
        </h2>
        <span className="badge">{step.phase}</span>
      </div>
      <div className="step-details-body">
        <div className="detail-icon">
          <Braces size={22} />
        </div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <dl className="detail-meta">
          <dt>Agente responsável</dt>
          <dd>{step.agent}</dd>
          <dt>Status demonstrativo</dt>
          <dd className="muted">{STATUS_LABELS[status]}</dd>
          <dt>Validação</dt>
          <dd>Critério de aceitação</dd>
        </dl>
        <span className="badge badge-purple">
          <FileCode2 size={12} />
          Artefato de engenharia
        </span>
      </div>
      <div className="code-panel">
        <div className="code-label">
          {step.artifact} · representação didática
        </div>
        <HighlightedCode code={step.code} />
      </div>
    </aside>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Trash2 } from 'lucide-react';
import type { LogLevel, WorkflowLog } from '../../entities/workflow';

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function ExecutionTerminal({
  logs,
  onClear,
}: {
  logs: WorkflowLog[];
  onClear: () => void;
}) {
  const [level, setLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [notice, setNotice] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const visible = logs.filter((log) => level === 'ALL' || log.level === level);
  useEffect(() => {
    if (autoScroll && ref.current)
      ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs, autoScroll, level]);
  async function copyLogs() {
    try {
      await navigator.clipboard.writeText(
        logs
          .map(
            (log) =>
              `[${formatTime(log.elapsed)}] [${log.agent}] [${log.level}] ${log.message}`,
          )
          .join('\n'),
      );
      setNotice('Logs copiados.');
    } catch {
      setNotice('A cópia não está disponível neste navegador. Use exportar.');
    }
  }
  function exportLogs() {
    const blob = new Blob(
      [JSON.stringify({ mode: 'demonstration', logs }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'workflow-demonstracao.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Histórico demonstrativo exportado.');
  }
  return (
    <section
      className="panel terminal"
      aria-label="Terminal de execução simulada"
    >
      <div className="panel-header">
        <h2>
          <span className="terminal-dots">
            <i />
            <i />
            <i />
          </span>
          Execution terminal{' '}
          <span className="badge badge-purple">SIMULADO</span>
        </h2>
        <div className="canvas-tools">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(event) => setAutoScroll(event.target.checked)}
            />
            <span>Auto-scroll</span>
          </label>
          <select
            className="speed-select"
            aria-label="Filtrar nível dos logs"
            value={level}
            onChange={(event) =>
              setLevel(event.target.value as LogLevel | 'ALL')
            }
          >
            <option value="ALL">Todos</option>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Sucesso</option>
            <option value="WARN">Avisos</option>
            <option value="ERROR">Erros</option>
          </select>
          <button
            className="icon-button"
            onClick={() => void copyLogs()}
            aria-label="Copiar logs"
          >
            <Copy size={15} />
          </button>
          <button
            className="icon-button"
            onClick={exportLogs}
            aria-label="Exportar histórico"
          >
            <Download size={15} />
          </button>
          <button
            className="icon-button"
            onClick={onClear}
            aria-label="Limpar logs"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div ref={ref} className="terminal-body" role="log" aria-live="off">
        {visible.length === 0 ? (
          <span className="muted">
            &gt; Ready to start workflow. Inicie uma simulação para acompanhar
            os eventos.
          </span>
        ) : (
          visible.map((log) => (
            <div key={log.index} className={`log-line ${log.level}`}>
              <span className="log-time">{formatTime(log.elapsed)}</span>
              <span className="log-agent">[{log.agent}]</span>
              <span className="log-message">
                <span>[{log.level}]</span>{' '}
                {log.level === 'SUCCESS' && (
                  <Check size={11} className="inline" />
                )}{' '}
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
      {notice && (
        <output className="small muted px-4 py-2 block">
          {notice}
        </output>
      )}
    </section>
  );
}

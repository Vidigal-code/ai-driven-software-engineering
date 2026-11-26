import { useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Code2,
  FastForward,
  GitBranch,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Square,
  Workflow,
} from 'lucide-react';
import {
  SCENARIOS,
  SPEEDS,
  STEPS,
  type ScenarioId,
  type Speed,
  type WorkflowState,
} from '../../entities/workflow';
import { useWorkflow } from '../../features/workflow-player';
import { WorkflowCanvas } from '../../widgets/workflow-canvas';
import { WorkflowDetails } from '../../widgets/workflow-details';
import { ExecutionTerminal } from '../../widgets/execution-terminal';
import { EvidencePanel } from '../../widgets/evidence-panel';
import { PageHeading } from '../../shared/ui';

const PRIMARY_ACTION: Record<WorkflowState['status'], { label: string; event: 'PLAY' | 'PAUSE' | 'RESUME' }> = {
  IDLE: { label: 'Iniciar simulação', event: 'PLAY' }, RUNNING: { label: 'Pausar', event: 'PAUSE' }, PAUSED: { label: 'Retomar', event: 'RESUME' }, STOPPED: { label: 'Iniciar simulação', event: 'PLAY' }, COMPLETED: { label: 'Iniciar simulação', event: 'PLAY' },
};
const PLAYBACK_LABELS: Record<WorkflowState['status'], string> = { IDLE: 'Pronto para explorar', RUNNING: 'Execução automática em andamento', PAUSED: 'Pausado — pronto para retomar', STOPPED: 'Parado — clique em Reiniciar para começar', COMPLETED: 'Cenário concluído' };

export default function EngineeringWorkflowPage() {
  const { state, dispatch, snapshot } = useWorkflow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [follow, setFollow] = useState(false);
  const [notice, setNotice] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const activeId = snapshot.current?.stepId;
  const step =
    STEPS.find((item) => item.id === (selectedId ?? activeId)) ?? STEPS[0];
  if (!step) return null;
  const passed = Object.values(snapshot.nodeStates).filter(
    (value) => value === 'PASSED' || value === 'COMPLETED',
  ).length;
  const failures = snapshot.logs.filter((log) => log.level === 'ERROR').length;
  const running = state.status === 'RUNNING';
  const primaryAction = PRIMARY_ACTION[state.status];
  const completed = state.status === 'COMPLETED';
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await container.current?.requestFullscreen();
    } catch {
      setNotice(
        'Tela cheia indisponível neste navegador. O zoom do fluxo continua disponível.',
      );
    }
  }
  return (
    <>
      <PageHeading
        title="Engineering Workflow Studio"
        description="Acompanhe uma ideia se transformar em software. Especificação, agentes e qualidade conectados em um único fluxo."
      />
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-top">
            Metodologia
            <GitBranch size={17} />
          </div>
          <div className="metric-value">SDD + TDD</div>
          <div className="metric-note">Especificar. Testar. Entregar.</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            Etapas aprovadas
            <CheckCircle2 size={17} />
          </div>
          <div className="metric-value">
            {passed}
            <span className="muted text-base"> / 22</span>
          </div>
          <div className="metric-note">Resultados do cenário simulado</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            Ciclos de correção
            <Code2 size={17} />
          </div>
          <div className="metric-value">
            {failures.toString().padStart(2, '0')}
          </div>
          <div className="metric-note">Falhas demonstrativas detectadas</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            Progresso
            <ShieldCheck size={17} />
          </div>
          <div className="metric-value" aria-live="polite">
            {snapshot.progress}
            <span className="muted text-base">%</span>
          </div>
          <div className="metric-note">
            {PLAYBACK_LABELS[state.status]}
          </div>
        </div>
      </div>
      <div ref={container} className="studio-container">
        <div className="badge badge-purple mb-3">
          <Activity size={13} />
          Modo demonstração — execução simulada
        </div>
        <div className="studio-layout">
          <section className="panel">
            <div className="panel-header">
              <h2>
                <Workflow size={16} />
                Library Management System
              </h2>
              <div className="canvas-tools">
                <select
                  aria-label="Selecionar cenário"
                  className="speed-select"
                  value={state.scenario}
                  onChange={(event) => {
                    setSelectedId(null);
                    dispatch({
                      type: 'SCENARIO',
                      scenario: event.target.value as ScenarioId,
                    });
                  }}
                >
                  {SCENARIOS.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
                <button
                  className="icon-button"
                  aria-label="Tela cheia"
                  onClick={() => void toggleFullscreen()}
                >
                  <Maximize2 size={15} />
                </button>
              </div>
            </div>
            <div className="canvas-wrap">
              <div className="canvas-key">
                <span>
                  <i className="key-dot" />
                  <span>Pendente</span>
                </span>
                <span>
                  <i className="key-dot active" />
                  <span>Em execução</span>
                </span>
                <span>
                  <i className="key-dot passed" />
                  <span>Aprovado</span>
                </span>
                <span>
                  <i className="key-dot failed" />
                  <span>Falhou</span>
                </span>
              </div>
              <WorkflowCanvas
                nodeStates={snapshot.nodeStates}
                activeId={activeId}
                previousId={snapshot.previousId}
                selectedId={step.id}
                onSelect={setSelectedId}
                follow={follow}
              />
            </div>
            <progress
              className="progress-track"
              value={snapshot.progress}
              max={100}
              aria-label="Progresso da simulação"
              aria-valuenow={snapshot.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            <div className="simulation-controls">
              <button
                className="button button-primary"
                onClick={() => {
                  setSelectedId(null);
                  dispatch({
                    type: primaryAction.event,
                  });
                }}
                disabled={completed || state.status === 'STOPPED'}
              >
                {running ? <Pause size={15} /> : <Play size={15} />}
                {primaryAction.label}
              </button>
              <button
                className="icon-button"
                aria-label="Parar"
                onClick={() => dispatch({ type: 'STOP' })}
                disabled={state.status === 'IDLE' || completed}
              >
                <Square size={15} />
              </button>
              <button
                className="icon-button"
                aria-label="Reiniciar"
                onClick={() => {
                  setSelectedId(null);
                  dispatch({ type: 'RESTART' });
                }}
              >
                <RotateCcw size={15} />
              </button>
              <span className="control-divider" />
              <button
                className="icon-button"
                aria-label="Etapa anterior"
                disabled={state.cursor < 0}
                onClick={() => {
                  setSelectedId(null);
                  dispatch({ type: 'PREVIOUS' });
                }}
              >
                <SkipBack size={16} />
              </button>
              <button
                className="icon-button"
                aria-label="Próxima etapa"
                disabled={completed}
                onClick={() => {
                  setSelectedId(null);
                  dispatch({ type: 'NEXT' });
                }}
              >
                <SkipForward size={16} />
              </button>
              <FastForward size={14} className="muted ml-1" />
              <select
                className="speed-select"
                aria-label="Velocidade"
                value={state.speed}
                onChange={(event) =>
                  dispatch({
                    type: 'SPEED',
                    speed: Number(event.target.value) as Speed,
                  })
                }
              >
                {SPEEDS.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
              <label className="checkbox-label ml-auto">
                <input
                  type="checkbox"
                  checked={follow}
                  onChange={(event) => setFollow(event.target.checked)}
                />
                <span>Seguir etapa</span>
              </label>
            </div>
          </section>
          <WorkflowDetails
            step={step}
            status={snapshot.nodeStates[step.id] ?? 'PENDING'}
          />
        </div>
        <ExecutionTerminal
          logs={snapshot.logs}
          onClear={() => dispatch({ type: 'CLEAR_LOGS' })}
        />
      </div>
      {notice && (
        <output className="small muted mt-3 block">
          {notice}
        </output>
      )}
      <div className="footer-note">
        <span>
          Spec-to-Production Engineering · contexto preservado em cada etapa
        </span>
        <span>
          Nenhum agente externo, build ou teste real é executado nesta tela.
        </span>
      </div>
      <EvidencePanel />
    </>
  );
}

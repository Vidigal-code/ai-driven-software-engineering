import {
  STEPS,
  STEP_DURATION_MS,
  type LogLevel,
  type NodeStatus,
  type ScenarioId,
  type Speed,
} from './catalog';

export type PlaybackStatus =
  'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED' | 'COMPLETED';
export interface WorkflowState {
  status: PlaybackStatus;
  scenario: ScenarioId;
  cursor: number;
  speed: Speed;
  clearedAt: number;
}
export type WorkflowEvent =
  | {
      type:
        | 'PLAY'
        | 'TICK'
        | 'PAUSE'
        | 'RESUME'
        | 'STOP'
        | 'RESTART'
        | 'NEXT'
        | 'PREVIOUS'
        | 'CLEAR_LOGS';
    }
  | { type: 'SPEED'; speed: Speed }
  | { type: 'SCENARIO'; scenario: ScenarioId };
export interface WorkflowFrame {
  stepId: string;
  status: NodeStatus;
  level: LogLevel;
  message: string;
}
export interface WorkflowLog extends WorkflowFrame {
  agent: string;
  elapsed: number;
  index: number;
}

export function createWorkflow(
  scenario: ScenarioId = 'success',
): WorkflowState {
  return { status: 'IDLE', scenario, cursor: -1, speed: 1, clearedAt: 0 };
}

function stepFrames(stepId: string): WorkflowFrame[] {
  const step = STEPS.find((item) => item.id === stepId);
  if (!step) return [];
  return [
    { stepId, status: 'RUNNING', level: 'INFO', message: step.description },
    {
      stepId,
      status: stepId === 'approved' ? 'COMPLETED' : 'PASSED',
      level: 'SUCCESS',
      message:
        stepId === 'red'
          ? 'RED esperado observado. O teste detecta o comportamento ausente.'
          : `${step.title}: aprovado no cenário demonstrativo.`,
    },
  ];
}

export function scenarioFrames(scenario: ScenarioId): WorkflowFrame[] {
  return STEPS.filter((step) => step.id !== 'correction').flatMap((step) => {
    if (scenario === 'unit-failure' && step.id === 'green') {
      return [
        {
          stepId: 'green',
          status: 'FAILED' as const,
          level: 'ERROR' as const,
          message: 'ISBN duplicado não tratado: esperado 409, recebido 201.',
        },
        {
          stepId: 'test-decision',
          status: 'FAILED' as const,
          level: 'WARN' as const,
          message: 'Teste reprovado. Retornando ao desenvolvedor.',
        },
        {
          stepId: 'correction',
          status: 'RETRYING' as const,
          level: 'WARN' as const,
          message: 'Adicionar validação de ISBN e restrição UNIQUE no banco.',
        },
        {
          stepId: 'correction',
          status: 'PASSED' as const,
          level: 'SUCCESS' as const,
          message:
            'Correção concluída; implementação e testes serão revalidados.',
        },
        ...stepFrames('developer'),
        ...stepFrames('green'),
      ];
    }
    const isSecurityFailure =
      scenario === 'security-failure' && step.id === 'security';
    const isQualityFailure =
      scenario === 'quality-failure' && step.id === 'quality';
    if (isSecurityFailure || isQualityFailure) {
      return [
        {
          stepId: step.id,
          status: 'FAILED' as const,
          level: 'ERROR' as const,
          message: isSecurityFailure
            ? 'READER conseguiu cadastrar livro. Esperado 403 Forbidden.'
            : 'Cobertura abaixo da política mínima. Entrega bloqueada.',
        },
        {
          stepId: 'quality-decision',
          status: 'FAILED' as const,
          level: 'WARN' as const,
          message: 'Gate reprovado. Retorno ao agente responsável.',
        },
        {
          stepId: 'correction',
          status: 'RETRYING' as const,
          level: 'WARN' as const,
          message: isSecurityFailure
            ? 'Restringir gravações a ADMIN e LIBRARIAN.'
            : 'Cobrir o comportamento ausente sem reduzir asserções.',
        },
        {
          stepId: 'correction',
          status: 'PASSED' as const,
          level: 'SUCCESS' as const,
          message: 'Correção concluída; repetir implementação e gates.',
        },
        ...[
          'developer',
          'green',
          'test-decision',
          'refactor',
          'green',
          'review',
          'integration',
          'security',
        ].flatMap(stepFrames),
        ...(isQualityFailure ? stepFrames('quality') : []),
      ];
    }
    return step.id === 'refactor'
      ? [...stepFrames('refactor'), ...stepFrames('green')]
      : stepFrames(step.id);
  });
}

function advanceWorkflow(state: WorkflowState): WorkflowState {
  const finalCursor = scenarioFrames(state.scenario).length - 1;
  const cursor = Math.min(state.cursor + 1, finalCursor);
  return { ...state, cursor, status: cursor === finalCursor ? 'COMPLETED' : state.status };
}

function playbackTransition(state: WorkflowState, eventType: WorkflowEvent['type']): WorkflowState {
  if (eventType === 'STOP') return { ...state, status: 'STOPPED' };
  if (eventType === 'PLAY' && state.status === 'IDLE') return { ...state, status: 'RUNNING', cursor: 0 };
  if (eventType === 'PAUSE' && state.status === 'RUNNING') return { ...state, status: 'PAUSED' };
  if (eventType === 'RESUME' && state.status === 'PAUSED') return { ...state, status: 'RUNNING' };
  if (eventType === 'TICK' && state.status === 'RUNNING') return advanceWorkflow(state);
  return state;
}

export function transition(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  if (event.type === 'CLEAR_LOGS')
    return { ...state, clearedAt: state.cursor + 1 };
  if (event.type === 'SPEED') return { ...state, speed: event.speed };
  if (event.type === 'SCENARIO')
    return { ...createWorkflow(event.scenario), speed: state.speed };
  if (event.type === 'RESTART')
    return { ...createWorkflow(state.scenario), speed: state.speed };
  if (event.type === 'PREVIOUS')
    return {
      ...state,
      cursor: Math.max(-1, state.cursor - 1),
      status: 'PAUSED',
      clearedAt: 0,
    };
  if (event.type === 'NEXT') return advanceWorkflow({ ...state, status: 'PAUSED' });
  return playbackTransition(state, event.type);
}

export function workflowSnapshot(state: WorkflowState) {
  const frames = scenarioFrames(state.scenario);
  const visibleFrames = frames.slice(0, state.cursor + 1);
  const nodeStates: Record<string, NodeStatus> = Object.fromEntries(
    STEPS.map((step) => [step.id, 'PENDING']),
  );
  for (const frame of visibleFrames) nodeStates[frame.stepId] = frame.status;
  const logs: WorkflowLog[] = visibleFrames
    .map((frame, index) => ({
      ...frame,
      index,
      elapsed: index * STEP_DURATION_MS,
      agent:
        STEPS.find((step) => step.id === frame.stepId)?.agent ?? 'ORCHESTRATOR',
    }))
    .slice(state.clearedAt);
  return {
    nodeStates,
    logs,
    current: frames[state.cursor],
    previousId: frames.slice(0, Math.max(0, state.cursor)).reverse().find(frame => frame.stepId !== frames[state.cursor]?.stepId)?.stepId,
    total: frames.length,
    progress: Math.round(((state.cursor + 1) / frames.length) * 100),
  };
}

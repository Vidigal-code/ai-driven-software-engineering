import { memo, useEffect } from 'react';
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import {
  Check,
  Circle,
  Diamond,
  FileText,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { STEPS, STATUS_LABELS, type NodeStatus } from '../../entities/workflow';

type StepNode = Node<
  { title: string; agent: string; status: NodeStatus; phase: string },
  'step'
>;
const NODE_COLUMNS = 4;
const COLUMN_GAP = 250;
const ROW_GAP = 120;
const FIT_VIEW_PADDING = '6.52%';
const ICONS = {
  SDD: FileText,
  TDD: Terminal,
  QUALITY: ShieldCheck,
  DELIVERY: Check,
};
const STATE_ICONS = {
  PENDING: Circle,
  RUNNING: LoaderCircle,
  FAILED: X,
  RETRYING: RotateCcw,
  PASSED: Check,
  COMPLETED: Check,
};

const WorkflowNode = memo(function WorkflowNode({
  data,
  selected,
  id,
}: NodeProps<StepNode>) {
  const Icon = id.includes('decision')
    ? Diamond
    : ICONS[data.phase as keyof typeof ICONS];
  const StatusIcon = STATE_ICONS[data.status];
  return (
    <div
      className={`workflow-node ${data.status}`}
      style={
        selected
          ? { outline: '2px solid var(--brand)', outlineOffset: 3 }
          : undefined
      }
    >
      <Handle type="target" position={Position.Left} />
      <div className="node-title">
        <Icon size={15} />
        <span>{data.title}</span>
      </div>
      <div className="node-state">
        <span>
          <StatusIcon size={10} />
          {STATUS_LABELS[data.status]}
        </span>
        <small>{data.agent}</small>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});
const NODE_TYPES = { step: WorkflowNode };

interface CanvasProps {
  nodeStates: Record<string, NodeStatus>;
  activeId?: string;
  previousId?: string;
  selectedId: string;
  onSelect: (id: string) => void;
  follow: boolean;
}

function Canvas({
  nodeStates,
  activeId,
  previousId,
  selectedId,
  onSelect,
  follow,
}: CanvasProps) {
  const { setCenter } = useReactFlow<StepNode>();
  const nodes: StepNode[] = STEPS.map((step, index) => {
    const row = Math.floor(index / NODE_COLUMNS);
    const column =
      row % 2 === 0
        ? index % NODE_COLUMNS
        : NODE_COLUMNS - 1 - (index % NODE_COLUMNS);
    return {
      id: step.id,
      type: 'step',
      position: { x: column * COLUMN_GAP, y: row * ROW_GAP },
      selected: selectedId === step.id,
      data: {
        title: step.title,
        agent: step.agent,
        phase: step.phase,
        status: nodeStates[step.id] ?? 'PENDING',
      },
      ariaLabel: `${step.title}: ${STATUS_LABELS[nodeStates[step.id] ?? 'PENDING']}`,
    };
  });
  useEffect(() => {
    if (!follow || !activeId) return;
    const index = STEPS.findIndex((step) => step.id === activeId);
    const row = Math.floor(index / NODE_COLUMNS);
    const column =
      row % 2 === 0
        ? index % NODE_COLUMNS
        : NODE_COLUMNS - 1 - (index % NODE_COLUMNS);
    const duration = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : 450;
    void setCenter(column * COLUMN_GAP + 96, row * ROW_GAP + 40, {
      zoom: 0.9,
      duration,
    });
  }, [activeId, follow, setCenter]);
  const mainIds = STEPS.filter((step) => step.id !== 'correction').map(
    (step) => step.id,
  );
  const connections = mainIds
    .slice(1)
    .map((id, index) => [mainIds[index] ?? 'request', id] as const);
  const loops = [
    ['test-decision', 'correction'],
    ['quality-decision', 'correction'],
    ['security', 'quality-decision'],
    ['correction', 'developer'],
    ['refactor', 'green'],
    ['green', 'review'],
  ] as const;
  const edges: Edge[] = [...connections, ...loops].map(([source, target]) => ({
    id: `${source}-${target}`,
    source,
    target,
    type: 'smoothstep',
    animated: source === previousId && target === activeId,
    style: {
      stroke: target === activeId ? 'var(--brand)' : 'var(--border)',
      strokeWidth: target === activeId ? 2 : 1.4,
    },
    label: edgeLabel(source, target),
    labelStyle: { fill: 'var(--warning)', fontSize: 10 },
    labelBgStyle: { fill: 'var(--surface)' },
  }));
  return (
    <ReactFlow<StepNode>
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      fitView
      fitViewOptions={{ padding: FIT_VIEW_PADDING }}
      minZoom={0.2}
      maxZoom={1.8}
      nodesDraggable={false}
      nodesConnectable={false}
      onNodeClick={(_, node) => onSelect(node.id)}
      aria-label="Fluxo de engenharia com 22 etapas"
    >
      <Background gap={18} size={1} color="var(--border)" />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

function edgeLabel(source: string, target: string): string | undefined {
  if (target === 'correction') return 'NÃO';
  if (source === 'test-decision' || source === 'quality-decision') return 'SIM';
  return undefined;
}

export function WorkflowCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}

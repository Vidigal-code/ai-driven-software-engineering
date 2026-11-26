import { useEffect, useReducer } from 'react';
import {
  createWorkflow,
  transition,
  workflowSnapshot,
  STEP_DURATION_MS,
} from '../../../entities/workflow';

export function useWorkflow() {
  const [state, dispatch] = useReducer(transition, undefined, () =>
    createWorkflow(),
  );
  useEffect(() => {
    if (state.status !== 'RUNNING') return;
    const timer = setTimeout(
      () => dispatch({ type: 'TICK' }),
      STEP_DURATION_MS / state.speed,
    );
    return () => clearTimeout(timer);
  }, [state.status, state.cursor, state.speed]);
  return { state, dispatch, snapshot: workflowSnapshot(state) };
}

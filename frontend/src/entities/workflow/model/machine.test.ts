import { describe, expect, it } from 'vitest';
import { createWorkflow, transition, workflowSnapshot } from './machine';

describe('RF-WF-002 playback', () => {
  it('ignores incompatible playback events and preserves boundary cursors', () => {
    const initial = createWorkflow();
    expect(transition(initial, { type: 'TICK' })).toBe(initial);
    expect(transition(initial, { type: 'PAUSE' })).toBe(initial);
    expect(transition(initial, { type: 'RESUME' })).toBe(initial);
    let completed = transition(initial, { type: 'PLAY' });
    for (let index = 0; index < 120; index += 1) completed = transition(completed, { type: 'TICK' });
    expect(transition(completed, { type: 'TICK' })).toBe(completed);
    expect(transition(completed, { type: 'NEXT' }).cursor).toBe(completed.cursor);
    expect(workflowSnapshot(initial).previousId).toBeUndefined();
  });
  it('starts playback at the first step when Play is pressed', () => {
    const state = transition(createWorkflow(), { type: 'PLAY' });
    expect(state.status).toBe('RUNNING');
    expect(state.cursor).toBe(0);
  });
  it('pauses without advancing and resumes from the same event', () => {
    const running = transition(createWorkflow(), { type: 'PLAY' });
    const paused = transition(running, { type: 'PAUSE' });
    expect(paused.status).toBe('PAUSED');
    expect(transition(paused, { type: 'TICK' })).toEqual(paused);
    const resumed = transition(paused, { type: 'RESUME' });
    expect(transition(resumed, { type: 'TICK' }).cursor).toBe(1);
  });
  it('completes the success scenario after automatic ticks', () => {
    let state = transition(createWorkflow(), { type: 'PLAY' });
    for (let index = 0; index < 80; index += 1)
      state = transition(state, { type: 'TICK' });
    expect(state.status).toBe('COMPLETED');
  });
  it('stops, restarts, steps backwards, changes speed and resets the scenario deterministically', () => {
    const running = transition(createWorkflow(), { type: 'PLAY' });
    const next = transition(running, { type: 'NEXT' });
    expect(next.cursor).toBe(1);
    expect(next.status).toBe('PAUSED');
    expect(transition(next, { type: 'PREVIOUS' }).cursor).toBe(0);
    const faster = transition(next, { type: 'SPEED', speed: 4 });
    expect(faster.speed).toBe(4);
    expect(transition(faster, { type: 'STOP' }).status).toBe('STOPPED');
    expect(transition(faster, { type: 'RESTART' })).toMatchObject({
      cursor: -1,
      status: 'IDLE',
      speed: 4,
    });
    expect(
      transition(faster, { type: 'SCENARIO', scenario: 'security-failure' }),
    ).toMatchObject({
      scenario: 'security-failure',
      cursor: -1,
      status: 'IDLE',
    });
  });
  it('returns from a duplicate ISBN failure to correction, developer and GREEN before delivery', () => {
    let state = transition(createWorkflow('unit-failure'), { type: 'PLAY' });
    for (let index = 0; index < 100; index += 1)
      state = transition(state, { type: 'TICK' });
    const snapshot = workflowSnapshot(state);
    expect(
      snapshot.logs.some(
        (log) => log.level === 'ERROR' && log.message.includes('ISBN'),
      ),
    ).toBe(true);
    const ids = snapshot.logs.map((log) => log.stepId);
    const correction = ids.indexOf('correction');
    expect(correction).toBeGreaterThan(0);
    expect(ids.slice(correction)).toContain('developer');
    expect(ids.slice(correction)).toContain('green');
    expect(snapshot.nodeStates.green).toBe('PASSED');
    expect(snapshot.nodeStates.correction).toBe('PASSED');
    expect(state.status).toBe('COMPLETED');
  });
  it.each(['security-failure', 'quality-failure'] as const)(
    'blocks %s then revalidates security and gates before completion',
    (scenario) => {
      let state = transition(createWorkflow(scenario), { type: 'PLAY' });
      for (let index = 0; index < 120; index += 1)
        state = transition(state, { type: 'TICK' });
      const logs = workflowSnapshot(state).logs;
      const failure = logs.findIndex((log) => log.level === 'ERROR');
      expect(failure).toBeGreaterThan(0);
      const afterFailure = logs.slice(failure).map((log) => log.stepId);
      expect(afterFailure).toContain('correction');
      expect(afterFailure).toContain('developer');
      expect(afterFailure).toContain('green');
      expect(afterFailure).toContain('security');
      expect(afterFailure).toContain('quality');
      expect(state.status).toBe('COMPLETED');
    },
  );
  it('retests after refactoring and can clear logs without resetting progress', () => {
    let state = transition(createWorkflow(), { type: 'PLAY' });
    for (let index = 0; index < 100; index += 1)
      state = transition(state, { type: 'TICK' });
    const snapshot = workflowSnapshot(state);
    const refactor = snapshot.logs.findIndex(
      (log) => log.stepId === 'refactor',
    );
    const review = snapshot.logs.findIndex((log) => log.stepId === 'review');
    expect(
      snapshot.logs
        .slice(refactor, review)
        .some((log) => log.stepId === 'green'),
    ).toBe(true);
    const cleared = transition(state, { type: 'CLEAR_LOGS' });
    expect(workflowSnapshot(cleared).logs).toHaveLength(0);
    expect(workflowSnapshot(cleared).progress).toBe(100);
  });
});

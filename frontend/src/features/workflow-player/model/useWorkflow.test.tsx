import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useWorkflow } from './useWorkflow';
import { STEP_DURATION_MS } from '../../../entities/workflow/model/catalog';

afterEach(() => vi.useRealTimers());

it('RF-WF-002 automatically advances, pauses, resumes, changes speed and cancels on unmount', () => {
  vi.useFakeTimers();
  const { result, unmount } = renderHook(useWorkflow);
  act(() => result.current.dispatch({ type: 'PLAY' }));
  act(() => vi.advanceTimersByTime(STEP_DURATION_MS));
  expect(result.current.state.cursor).toBe(1);
  act(() => result.current.dispatch({ type: 'PAUSE' }));
  act(() => vi.advanceTimersByTime(STEP_DURATION_MS * 4));
  expect(result.current.state.cursor).toBe(1);
  act(() => result.current.dispatch({ type: 'SPEED', speed: 4 }));
  act(() => result.current.dispatch({ type: 'RESUME' }));
  act(() => vi.advanceTimersByTime(STEP_DURATION_MS / 4));
  expect(result.current.state.cursor).toBe(2);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('CA-WF-002b/c/f clears playback when stopped, restarted or switching scenarios', () => {
  vi.useFakeTimers();
  const { result, unmount } = renderHook(useWorkflow);
  act(() => result.current.dispatch({ type: 'PLAY' }));
  act(() => result.current.dispatch({ type: 'STOP' }));
  expect(vi.getTimerCount()).toBe(0);
  act(() => result.current.dispatch({ type: 'RESTART' }));
  expect(result.current.state.cursor).toBe(-1);
  act(() => result.current.dispatch({ type: 'PLAY' }));
  act(() => result.current.dispatch({ type: 'SCENARIO', scenario: 'security-failure' }));
  act(() => vi.advanceTimersByTime(STEP_DURATION_MS * 4));
  expect(result.current.state).toMatchObject({ status: 'IDLE', cursor: -1, scenario: 'security-failure' });
  expect(vi.getTimerCount()).toBe(0);
  unmount();
});

import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ExecutionTerminal } from './index';

it('RF-WF-005 exposes the log level as text alongside agent and relative time', () => {
  render(<ExecutionTerminal onClear={vi.fn()} logs={[{
    index: 0, elapsed: 1200, agent: 'QA', level: 'ERROR', message: 'ISBN duplicado.',
    stepId: 'green', status: 'FAILED',
  }]} />);
  expect(screen.getByRole('log')).toHaveTextContent('[ERROR]');
  expect(screen.getByRole('log')).toHaveTextContent('[QA]');
  expect(screen.getByRole('log')).toHaveTextContent('00:01');
});

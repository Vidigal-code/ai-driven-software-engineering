import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Select } from './Select';

it('CA-UX-001 preserves native labels, selection, ref, disabled and form values', () => {
  const change = vi.fn();
  const ref = createRef<HTMLSelectElement>();
  const view = render(<form aria-label="Filtros"><label>Disponibilidade<Select name="available" ref={ref} defaultValue="all" onChange={change}><option value="all">Todas</option><option value="true">Disponíveis</option></Select></label></form>);
  const select = screen.getByRole('combobox', { name: 'Disponibilidade' });
  fireEvent.change(select, { target: { value: 'true' } });
  expect(select).toHaveValue('true');
  expect(change).toHaveBeenCalledOnce();
  expect(ref.current).toBe(select);
  expect(screen.getByRole('form')).toHaveFormValues({ available: 'true' });
  view.rerender(<Select aria-label="Disponibilidade" disabled value="true" onChange={change}><option value="true">Disponíveis</option></Select>);
  expect(screen.getByRole('combobox')).toBeDisabled();
});

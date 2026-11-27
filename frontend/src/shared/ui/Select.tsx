import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({ className = '', children, ...props }: ComponentProps<'select'>) {
  return (
    <span className="select-control">
      <select {...props} className={`select ${className}`}>
        {children}
      </select>
      <ChevronDown className="select-chevron" size={16} aria-hidden="true" />
    </span>
  );
}

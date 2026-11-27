import { AlertCircle, BookOpen, CheckCircle2, X } from 'lucide-react';
import { cloneElement, useEffect, useId, useRef, type ReactElement, type ReactNode } from 'react';
export { Select } from './Select';

export function ErrorBanner({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const message =
    error instanceof Error
      ? error.message
      : 'Não foi possível concluir a operação.';
  return (
    <div className="error-banner" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      {retry && (
        <button className="button" onClick={retry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <BookOpen size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}

export function LoadingState() {
  return (
    <output aria-label="Carregando dados" className="block">
      <span className="sr-only">Carregando dados...</span>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="skeleton skeleton-row" />
      ))}
    </output>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="modal" aria-label={title} onCancel={event => {
      event.preventDefault();
      onClose?.();
    }}>
      <div className="panel-header">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          disabled={!onClose}
          aria-label="Fechar diálogo"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onClose, 5000);
    return () => clearTimeout(timeout);
  }, [onClose]);
  return (
    <output className="toast">
      <CheckCircle2 size={18} />
      {message}
      <button
        className="icon-button"
        onClick={onClose}
        aria-label="Dispensar notificação"
      >
        <X size={15} />
      </button>
    </output>
  );
}

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactElement<{ 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}) {
  const errorId = useId();
  return (
    <div className="field">
      <label>
        {label}
        {cloneElement(children, {
          'aria-invalid': Boolean(error),
          'aria-describedby': error ? errorId : children.props['aria-describedby'],
        })}
      </label>
      {error && (
        <span className="field-error" role="alert" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}

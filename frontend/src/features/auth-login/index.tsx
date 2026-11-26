import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, LogIn } from 'lucide-react';
import {
  login,
  loginSchema,
  type LoginInput,
  type Session,
} from '../../entities/user';
import { ErrorBanner, Field } from '../../shared/ui';

export function LoginForm({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const [error, setError] = useState<unknown>(null);
  async function submit(input: LoginInput) {
    setError(null);
    try {
      onAuthenticated(await login(input));
    } catch (cause) {
      setError(cause);
    }
  }
  return (
    <form noValidate onSubmit={form.handleSubmit(submit)}>
      {error ? <ErrorBanner error={error} /> : null}
      <Field label="E-mail" error={form.formState.errors.email?.message}>
        <input
          className="input mt-2"
          type="email"
          autoComplete="username"
          placeholder="voce@biblioteca.com"
          {...form.register('email')}
        />
      </Field>
      <Field label="Senha" error={form.formState.errors.password?.message}>
        <input
          className="input mt-2"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          {...form.register('password')}
        />
      </Field>
      <button
        className="button button-primary"
        type="submit"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <LoaderCircle size={17} />
        ) : (
          <LogIn size={17} />
        )}
        {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

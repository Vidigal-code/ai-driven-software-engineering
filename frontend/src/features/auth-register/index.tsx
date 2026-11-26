import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import {
  register as registerUser,
  registerSchema,
  type RegisterInput,
  type Session,
} from '../../entities/user';
import { ErrorBanner, Field } from '../../shared/ui';

export function RegisterForm({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const [error, setError] = useState<unknown>(null);
  async function submit(input: RegisterInput) {
    setError(null);
    try {
      onAuthenticated(await registerUser(input));
    } catch (cause) {
      setError(cause);
    }
  }
  return (
    <form noValidate onSubmit={form.handleSubmit(submit)}>
      {error ? <ErrorBanner error={error} /> : null}
      <Field label="Nome" error={form.formState.errors.name?.message}>
        <input
          className="input mt-2"
          autoComplete="name"
          {...form.register('name')}
        />
      </Field>
      <Field label="E-mail" error={form.formState.errors.email?.message}>
        <input
          className="input mt-2"
          type="email"
          autoComplete="username"
          {...form.register('email')}
        />
      </Field>
      <Field label="Senha" error={form.formState.errors.password?.message}>
        <input
          className="input mt-2"
          type="password"
          autoComplete="new-password"
          placeholder="Pelo menos 12 caracteres"
          {...form.register('password')}
        />
      </Field>
      <p className="small muted">
        Sua conta terá acesso de leitura. Um administrador pode conceder outras
        permissões.
      </p>
      <button
        className="button button-primary"
        type="submit"
        disabled={form.formState.isSubmitting}
      >
        <UserPlus size={17} />
        {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  );
}

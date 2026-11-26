import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../../features/auth-login';
import { useSession } from '../../entities/user';
import { AuthLayout } from '../../widgets/auth-layout';

export default function LoginPage() {
  const { authenticate } = useSession();
  const navigate = useNavigate();
  return (
    <AuthLayout
      title="Bem-vindo de volta"
      description="Entre na sua conta para acessar e gerenciar o acervo."
    >
      <LoginForm
        onAuthenticated={(session) => {
          authenticate(session);
          navigate('/dashboard', { replace: true });
        }}
      />
      <p className="auth-links">
        Ainda não tem uma conta? <Link to="/register">Cadastre-se</Link>
      </p>
    </AuthLayout>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../features/auth-register';
import { useSession } from '../../entities/user';
import { AuthLayout } from '../../widgets/auth-layout';

export default function RegisterPage() {
  const { authenticate } = useSession();
  const navigate = useNavigate();
  return (
    <AuthLayout
      title="Seu próximo capítulo"
      description="Crie uma conta para explorar o acervo da biblioteca."
    >
      <RegisterForm
        onAuthenticated={(session) => {
          authenticate(session);
          navigate('/dashboard', { replace: true });
        }}
      />
      <p className="auth-links">
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  );
}

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // enquanto verifica sessão
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  // se não tem usuário → bloqueia
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // se tem usuário → libera
  return children;
}

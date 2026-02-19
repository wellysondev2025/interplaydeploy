import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // enquanto valida sessão no backend
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Validando sessão...</p>
      </div>
    );
  }

  // sessão inválida → volta pro login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // sessão ok → libera rota
  return children;
}

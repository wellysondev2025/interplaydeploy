import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário ao iniciar app
  useEffect(() => {
    async function loadUser() {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      const savedUser = localStorage.getItem("user");

      // Se não tem token → não está logado
      if (!access) {
        setLoading(false);
        return;
      }

      // Primeiro: hidrata com user salvo (UX mais rápida)
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      try {
        // Tenta validar access token no backend
        const res = await api.get("users/me/");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        // Se deu 401 → access token expirou, tenta refresh
        if (err.response?.status === 401 && refresh) {
          try {
            // Chama endpoint de refresh
            const tokenRes = await api.post("token/refresh/", { refresh });
            const newAccess = tokenRes.data.access;
            localStorage.setItem("access", newAccess);

            // Refaz a requisição do usuário
            const res2 = await api.get("users/me/");
            setUser(res2.data);
            localStorage.setItem("user", JSON.stringify(res2.data));
          } catch (refreshErr) {
            console.error("Refresh token falhou:", refreshErr);
            logout();
          }
        } else {
          console.error("Erro ao validar sessão:", err);
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Função de login centralizada
  function login(userData, access, refresh) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  // Função de logout global
  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}

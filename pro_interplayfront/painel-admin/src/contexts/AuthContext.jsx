import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // função para esperar (usada no retry)
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // =========================
  // Carrega usuário ao iniciar app
  // =========================
  useEffect(() => {
    async function loadUser() {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      const savedUser = localStorage.getItem("user");

      if (!access) {
        setLoading(false);
        return;
      }

      // hidrata usuário salvo (UX rápida)
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          const res = await api.get("users/me/");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          setLoading(false);
          return;
        } catch (err) {
          // erro de rede / render dormindo
          if (!err.response) {
            console.warn("API dormindo... tentando novamente");
            retries++;
            await delay(3000);
            continue;
          }

          // 401 → tenta refresh
          if (err.response.status === 401 && refresh) {
            try {
              const tokenRes = await api.post("token/refresh/", { refresh });
              const newAccess = tokenRes.data.access;

              localStorage.setItem("access", newAccess);

              const res2 = await api.get("users/me/");
              setUser(res2.data);
              localStorage.setItem("user", JSON.stringify(res2.data));
              setLoading(false);
              return;
            } catch (refreshErr) {
              console.error("Refresh token falhou:", refreshErr);
              logout();
              return;
            }
          }

          // qualquer outro erro real
          console.error("Erro real ao validar sessão:", err);
          logout();
          return;
        }
      }

      // se estourou retries → assume offline temporário
      console.warn("Servidor não respondeu após tentativas.");
      setLoading(false);
    }

    loadUser();
  }, []);

  // =========================
  // LOGIN
  // =========================
  function login(userData, access, refresh) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  // =========================
  // LOGOUT
  // =========================
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

// hook
export function useAuth() {
  return useContext(AuthContext);
}

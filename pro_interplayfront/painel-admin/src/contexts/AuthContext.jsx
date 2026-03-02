import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // =========================
  // Carrega usuário ao iniciar app
  // =========================
  useEffect(() => {
    async function loadUser() {
      const access = localStorage.getItem("access");
      const savedUser = localStorage.getItem("user");

      if (!access) {
        setLoading(false);
        return;
      }

      // Hidrata usuário salvo para UX rápida
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          // ✅ Requisição protegida, interceptor envia Authorization
          const res = await api.get("users/me/");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          setLoading(false);
          return;
        } catch (err) {
          // Erro de rede ou backend dormindo
          if (!err.response) {
            console.warn("API dormindo... tentando novamente");
            retries++;
            await delay(3000);
            continue;
          }

          // 401 → interceptor do api.js já faz refresh automaticamente
          if (err.response.status === 401) {
            console.warn("401 recebido no loadUser, interceptor deve cuidar do refresh");
            // aqui só tentamos mais algumas vezes antes de logout
            retries++;
            await delay(500);
            continue;
          }

          // qualquer outro erro real
          console.error("Erro real ao validar sessão:", err);
          logout();
          return;
        }
      }

      console.warn("Servidor não respondeu após tentativas.");
      setLoading(false);
    }

    loadUser();
  }, []);

  // =========================
  // LOGIN
  // =========================
  async function login(userData, access, refresh) {
    // ✅ salva tokens antes de qualquer requisição
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    navigate("/dashboard");
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isSuperuser: user?.role === "superuser",
        isOrgAdmin: user?.role === "org_admin",
        isProfessional: user?.role === "professional",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// hook
export function useAuth() {
  return useContext(AuthContext);
}
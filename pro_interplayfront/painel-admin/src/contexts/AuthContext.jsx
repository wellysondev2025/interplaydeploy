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
        const token = localStorage.getItem("access");
        const savedUser = localStorage.getItem("user");

        // Se não tem token → não está logado
        if (!token) {
        setLoading(false);
        return;
        }

        // Primeiro: hidrata com user salvo (UX mais rápida)
        if (savedUser) {
        setUser(JSON.parse(savedUser));
        }

        try {
        // Depois valida no backend
        const res = await api.get("users/me/");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
        console.error("Erro ao validar sessão:", err);

        // Se nem refresh resolver → logout total
        logout();
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

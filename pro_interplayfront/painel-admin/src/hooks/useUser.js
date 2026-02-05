// hooks/useUser.js
import { useEffect, useState } from "react";
import api from "../services/api";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get("users/me/"); // usa a MeView
        setUser(res.data);
      } catch (err) {
        console.error("Erro ao carregar usuário logado:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, loading };
}

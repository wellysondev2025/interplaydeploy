import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bgImage from "../assets/bg.jpg";
import logoLogin from "../assets/logologin.svg";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    toast.promise(
      (async () => {
        // 1️⃣ Login → recebe tokens
        const response = await api.post("token/", { email, password });
        const { access, refresh } = response.data;

        // salva tokens imediatamente
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        // 2️⃣ Busca usuário logado
        const me = await api.get("users/me/");

        // 3️⃣ Salva no contexto
        login(me.data, access, refresh);

        // 4️⃣ Redireciona
        navigate("/dashboard");

        return me.data;
      })(),
      {
        loading: "Entrando...",
        success: (data) => `Bem-vindo(a), ${data.name || "usuário"}!`,
        error: "Falha no login. Verifique suas credenciais.",
      }
    ).catch(() => {
      setError("Email ou senha inválidos.");
    });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img
            src={logoLogin}
            alt="Logo"
            className="h-20 w-20 rounded-full shadow-md"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-[#60606a]">
          Painel Administrativo
        </h1>
        <p className="text-center text-sm text-gray-500 mt-1 mb-6">
          Faça login para acessar o sistema
        </p>

        {error && (
          <div className="bg-[#ffaaaa] text-[#60606a] p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="seuemail@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8be9b9]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#f0d384]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#8be9b9] hover:bg-[#83e8ea] text-[#60606a] font-semibold py-3 rounded-xl transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Sistema Interplay
        </p>
      </div>
    </div>
  );
}

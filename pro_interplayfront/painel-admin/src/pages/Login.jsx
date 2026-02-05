import { useState } from "react";
import axios from "axios";
import bgImage from "../assets/bg.jpg";
import logoLogin from "../assets/logologin.svg";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        email,
        password,
      });

      const { access, refresh } = response.data;

      // ✅ salvar corretamente
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // buscar info do usuário logado
      const me = await axios.get("http://localhost:8000/api/users/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      localStorage.setItem("user", JSON.stringify(me.data));


      window.location.href = "/dashboard";
    } catch (err) {
      setError("Email ou senha inválidos.");
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src={logoLogin} alt="Logo" className="h-20 w-20 rounded-full shadow-md" />
        </div>

        <h1 className="text-2xl font-bold text-center text-[#60606a]">Painel Administrativo</h1>
        <p className="text-center text-sm text-gray-500 mt-1 mb-6">Faça login para acessar o sistema</p>

        {error && (
          <div className="bg-[#ffaaaa] text-[#60606a] p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
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
            <label className="block text-sm font-medium text-gray-700">Senha</label>
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
            disabled={loading}
            className="w-full bg-[#8be9b9] hover:bg-[#83e8ea] text-[#60606a] font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">© {new Date().getFullYear()} Sistema Interplay</p>
      </div>
    </div>
  );
}

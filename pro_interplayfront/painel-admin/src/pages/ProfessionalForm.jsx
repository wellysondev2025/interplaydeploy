import { useState } from "react";
import api from "../services/api";

export default function ProfessionalForm({ professional, onClose, onSave }) {
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    email: professional?.user?.email || "",
    password: "",
    role: professional?.role || "",
    code: professional?.code || "",
    name: professional?.name || "",
    cpf: professional?.cpf || "",
    address: professional?.address || "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoadingSubmit(true);

    const payload = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      code: formData.code,
      name: formData.name,
      cpf: formData.cpf,
      address: formData.address,
    };

    if (!professional) {
      payload.email = formData.email;
      payload.password = formData.password;
    }

    try {
      const url = professional
        ? `painel/professionals/${professional.id}/`
        : "painel/professionals/";
      const method = professional ? "put" : "post";

      await api({ url, method, data: payload });
      onSave();
    } catch (err) {
      console.error("Erro ao salvar profissional:", err);
      alert("Erro ao salvar profissional. Verifique os dados e tente novamente.");
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-start p-4">
      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          rounded-2xl
          shadow-xl
          w-96
          max-h-[calc(100vh-80px)]
          overflow-auto
          relative
          p-6
        "
      >   
        {/* Botão de fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h3 className="text-xl font-bold mb-4 text-center">
          {professional ? "Editar Profissional" : "Novo Profissional"}
        </h3>

        {/* Campos de criação */}
        {!professional && (
          <>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mb-3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />

            <label className="block mb-2 font-medium">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mb-3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </>
        )}

        {/* Dropdown de privilégios */}
        <label className="block mb-2 font-medium">Nível de acesso</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full mb-3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        >
          <option value="">Selecione o nível</option>
          <option value="admin">Admin (privilégios totais)</option>
          <option value="user">Usuário normal</option>
        </select>

        {/* Outros campos */}
        {["code", "name", "cpf", "address"].map(field => (
          <div key={field} className="mb-3">
            <label className="block mb-1 font-medium">
              {field === "code"
                ? "Código"
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        ))}

        {/* Botões */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            disabled={loadingSubmit}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            disabled={loadingSubmit}
          >
            {loadingSubmit ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import api from "@/services/api";

export default function ProfessionalForm({ professional, user, onClose, onSave }) {
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    email: professional?.user?.email || "",
    password: "",
    role: professional?.role || "professional",
    code: professional?.code || "",
    name: professional?.name || "",
    cpf: professional?.cpf || "",
    address: professional?.address || "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoadingSubmit(true);

    // payload base
    const payload = {
      email: formData.email,
      password: formData.password,
      code: formData.code,
      name: formData.name,
      cpf: formData.cpf,
      address: formData.address,
    };

    // Se SUPERUSER, pode enviar role
    if (user?.is_superuser) {
      payload.role = formData.role;
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
        className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto relative p-8"
      >
        {/* Botão de fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h3 className="text-xl font-bold text-center text-theme">
          {professional ? "Editar Profissional" : "Novo Profissional"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Campos de criação */}
          {!professional && (
            <>
              <div className="flex flex-col md:col-span-1">
                <label className="mb-1 font-medium text-theme">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-theme rounded-lg px-3 py-2 w-full"
                />
              </div>

              <div className="flex flex-col md:col-span-1">
                <label className="mb-1 font-medium text-theme">Senha</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-theme rounded-lg px-3 py-2 w-full"
                />
              </div>
            </>
          )}

          {/* Campos do model Professional */}
          {["code", "name", "cpf", "address"].map((field) => (
            <div key={field} className="flex flex-col md:col-span-1">
              <label className="mb-1 font-medium text-theme">
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
                className="input-theme rounded-lg px-3 py-2 w-full"
              />
            </div>
          ))}

          {/* Role apenas para SUPERUSER */}
          {user?.is_superuser && !professional && (
            <div className="flex flex-col md:col-span-1">
              <label className="mb-1 font-medium text-theme">Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="superuser">SUPERUSER</option>
                <option value="org_admin">ORG_ADMIN</option>
                <option value="professional">PROFESSIONAL</option>
              </select>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg btn-secondary transition disabled:opacity-50"
              disabled={loadingSubmit}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg btn-primary transition disabled:opacity-50"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
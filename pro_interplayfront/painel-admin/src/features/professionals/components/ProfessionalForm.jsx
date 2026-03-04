import { useState } from "react";
import api from "@/services/api";

export default function ProfessionalForm({ professional, user, onClose, onSave }) {
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const isEdit = Boolean(professional);

  const [formData, setFormData] = useState({
    email: professional?.user?.email || "",
    password: "",
    role: "professional",
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

    try {
      let payload;

      if (isEdit) {
        // UPDATE → apenas campos do Professional
        payload = {
          code: formData.code,
          name: formData.name,
          cpf: formData.cpf,
          address: formData.address,
        };

        await api.patch(`painel/professionals/${professional.id}/`, payload);
      } else {
        // CREATE → cria User + Professional
        payload = {
          email: formData.email,
          password: formData.password,
          code: formData.code,
          name: formData.name,
          cpf: formData.cpf,
          address: formData.address,
        };

        if (user?.role === "superuser") {
          payload.role = formData.role;
        }

        await api.post("painel/professionals/", payload);
      }

      onSave();
    } catch (err) {
      console.error("Erro ao salvar profissional:", err);
      alert("Erro ao salvar profissional. Verifique os dados.");
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="
          relative
          bg-surface
          w-full
          max-w-md
          sm:max-w-lg
          rounded-2xl
          shadow-2xl
          p-5
          sm:p-6
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
        >
          ×
        </button>

        <h3 className="text-lg sm:text-xl font-bold text-center text-theme mb-6">
          {isEdit ? "Editar Profissional" : "Novo Profissional"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isEdit && (
            <>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-theme">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-theme rounded-lg px-3 py-2 w-full text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-theme">
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-theme rounded-lg px-3 py-2 w-full text-sm"
                />
              </div>
            </>
          )}

          {["code", "name", "cpf", "address"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-theme">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className="input-theme rounded-lg px-3 py-2 w-full text-sm"
              />
            </div>
          ))}

          {!isEdit && user?.role === "superuser" && (
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 text-sm font-medium text-theme">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-theme rounded-lg px-3 py-2 text-sm"
              >
                <option value="professional">PROFESSIONAL</option>
                <option value="org_admin">ORG_ADMIN</option>
                <option value="superuser">SUPERUSER</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loadingSubmit}
              className="px-4 py-2 rounded-lg btn-secondary text-sm"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="px-4 py-2 rounded-lg btn-primary text-sm"
            >
              {loadingSubmit ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
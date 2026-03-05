import { useEffect, useState } from "react";
import api from "@/services/api";
import semFoto from "@/assets/semfoto.svg";

export default function ProfessionalForm({ professional, user, onClose, onSave }) {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [organizations, setOrganizations] = useState([]);

  const isEdit = Boolean(professional);

  const [formData, setFormData] = useState({
    email: professional?.user?.email || "",
    password: "",
    role: professional?.user?.role || "professional",
    organization: professional?.user?.organization?.id || "",
    code: professional?.code || "",
    name: professional?.name || "",
    cpf: professional?.cpf || "",
    address: professional?.address || "",
  });

  // 🔹 Buscar organizações se SUPERUSER
  useEffect(() => {
    if (user?.role === "superuser") {
      api.get("organizations/")
        .then((res) => setOrganizations(res.data))
        .catch((err) => console.error("Erro ao buscar organizações", err));
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      let payload = {
        code: formData.code,
        name: formData.name,
        cpf: formData.cpf,
        address: formData.address,
      };

      // SUPERUSER pode alterar também email, senha, role e organization
      if (user?.role === "superuser") {
        payload.email = formData.email;
        if (formData.password) payload.password = formData.password;
        payload.role = formData.role;
        payload.organization = formData.organization;
      }

      if (isEdit) {
        await api.patch(`painel/professionals/${professional.id}/`, payload);
      } else {
        // Campos obrigatórios para criação
        if (!payload.email) payload.email = formData.email;
        if (!payload.password) payload.password = formData.password;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative bg-surface w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto z-10"
      >
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
          {/* Mostrar campos de usuário para SUPERUSER sempre */}
          {user?.role === "superuser" && (
            <>
              <div className="flex flex-col">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-theme rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label>Senha</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-theme rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label>Organização</label>
                <select
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  className="input-theme rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Selecione uma organização</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-theme rounded-lg px-3 py-2 text-sm"
                >
                  <option value="professional">PROFESSIONAL</option>
                  <option value="org_admin">ORG_ADMIN</option>
                </select>
              </div>
            </>
          )}

          {/* Campos do Professional */}
          {["code", "name", "cpf", "address"].map((field) => (
            <div key={field} className="flex flex-col">
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className="input-theme rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}

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
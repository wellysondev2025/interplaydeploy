// src/features/professionals/pages/Professionals.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProfessionalsList from "@/features/professionals/components/ProfessionalList";
import ProfessionalForm from "@/features/professionals/components/ProfessionalForm";
import api from "@/services/api";
import useUser from "@/hooks/useUser";

export default function Professionals() {
  const [professionals, setProfessionals] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editProfessional, setEditProfessional] = useState(null);

  const { user, loading: loadingUser } = useUser();

  useEffect(() => {
    if (user?.is_superuser) loadProfessionals();
    else setLoadingProfessionals(false);
  }, [user]);

  async function loadProfessionals() {
    setLoadingProfessionals(true);
    setError(null);
    try {
      const res = await api.get("painel/professionals/");
      setProfessionals(res.data);
    } catch (err) {
      console.error("Erro ao carregar profissionais:", err);
      setError("Falha ao carregar profissionais.");
      setProfessionals([]);
    } finally {
      setLoadingProfessionals(false);
    }
  }

  function handleEdit(professional) {
    setEditProfessional(professional);
    setOpenForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Deseja realmente excluir este profissional?")) return;
    try {
      await api.delete(`/painel/professionals/${id}/`);
      loadProfessionals();
    } catch (err) {
      console.error("Erro ao deletar profissional:", err);
      alert("Erro ao deletar profissional. Tente novamente.");
    }
  }

  function handleSave() {
    loadProfessionals();
    setOpenForm(false);
  }

  if (loadingUser || loadingProfessionals) {
    return (
      <DashboardLayout title="Profissionais">
        <p className="p-6 text-muted">Carregando...</p>
      </DashboardLayout>
    );
  }

  if (!user?.is_superuser) {
    return (
      <DashboardLayout title="Profissionais">
        <p className="p-6 text-muted">
          Você não tem permissão para acessar esta página.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profissionais">
      {/* Container principal */}
      <div className="bg-surface backdrop-blur rounded-3xl shadow-xl p-8">
        {/* Cabeçalho da página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold card-pro-title">
              Gestão de Profissionais
            </h2>
            <p className="text-sm text-muted">
              Gerencie os profissionais cadastrados no sistema
            </p>
          </div>

          <button
            onClick={() => {
              setEditProfessional(null);
              setOpenForm(true);
            }}
            style={{
              background: "var(--gradient-horizontal)",
              color: "var(--btn-primary-text)"
            }}
            className="
              px-6 py-2.5
              rounded-xl
              font-medium
              hover:opacity-90
              transition
              shadow-md
            "
          >
            + Novo Profissional
          </button>
        </div>

        {error && (
          <p className="text-red-500 mb-6">{error}</p>
        )}

        {/* Lista */}
        <div className="px-0 sm:px-2">
          <ProfessionalsList
            professionals={professionals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={user.is_superuser}
          />
        </div>

        {/* Modal */}
        {openForm && (
          <ProfessionalForm
            professional={editProfessional}
            onClose={() => setOpenForm(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
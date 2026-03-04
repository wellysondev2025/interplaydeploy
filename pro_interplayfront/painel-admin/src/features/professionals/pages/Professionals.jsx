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
    if (user) loadProfessionals();
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
      await api.delete(`painel/professionals/${id}/`);
      loadProfessionals();
    } catch (err) {
      console.error("Erro ao deletar profissional:", err);
      alert("Erro ao deletar profissional.");
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

  if (!user) {
    return (
      <DashboardLayout title="Profissionais">
        <p className="p-6 text-muted">
          Você não tem permissão para acessar esta página.
        </p>
      </DashboardLayout>
    );
  }

  const canCreate =
    user.role === "superuser" ||
    user.role === "org_admin";

  return (
    <DashboardLayout title="Profissionais">
      <div className="relative">
        {/* Card principal */}
        <div className="bg-surface rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
          
          {/* Header da página */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Gestão de Profissionais
              </h2>
              <p className="text-sm text-muted">
                Gerencie os profissionais cadastrados
              </p>
            </div>

            {canCreate && (
              <button
                onClick={() => {
                  setEditProfessional(null);
                  setOpenForm(true);
                }}
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-2.5
                  rounded-lg
                  font-medium
                  btn-primary
                "
              >
                + Novo Profissional
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <ProfessionalsList
            professionals={professionals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            user={user}
          />
        </div>

        {/* Modal */}
        {openForm && (
          <ProfessionalForm
            professional={editProfessional}
            user={user}
            onClose={() => setOpenForm(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
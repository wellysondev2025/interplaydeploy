import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ProfessionalsList from "./ProfessionalsList";
import ProfessionalForm from "./ProfessionalForm";
import api from "../services/api";
import useUser from "../hooks/useUser";

export default function Professionals() {
  const [professionals, setProfessionals] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editProfessional, setEditProfessional] = useState(null);

  const { user, loading: loadingUser } = useUser();

  useEffect(() => {
    if (user?.super_user) loadProfessionals();
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
        <p className="p-6 text-gray-500">Carregando...</p>
      </DashboardLayout>
    );
  }

  if (!user?.super_user) {
    return (
      <DashboardLayout title="Profissionais">
        <p className="p-6 text-gray-500">
          Você não tem permissão para acessar esta página.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profissionais">
      {/* Container principal */}
      <div
        className="
          bg-white/80
          backdrop-blur
          rounded-3xl
          shadow-xl
          p-8
        "
      >
        {/* Cabeçalho da página */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#3B0A45]">
              Gestão de Profissionais
            </h2>
            <p className="text-sm text-gray-500">
              Gerencie os profissionais cadastrados no sistema
            </p>
          </div>

          <button
            onClick={() => {
              setEditProfessional(null);
              setOpenForm(true);
            }}
            className="
              px-6 py-2.5
              rounded-xl
              text-white
              font-medium
              bg-gradient-to-r
              from-[#3B0A45]
              to-[#5A1661]
              hover:opacity-90
              transition
              shadow-md
            "
          >
            + Novo Profissional
          </button>
        </div>

        {error && (
          <p className="text-red-500 mb-6">
            {error}
          </p>
        )}

        {/* Lista */}
        <ProfessionalsList
          professionals={professionals}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={user.super_user}
        />

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

import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import semFoto from "../assets/semfoto.svg";

/* =====================
   BOTÃO PADRÃO
====================== */
const ActionButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="
      px-4 py-2
      text-sm font-medium
      rounded-lg
      bg-rose-500
      text-white
      hover:bg-rose-600
      transition
      cursor-pointer
    "
  >
    {children}
  </button>
);


export default function PacientesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [descriptions, setDescriptions] = useState({});

  /* =====================
     FETCH PACIENTES
  ====================== */
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("painel/patients/");
        setPatients(res.data.patients);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar pacientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  /* =====================
     DESCRIÇÃO
  ====================== */
  const handleDescriptionChange = (activityId, value) => {
    setDescriptions((prev) => ({
      ...prev,
      [activityId]: value,
    }));
  };

  const saveDescription = async (activity) => {
    const description = descriptions[activity.id] ?? "";

    try {
      await api.post("painel/description/update/", {
        activity_hash: activity.hash,
        description,
      });
    } catch (err) {
      console.error("Erro ao salvar descrição", err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Pacientes">
        <div className="p-6 text-gray-500">Carregando pacientes...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Pacientes">
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    );
  }



  /* =====================
    TABELA DE PACIENTES
  ====================== */
  if (!activePatient) { 
    return (
      <DashboardLayout title="Pacientes">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Lista de Pacientes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Visualize sessões e desempenho dos seus pacientes.
            </p>
          </div>

          {/* Tabela */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs bg-gray-50">
                <th className="text-left px-6 py-3">Paciente</th>
                <th className="text-left px-4 py-3">Profissional</th>
                <th className="text-center px-4 py-3">Sessões</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>

            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition-all duration-200 cursor-default"
                >
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img
                      src={p.avatar || semFoto}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-800">
                      {p.name}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {p.professional ? p.professional.name : "—"}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {p.sessions?.length || 0}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {p.sessions?.length > 0 && (
                      <ActionButton
                        onClick={() => {
                          setActivePatient(p);
                          setActiveSession(null);
                        }}
                      >
                        Ver
                      </ActionButton>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    );
  }


  /* =====================
     TELA DO PACIENTE
  ====================== */
  if (activePatient && !activeSession) {
    return (
      <DashboardLayout title={activePatient.name}>
        <ActionButton onClick={() => setActivePatient(null)}>
          ← Voltar
        </ActionButton>

        {/* Card do Paciente */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <img
              src={activePatient.avatar || semFoto}
              alt={activePatient.name}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {activePatient.name}
              </h2>
              <p className="text-sm text-gray-500">
                {activePatient.sessions.length} sessões registradas
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Sessões */}
        <div className="mt-6 space-y-4">
          {activePatient.sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session)}
              className="
                cursor-pointer
                bg-white
                rounded-2xl
                shadow-sm
                border border-gray-100
                p-5
                hover:shadow-md
                transition
              "
            >
              <p className="font-medium text-gray-800">
                Sessão •{" "}
                {new Date(session.start_date).toLocaleDateString()}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {session.activities.length} atividades
              </p>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  /* =====================
     TELA DA SESSÃO
  ====================== */
  return (
    <DashboardLayout title="Sessão">
      <ActionButton onClick={() => setActiveSession(null)}>
        ← Voltar
      </ActionButton>

      {/* Header Sessão */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Sessão • {new Date(activeSession.start_date).toLocaleDateString()}
        </h2>

        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
          {activeSession.session_type && (
            <span>Tipo: {activeSession.session_type}</span>
          )}

          {activeSession.time_session && (
            <span>Duração: {activeSession.time_session} min</span>
          )}

          {activeSession.finally_session ? (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              Finalizada
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
              Em andamento
            </span>
          )}

          {activeSession.version_app && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
              v{activeSession.version_app}
            </span>
          )}
        </div>
      </div>

      {/* Atividades */}
      <div className="space-y-12 mt-10">
        {activeSession.activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
          >
            {activity.path_relative_image ? (
              <div className="rounded-xl overflow-hidden bg-gray-50">
                <img
                  src={`http://localhost:8000/media/${activity.path_relative_image}`}
                  alt={activity.cod_activity}
                  className="w-full max-h-[600px] object-contain"
                />
              </div>
            ) : (
              <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                Sem imagem
              </div>
            )}

            <div>
              <p className="font-medium text-gray-800">
                {activity.cod_activity}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Duração: {activity.duration || 0}s
              </p>
            </div>

            <textarea
              value={
                descriptions[activity.id] ??
                activity.description ??
                ""
              }
              onChange={(e) =>
                handleDescriptionChange(
                  activity.id,
                  e.target.value
                )
              }
              placeholder="Adicionar descrição da atividade..."
              className="
                w-full
                min-h-[120px]
                p-4
                border border-gray-200
                rounded-xl
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-rose-400
                focus:border-transparent
                transition
              "
            />

            <ActionButton
              onClick={() => saveDescription(activity)}
            >
              Salvar descrição
            </ActionButton>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

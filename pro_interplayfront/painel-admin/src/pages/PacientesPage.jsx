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
      px-3 py-1
      text-xs font-medium
      rounded-md
      bg-rose-500/10
      text-rose-600
      hover:bg-rose-500/20
      transition
      cursor-pointer
    "
  >
    {children}
  </button>
);

export default function PacientesPage() {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [descriptions, setDescriptions] = useState({});

  /* =====================
     FETCH PACIENTES
  ====================== */
  useEffect(() => {
    api.get("painel/patients/").then((res) => {
      setPatients(res.data.patients);
    });
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

  /* =====================
     TABELA DE PACIENTES
  ====================== */
  if (!activePatient) {
    return (
      <DashboardLayout title="Pacientes">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="text-left px-4 py-3 cursor-default">
                  Paciente
                </th>
                <th className="text-left px-2 py-3 cursor-default">
                  Profissional
                </th>
                <th className="text-center px-2 py-3 cursor-default">
                  Sessões
                </th>
                <th className="px-3 py-3" />
              </tr>
            </thead>

            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => {
                    if (p.sessions?.length > 0) {
                      setActivePatient(p);
                      setActiveSession(null);
                    }
                  }}
                  className="
                    hover:bg-gray-50
                    transition
                    cursor-pointer
                  "
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={p.avatar || semFoto}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-800">
                      {p.name}
                    </span>
                  </td>

                  <td className="px-2 py-3 text-gray-600">
                    {p.professional ? p.professional.name : "—"}
                  </td>

                  <td className="px-2 py-3 text-center text-gray-600">
                    {p.sessions?.length || 0}
                  </td>

                  <td
                    className="px-3 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.sessions?.length > 0 && (
                      <ActionButton>Ver</ActionButton>
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

        <div className="mt-6 space-y-4">
          {activePatient.sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session)}
              className="
                cursor-pointer
                bg-white
                rounded-xl
                shadow-sm
                p-4
                hover:shadow-md
                transition
              "
            >
              <p className="font-medium text-gray-800">
                Sessão •{" "}
                {new Date(session.start_date).toLocaleDateString()}
                {session.session_type && (
                  <span className="text-gray-500 font-normal">
                    {" "}
                    • {session.session_type}
                  </span>
                )}
              </p>

              <p className="text-xs text-gray-500 mt-1">
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

      <h2 className="text-lg font-semibold mt-6 mb-10 text-gray-800">
        Sessão •{" "}
        {new Date(activeSession.start_date).toLocaleDateString()}

        {activeSession.session_type && (
          <span className="text-gray-500 font-normal">
            {" "}
            • Tipo: {activeSession.session_type}
          </span>
        )}

        {activeSession.time_session && (
          <span className="text-gray-500 font-normal">
            {" "}
            • {activeSession.time_session} min
          </span>
        )}

        {activeSession.finally_session && (
          <span className="text-emerald-600 font-medium">
            {" "}
            • Finalizada
          </span>
        )}

        {activeSession.version_app && (
          <span className="
            ml-2
            text-xs
            px-2
            py-0.5
            rounded-full
            bg-gray-100
            text-gray-500
          ">
            v{activeSession.version_app}
          </span>
        )}
      </h2>

      <div className="space-y-20">
        {activeSession.activities.map((activity) => (
          <div
            key={activity.id}
            className="max-w-4xl mx-auto space-y-5"
          >
            {activity.path_relative_image ? (
              <img
                src={`http://localhost:8000/media/${activity.path_relative_image}`}
                alt={activity.cod_activity}
                className="
                  w-full
                  max-h-[620px]
                  object-contain
                  rounded-xl
                  shadow-lg
                "
              />
            ) : (
              <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                Sem imagem
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium text-gray-800">
                {activity.cod_activity}
              </p>

              <p className="text-sm text-gray-500">
                Duração: {activity.duration || 0}s
              </p>

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
                  min-h-[110px]
                  p-3
                  border
                  rounded-lg
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-rose-300
                "
              />

              <ActionButton
                onClick={() => saveDescription(activity)}
              >
                Salvar descrição
              </ActionButton>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

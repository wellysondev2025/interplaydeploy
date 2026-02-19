import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import semFoto from "../assets/semfoto.svg";
import toast from "react-hot-toast";

// ================= ACTION BUTTON =================
export const ActionButton = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm font-medium rounded-lg
      bg-rose-500 text-white hover:bg-rose-600
      transition cursor-pointer
      ${className || ""}
    `}
  >
    {children}
  </button>
);

// ================= PACIENTES TABLE =================
const PacientesTable = ({ patients, onSelectPatient }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800">Lista de Pacientes</h2>
      <p className="text-sm text-gray-500 mt-1">
        Visualize sessões e desempenho dos seus pacientes.
      </p>
    </div>

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
              <span className="font-medium text-gray-800">{p.name}</span>
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
                <ActionButton onClick={() => onSelectPatient(p)}>Ver</ActionButton>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ================= PATIENT DETAILS =================
const PatientDetails = ({ patient, onBack, onSelectSession }) => (
  <>
    <ActionButton onClick={onBack}>← Voltar</ActionButton>

    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-4">
        <img
          src={patient.avatar || semFoto}
          alt={patient.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{patient.name}</h2>
          <p className="text-sm text-gray-500">{patient.sessions.length} sessões registradas</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {patient.sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
          >
            <p className="font-medium text-gray-800">
              Sessão • {new Date(session.start_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">{session.activities.length} atividades</p>
          </div>
        ))}
      </div>
    </div>
  </>
);

// ================= SESSION DETAILS =================
  const SessionDetails = ({ session, onBack, descriptions, setDescriptions, saveDescription, setSession }) => {
    const handleDescriptionChange = (activityId, value) => {
      setDescriptions((prev) => ({ ...prev, [activityId]: value }));
    };

    return (
      <>
        <ActionButton onClick={onBack}>← Voltar</ActionButton>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Sessão • {new Date(session.start_date).toLocaleDateString()}
          </h2>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
            {session.session_type && <span>Tipo: {session.session_type}</span>}
            {session.time_session && <span>Duração: {session.time_session} min</span>}
            {session.finally_session ? (
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">Finalizada</span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">Em andamento</span>
            )}
            {session.version_app && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">v{session.version_app}</span>
            )}
          </div>

          <div className="space-y-12 mt-10">
            {session.activities.map((activity) => (
              <div key={activity.id} className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {/* Imagem */}
                <div className="md:w-1/2 flex items-center justify-center rounded-xl overflow-hidden bg-gray-50">
                  {activity.image_url ? (
                    <img
                      src={activity.image_url}
                      alt={activity.cod_activity}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">Sem imagem</div>
                  )}
                </div>

                {/* Informações */}
                <div className="md:w-1/2 flex flex-col justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800">{activity.cod_activity}</p>
                    <p className="text-sm text-gray-500">Duração: {activity.duration || 0}s</p>

                    {/* Observação/descrição sempre visível */}
                    <p className="mt-2 text-sm text-gray-700">
                      {activity.description?.text || "Sem observação"}
                    </p>
                  </div>

                  {/* Botão de editar/adicionar descrição */}
                  {!activity.editing ? (
                    <ActionButton
                      onClick={() => {
                        setSession((prev) => ({
                          ...prev,
                          activities: prev.activities.map((a) =>
                            a.id === activity.id ? { ...a, editing: true } : a
                          ),
                        }));
                        setDescriptions((prev) => ({
                          ...prev,
                          [activity.id]: activity.description?.text || "",
                        }));
                      }}
                    >
                      {activity.description ? "Editar descrição" : "Adicionar descrição"}
                    </ActionButton>
                  ) : (
                    <>
                      <textarea
                        value={descriptions[activity.id] ?? ""}
                        onChange={(e) => handleDescriptionChange(activity.id, e.target.value)}
                        placeholder="Adicionar descrição da atividade..."
                        className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                      />
                      <div className="flex gap-2 mt-2">
                        <ActionButton
                          onClick={async () => {
                            try {
                              await saveDescription(activity);
                              setSession((prev) => ({
                                ...prev,
                                activities: prev.activities.map((a) =>
                                  a.id === activity.id
                                    ? { ...a, editing: false, description: { text: descriptions[activity.id] } }
                                    : a
                                ),
                              }));
                              toast.success("Descrição salva com sucesso!", { duration: 3000 });
                            } catch (err) {
                              console.error(err);
                              toast.error("Erro ao salvar descrição", { duration: 3000 });
                            }
                          }}
                        >
                          Salvar
                        </ActionButton>

                        <ActionButton
                          onClick={() => {
                            setSession((prev) => ({
                              ...prev,
                              activities: prev.activities.map((a) =>
                                a.id === activity.id ? { ...a, editing: false } : a
                              ),
                            }));
                          }}
                          className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                        >
                          Cancelar
                        </ActionButton>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

// ================= PACIENTES PAGE =================
export default function PacientesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [descriptions, setDescriptions] = useState({});

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

  const saveDescription = async (activity) => {
    const description = descriptions[activity.id] ?? "";
    await api.post("painel/description/update/", {
      activity_hash: activity.hash,
      description,
    });
  };

  if (loading)
    return (
      <DashboardLayout title="Pacientes">
        <div className="p-6 text-gray-500">Carregando pacientes...</div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout title="Pacientes">
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    );

  if (!activePatient)
    return (
      <DashboardLayout title="Pacientes">
        <PacientesTable patients={patients} onSelectPatient={setActivePatient} />
      </DashboardLayout>
    );

  if (activePatient && !activeSession)
    return (
      <DashboardLayout title={activePatient.name}>
        <PatientDetails
          patient={activePatient}
          onBack={() => setActivePatient(null)}
          onSelectSession={setActiveSession}
        />
      </DashboardLayout>
    );

  return (
    <DashboardLayout title="Sessão">
      <SessionDetails
        session={activeSession}
        onBack={() => setActiveSession(null)}
        descriptions={descriptions}
        setDescriptions={setDescriptions}
        saveDescription={saveDescription}
        setSession={setActiveSession}
      />
    </DashboardLayout>
  );
}

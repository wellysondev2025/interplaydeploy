import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

/* =====================
   CARD KPI
===================== */
const KpiCard = ({ title, value }) => (
  <div className="relative bg-white rounded-xl shadow-md p-5 overflow-hidden">
    {/* Gradiente diagonal */}
    <div
      className="absolute top-0 right-0 h-full w-1/5"
      style={{
        background:
          "linear-gradient(135deg, #3B0A45 0%, #6A1B6E 40%, #C04A7D 75%, #FFAAAA 110%)",
        clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)",
        opacity: 0.9,
      }}
    />

    <p className="text-xs text-gray-500 relative z-10">{title}</p>
    <p className="text-2xl font-semibold text-gray-800 mt-2 relative z-10">
      {value}
    </p>
  </div>
);

/* =====================
   DASHBOARD
===================== */
export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("painel/dashboard/")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Erro dashboard", err));
  }, []);

  if (!data) {
    return (
      <DashboardLayout title="Dashboard">
        <p className="text-gray-500">Carregando dados...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* =====================
          KPIs
      ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Pacientes" value={data.patients_count} />
        <KpiCard title="Sessões" value={data.sessions_count} />
        <KpiCard title="Atividades" value={data.activities_count} />
        <KpiCard
          title="Tempo médio por sessão"
          value={`${data.avg_session_time}s`}
        />
      </div>

      {/* =====================
          SESSÕES POR MÊS (placeholder)
      ===================== */}
      <div className="mt-10 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Sessões nos últimos meses
        </h3>

        <div className="flex items-end gap-4 h-40">
          {data.sessions_by_month.map((item) => (
            <div key={item.month} className="flex flex-col items-center gap-2">
              <div
                className="w-8 rounded-md"
                style={{
                  height: `${item.total * 12}px`,
                  background:
                    "linear-gradient(180deg, #6A1B6E, #FFAAAA)",
                }}
              />
              <span className="text-[10px] text-gray-500">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* =====================
          ÚLTIMAS SESSÕES
      ===================== */}
      <div className="mt-10 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Últimas sessões
        </h3>

        <div className="space-y-3">
          {data.last_sessions.map((session) => (
            <div
              key={session.id}
              className="
                flex items-center justify-between
                bg-gray-50
                rounded-lg
                px-4 py-3
                hover:bg-gray-100
                transition
              "
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {session.patient_name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(session.start_date).toLocaleDateString()} •{" "}
                  {session.session_type || "Sessão"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-700">
                  {session.activities_count} atividades
                </p>
                <p
                  className={`text-xs ${
                    session.finally_session
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {session.finally_session
                    ? "Finalizada"
                    : "Em andamento"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

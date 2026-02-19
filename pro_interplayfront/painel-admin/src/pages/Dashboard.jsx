import React, { useState, useEffect } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

/* =====================
   FUNÇÃO DE FORMATAÇÃO DE TEMPO
===================== */
// Converte segundos em "Xm Ys"
function formatTime(seconds) {
  if (!seconds) return "0s";

  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/* =====================
   COMPONENTE KPI CARD
===================== */
const KpiCard = ({ title, value }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
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
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error("Erro dashboard", err);
          setData({});
        }
      });
  }, []);

  if (!data) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  const patientsCount = data.patients_count || 0;
  const sessionsCount = data.sessions_count || 0;
  const activitiesCount = data.activities_count || 0;
  const avgSessionTime = data.avg_session_time || 0;
  const sessionsByMonth = data.sessions_by_month || [];
  const lastSessions = data.last_sessions || [];

  return (
    <DashboardLayout title="Dashboard">

      {/* =====================
          KPIs
      ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Pacientes" value={patientsCount} />
        <KpiCard title="Sessões" value={sessionsCount} />
        <KpiCard title="Atividades" value={activitiesCount} />
        <KpiCard
          title="Tempo médio por sessão"
          value={formatTime(avgSessionTime)}
        />
      </div>

      {/* =====================
          SESSÕES POR MÊS
      ===================== */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Sessões nos últimos meses
        </h3>

        <div className="flex items-end gap-6 h-48">
          {sessionsByMonth.length > 0 ? (
            sessionsByMonth.map((item) => (
              <div key={item.month} className="flex flex-col items-center gap-2">
                <div
                  className="w-10 rounded-lg transition-all duration-300"
                  style={{
                    height: `${item.total * 14}px`,
                    background:
                      "linear-gradient(180deg, #8E3A92 0%, #D86A9B 60%, #FFD1D1 100%)",
                  }}
                />
                <span className="text-xs text-gray-500">
                  {new Date(item.month).toLocaleDateString("pt-BR", { month: "short" })}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center w-full text-gray-400 text-sm">
              Nenhuma sessão registrada ainda.
            </div>
          )}
        </div>
      </div>

      {/* =====================
          ÚLTIMAS SESSÕES
      ===================== */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Últimas sessões
        </h3>

        {lastSessions.length > 0 ? (
          <div className="space-y-4">
            {lastSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4 hover:bg-gray-100 transition-all duration-200"
              >
                <div>
                  <p className="text-base font-semibold text-gray-800">
                    {session.patient_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(session.start_date).toLocaleDateString()} •{" "}
                    {session.session_type || "Sessão"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {session.activities_count || 0} atividades
                  </p>

                  <span
                    className={`inline-block mt-1 px-3 py-1 text-xs rounded-full font-medium ${
                      session.finally_session
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {session.finally_session ? "Finalizada" : "Em andamento"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            Nenhuma sessão registrada ainda.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

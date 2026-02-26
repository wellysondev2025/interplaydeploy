// src/features/patients/components/SessionDetails.jsx
import React from "react";
import { ActionButton } from "./ActionButton";
import ActivityCard from "./ActivityCard";

const SessionDetails = ({ session, onBack, descriptions, setDescriptions, saveDescription, setSession }) => {
  return (
    <>
      <ActionButton onClick={onBack} variant="secondary">← Voltar</ActionButton>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Sessão • {new Date(session.start_date).toLocaleDateString()}
        </h2>

        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
          {session.session_type && <span>Tipo: {session.session_type}</span>}
          {session.time_session && <span>Duração: {session.time_session} min</span>}
          {session.finally_session ? (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              Finalizada
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
              Em andamento
            </span>
          )}
          {session.version_app && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
              v{session.version_app}
            </span>
          )}
        </div>

        <div className="space-y-12 mt-10">
          {session.activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              descriptions={descriptions}
              setDescriptions={setDescriptions}
              setSession={setSession}
              saveDescription={saveDescription}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SessionDetails;
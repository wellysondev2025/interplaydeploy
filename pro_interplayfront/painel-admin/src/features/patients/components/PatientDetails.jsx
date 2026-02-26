// features/patients/components/PatientDetails.jsx
import React from "react";
import semFoto from "@/assets/semfoto.svg";
import { ActionButton } from "./ActionButton";

const PatientDetails = ({ patient, onBack, onSelectSession }) => (
  <>
    <ActionButton onClick={onBack} variant="secondary">← Voltar</ActionButton>

    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-4">
        <img
          src={patient.avatar || semFoto}
          alt={patient.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{patient.name}</h2>
          <p className="text-sm text-gray-500">
            {patient.sessions.length} sessões registradas
          </p>
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
            <p className="text-sm text-gray-500 mt-2">
              {session.activities.length} atividades
            </p>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default PatientDetails;
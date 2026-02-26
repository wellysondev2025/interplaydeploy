// features/patients/hooks/usePatientSession.js
import { useState } from "react";
import api from "../../../services/api";

export const usePatientSession = () => {
  const [activePatient, setActivePatient] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [descriptions, setDescriptions] = useState({});

  const saveDescription = async (activity) => {
    const description = descriptions[activity.id] ?? "";
    await api.post("painel/description/update/", {
      activity_hash: activity.hash,
      description,
    });
  };

  return {
    activePatient,
    setActivePatient,
    activeSession,
    setActiveSession,
    descriptions,
    setDescriptions,
    saveDescription,
  };
};
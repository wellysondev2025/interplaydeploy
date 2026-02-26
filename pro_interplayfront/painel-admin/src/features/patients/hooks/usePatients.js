// features/patients/hooks/usePatients.js
import { useEffect, useState } from "react";
import api from "../../../services/api";

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return { patients, loading, error };
};
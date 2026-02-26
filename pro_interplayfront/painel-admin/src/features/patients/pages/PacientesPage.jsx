import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import PacientesTable from "@/features/patients/components/PacientesTable";
import PatientDetails from "@/features/patients/components/PatientDetails";
import SessionDetails from "@/features/patients/components/SessionDetails";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { usePatientSession } from "@/features/patients/hooks/usePatientSession";

export default function PacientesPage() {
  const { patients, loading, error } = usePatients();
  const {
    activePatient,
    setActivePatient,
    activeSession,
    setActiveSession,
    descriptions,
    setDescriptions,
    saveDescription,
  } = usePatientSession();

  const [search, setSearch] = useState(""); // novo estado para busca
  const [filter, setFilter] = useState("all"); // novo estado para filtro

  // aplica busca e filtro na lista de pacientes
  const filteredPatients = patients
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) =>
      filter === "all" ? true : p.status === filter
    );

  // determina o título da página
  const title = activePatient
    ? activeSession
      ? "Sessão"
      : activePatient.name
    : "Pacientes";

  // define qual conteúdo renderizar
  let content;
  if (loading) content = <div className="p-6 text-gray-500">Carregando pacientes...</div>;
  else if (error) content = <div className="p-6 text-red-500">{error}</div>;
  else if (!activePatient)
    content = (
      <PacientesTable
        patients={filteredPatients}
        onSelectPatient={setActivePatient}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
      />
    );
  else if (!activeSession)
    content = (
      <PatientDetails
        patient={activePatient}
        onBack={() => setActivePatient(null)}
        onSelectSession={setActiveSession}
      />
    );
  else
    content = (
      <SessionDetails
        session={activeSession}
        onBack={() => setActiveSession(null)}
        descriptions={descriptions}
        setDescriptions={setDescriptions}
        saveDescription={saveDescription}
        setSession={setActiveSession}
      />
    );

  return <DashboardLayout title={title}>{content}</DashboardLayout>;
}
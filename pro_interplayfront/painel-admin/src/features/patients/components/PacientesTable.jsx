import React from "react";
import semFoto from "@/assets/semfoto.svg";
import { ActionButton } from "./ActionButton";

const PacientesTable = ({ patients, onSelectPatient, search, setSearch, filter, setFilter }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    {/* Cabeçalho da tabela */}
    <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Lista de Pacientes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Visualize sessões e desempenho dos seus pacientes.
        </p>
      </div>

      {/* Busca e filtro */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente..."
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
    </div>

    {/* Tabela de pacientes */}
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
        {patients.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center py-6 text-gray-500">
              Nenhum paciente encontrado
            </td>
          </tr>
        ) : (
          patients.map((p) => (
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
                  <ActionButton onClick={() => onSelectPatient(p)} variant="primary">
                    Ver
                  </ActionButton>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default PacientesTable;
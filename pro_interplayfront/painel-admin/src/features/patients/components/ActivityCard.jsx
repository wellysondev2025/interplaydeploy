// src/features/patients/components/ActivityCard.jsx
import React from "react";
import { ActionButton } from "./ActionButton";
import toast from "react-hot-toast";

export default function ActivityCard({ activity, descriptions, setDescriptions, setSession, saveDescription }) {
  const handleDescriptionChange = (value) => {
    setDescriptions((prev) => ({ ...prev, [activity.id]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="md:flex-1 flex items-start justify-center rounded-xl overflow-hidden bg-gray-50">
        {activity.image_url ? (
          <img src={activity.image_url} alt={activity.cod_activity} className="w-full h-auto max-h-64 object-contain" />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">Sem imagem</div>
        )}
      </div>

      <div className="md:flex-1 flex flex-col justify-between gap-6 min-w-0">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">{activity.cod_activity}</h3>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              Duração: {activity.duration || 0}s
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="max-h-52 overflow-hidden pr-2">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                {activity.description?.text || "Sem observação"}
              </p>
            </div>
          </div>
        </div>

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
            variant="primary"
          >
            {activity.description ? "Editar descrição" : "Adicionar descrição"}
          </ActionButton>
        ) : (
          <>
            <textarea
              maxLength={300}
              value={descriptions[activity.id] ?? ""}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Adicionar descrição da atividade..."
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {(descriptions[activity.id] ?? "").length}/300 caracteres
            </p>
            <div className="flex gap-2 mt-2">
              <ActionButton
                onClick={async () => {
                  try {
                    await saveDescription(activity);
                    setSession((prev) => ({
                      ...prev,
                      activities: prev.activities.map((a) =>
                        a.id === activity.id
                          ? {
                              ...a,
                              editing: false,
                              description: { text: descriptions[activity.id] },
                            }
                          : a
                      ),
                    }));
                    toast.success("Descrição salva com sucesso!", { duration: 3000 });
                  } catch (err) {
                    console.error(err);
                    toast.error("Erro ao salvar descrição", { duration: 3000 });
                  }
                }}
                variant="primary"
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
                variant="secondary"
              >
                Cancelar
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
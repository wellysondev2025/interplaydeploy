import semFoto from '../assets/semfoto.svg'; // ajuste o caminho conforme sua pasta

export default function ProfessionalCard({
  professional,
  onEdit,
  onDelete,
  canEdit,
}) {
  return (
    <div
      className="
        bg-white
        border border-purple-100
        rounded-xl
        shadow-sm
        hover:shadow-md
        transition
        overflow-hidden
      "
    >
      {/* Avatar / Foto */}
      <div
        className="
          h-28
          flex items-center justify-center
          bg-gradient-to-br
          from-[#3B0A45]
          to-[#5A1661]
          text-white
        "
      >
        <img
          src={professional.avatar || semFoto}
          alt={professional.name || "Sem foto"}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[#3B0A45]">
          {professional.name}
        </h3>

        <p className="text-xs text-gray-500">
          Código: <span className="font-medium">{professional.code}</span>
        </p>

        {professional.cpf && (
          <p className="text-xs text-gray-400">
            CPF: {professional.cpf}
          </p>
        )}

        {professional.address && (
          <p className="text-xs text-gray-400 truncate">
            📍 {professional.address}
          </p>
        )}

        {/* Ações */}
        {canEdit && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={onEdit}
              className="
                flex-1
                py-1.5
                text-xs
                rounded-md
                border
                border-purple-300
                text-[#5A1661]
                hover:bg-purple-50
                transition
              "
            >
              Editar
            </button>

            <button
              onClick={onDelete}
              className="
                flex-1
                py-1.5
                text-xs
                rounded-md
                border
                border-red-300
                text-red-500
                hover:bg-red-50
                transition
              "
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

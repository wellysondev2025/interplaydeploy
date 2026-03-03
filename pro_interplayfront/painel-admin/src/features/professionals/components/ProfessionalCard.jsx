import semFoto from "@/assets/semfoto.svg";

export default function ProfessionalCard({
  professional,
  onEdit,
  onDelete,
  user, // usuário logado passado do parent
}) {
  // Determina se pode editar/deletar
  const canEdit =
    user?.is_superuser ||
    (user?.role === "org_admin" && professional?.organization === user.organization);

  return (
    <div className="card-pro rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      {/* Header / Avatar */}
      <div className="h-28 w-full card-pro-header overflow-hidden flex items-center justify-center">
        <img
          src={professional?.avatar || semFoto}
          alt={professional?.name || "Sem foto"}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-base font-semibold card-pro-title truncate">
          {professional?.name}
        </h3>

        <p className="text-xs text-muted truncate">
          Código: <span className="font-medium">{professional?.code}</span>
        </p>

        {professional?.cpf && (
          <p className="text-xs text-muted truncate">CPF: {professional.cpf}</p>
        )}

        {professional?.address && (
          <p className="text-xs text-muted truncate">📍 {professional.address}</p>
        )}

        {canEdit && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={onEdit}
              className="flex-1 py-2 text-sm rounded-lg btn-outline-primary transition hover:opacity-90"
            >
              Editar
            </button>

            <button
              onClick={onDelete}
              className="flex-1 py-2 text-sm rounded-lg btn-outline-danger transition hover:opacity-90"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
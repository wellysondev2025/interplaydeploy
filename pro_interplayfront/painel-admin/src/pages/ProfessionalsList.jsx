import ProfessionalCard from "./ProfessionalCard";

export default function ProfessionalsList({
  professionals = [],
  onEdit,
  onDelete,
  canEdit
}) {
  if (professionals.length === 0) {
    return (
      <p className="text-gray-500 text-center py-10">
        Nenhum profissional cadastrado.
      </p>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-3
        gap-6
      "
    >
      {professionals.map((prof) => (
        <ProfessionalCard
          key={prof.id}
          professional={prof}
          onEdit={() => onEdit(prof)}
          onDelete={() => onDelete(prof.id)}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}

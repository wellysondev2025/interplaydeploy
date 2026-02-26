// features/patients/components/ActionButton.jsx
import React from "react";

export const ActionButton = ({ children, onClick, variant = "primary", className }) => {
  const baseClasses = `px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer`;

  let colorClasses = "";
  if (variant === "primary") {
    colorClasses = `bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]`;
  } else if (variant === "secondary") {
    colorClasses = `bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)]`;
  } else if (variant === "danger") {
    colorClasses = `bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] hover:bg-[var(--btn-danger-hover)]`;
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${colorClasses} ${className || ""}`}
    >
      {children}
    </button>
  );
};
import { useEffect, useState } from "react";

export default function Header({ title, onMenuClick }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.admin || user?.super_user;
  const professionalCode = user?.professional?.code;

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "theme-pink-luxury"
  );

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header
      className="
        sticky top-0 z-50
        h-[88px]
        flex items-center justify-between
        px-6
        text-white
        shadow-md
      "
      style={{
        background: "var(--gradient-horizontal)",
      }}
    >
      {/* ESQUERDA */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-2xl"
        >
          ☰
        </button>

        <h1 className="text-lg md:text-xl font-semibold">
          {title}
        </h1>
      </div>

      {/* DIREITA */}
      <div className="flex items-center gap-4">

        {/* SELETOR DE TEMA */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="
            px-3 py-2
            rounded-lg
            text-sm
            bg-white/20
            backdrop-blur
            border border-white/30
            text-white
            focus:outline-none
          "
        >
          <option className="text-black bg-white" value="theme-pink-luxury">
            Pink Luxury
          </option>
          <option className="text-black bg-white" value="theme-midnight">
            Midnight
          </option>
          <option className="text-black bg-white" value="theme-royal">
            Royal
          </option>
          <option className="text-black bg-white" value="theme-emerald">
            Emerald
          </option>
          <option className="text-black bg-white" value="theme-sunset">
            Sunset
          </option>
          <option className="text-black bg-white" value="theme-ocean">
            Ocean
          </option>
          <option className="text-black bg-white" value="theme-lavender">
            Lavender
          </option>
          <option className="text-black bg-white" value="theme-gold">
            Gold
          </option>
          <option className="text-black bg-white" value="theme-crimson">
            Crimson
          </option>
          <option className="text-black bg-white" value="theme-graphite">
            Graphite
          </option>
        </select>

        {isAdmin && (
          <span
            className="
              px-4 py-2
              rounded-xl
              bg-black/25
              backdrop-blur
              text-sm font-bold
              tracking-wide
              shadow-sm
            "
          >
            ADMIN
          </span>
        )}

        {!isAdmin && professionalCode && (
          <span
            className="
              px-4 py-2
              rounded-xl
              bg-white/15
              backdrop-blur
              text-sm font-semibold
              shadow-sm
            "
          >
            Código • {professionalCode}
          </span>
        )}
      </div>
    </header>
  );
}
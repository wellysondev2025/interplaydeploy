import logoLogin from "../assets/logologin.svg";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ menuOpen, setMenuOpen }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay escuro no mobile */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72 max-w-[85%]
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:translate-x-0 md:w-72
        `}
      >
        {/* CONTAINER PRINCIPAL COM GRADIENT */}
        <div
          className="h-full flex flex-col shadow-2xl text-white"
          style={{
            background: `
              linear-gradient(
                180deg,
                #3B0A45 0%,
                #6A1B6E 40%,
                #C04A7D 75%,
                #FFAAAA 110%
              )
            `,
          }}
        >
          {/* TOPO */}
          <div className="h-[104px] px-6 flex items-center gap-4 border-b border-white/15">
            <img
              src={logoLogin}
              alt="Interplay Logo"
              className="
                h-16 w-auto
                drop-shadow-[0_0_18px_rgba(255,170,170,0.55)]
              "
            />
            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-wide">Interplay</h1>
              <p className="text-xs text-white/80">Painel Administrativo</p>
            </div>
          </div>

          {/* MENU */}
          <div className="relative flex-1 flex flex-col p-5 gap-3 overflow-hidden">
            <div className="flex-1 flex flex-col gap-3">
              {/* DASHBOARD */}
              <SidebarButton
                label="📊 Dashboard"
                onClick={() => navigate("/dashboard")}
              />

              {/* PROFISSIONAIS (admin) */}
              {user?.admin && (
                <SidebarButton
                  label="👨‍⚕️ Profissionais"
                  onClick={() => navigate("/professionals")}
                />
              )}

              {/* PACIENTES */}
              <SidebarButton
                label="🧑 Pacientes"
                onClick={() => navigate("/pacientes")}
              />

              <div className="flex-1" />

              {/* Logout */}
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="
                  w-full py-3 rounded-xl
                  bg-white/10
                  hover:bg-white/20
                  transition
                  font-semibold
                "
              >
                🚪 Sair
              </button>

              {/* Fechar menu mobile */}
              <button
                onClick={() => setMenuOpen(false)}
                className="
                  md:hidden
                  w-full py-2 mt-2
                  rounded-xl
                  bg-white/10
                  text-sm
                "
              >
                Fechar Menu
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center gap-3
        px-4 py-3
        rounded-xl
        text-base font-medium
        bg-white/10
        hover:bg-white/20
        active:bg-white/30
        transition
        shadow-sm
        cursor-pointer
      "
    >
      {label}
    </button>
  );
}

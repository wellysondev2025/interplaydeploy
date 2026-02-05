export default function Header({ title, onMenuClick }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.admin || user?.super_user;
  const professionalCode = user?.professional?.code;

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
        background: `
          linear-gradient(
            to right,
            #3B0A45 0%,
            #6A1B6E 40%,
            #C04A7D 75%,
            #FFAAAA 110%
          )
        `,
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
      <div className="flex items-center gap-3">
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

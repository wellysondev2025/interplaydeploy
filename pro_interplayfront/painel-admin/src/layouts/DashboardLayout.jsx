import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import bgInterplay from "../assets/bg.jpg";
import { useState } from "react";

export default function DashboardLayout({ title, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-theme overflow-hidden">
      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Área principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={title} onMenuClick={() => setMenuOpen(true)} />

        {/* Conteúdo */}
        <main
          className="
            flex-1
            relative
            p-6
            overflow-hidden
          "
          style={{
            backgroundImage: `url(${bgInterplay})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom right",
            backgroundSize: "cover",
          }}
        >
          {/* Overlay branco */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
            }}
          />

          {/* Conteúdo real */}
          <div className="relative z-10 h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
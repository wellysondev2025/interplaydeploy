import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import bgInterplay from "../assets/bg.jpg";
import { useState } from "react";

export default function DashboardLayout({ title, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title={title} onMenuClick={() => setMenuOpen(true)} />

        {/* Conteúdo */}
        <main
          className="flex-1 p-6 relative overflow-y-auto"
          style={{
            backgroundImage: `url(${bgInterplay})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom right",
            backgroundSize: "cover",
          }}
        >
          {/* Overlay branco */}
          <div className="absolute inset-0 bg-white/90"></div>

          {/* Conteúdo real */}
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

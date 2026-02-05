import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Professionals from "./pages/Professionals"
import PacientesPage from "./pages/PacientesPage"


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/professionals" element={<Professionals />} />
      </Routes>
    </BrowserRouter>
  )
}

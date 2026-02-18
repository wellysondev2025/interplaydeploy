import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Professionals from "./pages/Professionals";
import PacientesPage from "./pages/PacientesPage";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* login */}
          <Route path="/" element={<Login />} />

          {/* rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/pacientes"
            element={
              <PrivateRoute>
                <PacientesPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/professionals"
            element={
              <PrivateRoute>
                <Professionals />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>

  );
}

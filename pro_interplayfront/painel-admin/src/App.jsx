import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Professionals from "./pages/Professionals";
import PacientesPage from "./pages/PacientesPage";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";

export default function App() {

    useEffect(() => {
    document.documentElement.className = "theme-pink-luxury";
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>

        {/* Toaster só UMA vez */}
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          <Route path="/" element={<Login />} />

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
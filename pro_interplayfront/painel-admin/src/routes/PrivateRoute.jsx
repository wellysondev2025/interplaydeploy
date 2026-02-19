import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  console.log("PRIVATE ROUTE STATE:", { user, loading });

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h1>LOADING AUTH...</h1>
      </div>
    );
  }

  if (!user) {
    console.log("SEM USER → REDIRECT LOGIN");
    return <Navigate to="/" replace />;
  }

  console.log("USER OK → RENDER PAGE");

  return children;
}

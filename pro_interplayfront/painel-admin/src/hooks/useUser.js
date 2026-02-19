// hooks/useUser.js
import { useAuth } from "../contexts/AuthContext";

export default function useUser() {
  const { user, loading } = useAuth();

  return { user, loading };
}

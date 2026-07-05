import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }: { children: ReactElement }): ReactElement {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

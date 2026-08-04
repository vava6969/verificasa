import { Navigate, useSearchParams } from "react-router-dom";

export default function Register() {
  return <Navigate to="/login?mode=register" replace />;
}
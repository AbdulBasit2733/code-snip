import React, { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface CheckAuthProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const CheckAuth: React.FC<CheckAuthProps> = ({ children, isAuthenticated }) => {
  const location = useLocation();

  const isLoginRoute =
    location.pathname === "/auth/login" ||
    location.pathname === "/auth/register";

  if (!isAuthenticated && !isLoginRoute) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isAuthenticated && isLoginRoute) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default CheckAuth;

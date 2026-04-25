import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import useAdminAuth from "../context/AdminAuthContext";

export const SW = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
);

export const PermissionRoute = ({ permission, children }) => {
  const { hasPermission, isLoading, isSuperAdmin } = useAdminAuth();
  if (isLoading) return null;
  if (isSuperAdmin) return children;
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export const SuperAdminRoute = ({ children }) => {
  const { isSuperAdmin, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

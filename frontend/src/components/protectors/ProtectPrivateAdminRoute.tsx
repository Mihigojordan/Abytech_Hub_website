import React, { type ReactNode } from 'react';
import { Navigate, useLocation} from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAdminAuth from '../../context/AdminAuthContext';
import LoadingScreen from '../LoadingScreen';

interface ProtectPrivateAdminRouteProps {
  children: ReactNode;
}

const ProtectPrivateAdminRoute: React.FC<ProtectPrivateAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLocked, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the current location as state
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
  }

  if (isLocked) {
    // Redirect to unlock screen with the current location as state
    return <Navigate to="/auth/admin/unlock" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectPrivateAdminRoute;

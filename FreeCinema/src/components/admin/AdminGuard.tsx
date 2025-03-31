
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
};

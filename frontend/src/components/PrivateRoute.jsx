import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected component
  return children;
};

export default PrivateRoute;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import JobsPage from './pages/JobsPage.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes with Layout */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <PrivateRoute>
                  <Layout>
                    <JobsPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

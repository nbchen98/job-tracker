import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api/jobs.js';
import AddJobModal from '../components/AddJobModal.jsx';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  // Load jobs on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await jobsAPI.getAll();
      setJobs(jobsData);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        setError('Failed to load jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalJobs = jobs.length;
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  // Get recent applications (last 5)
  const recentJobs = jobs
    .sort((a, b) => new Date(b.date_applied || b.created_at) - new Date(a.date_applied || a.created_at))
    .slice(0, 5);

  // Handle job added from modal
  const handleJobAdded = () => {
    loadJobs(); // Refresh the jobs data
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied': return '📝';
      case 'interviewing': return '🎯';
      case 'offered': return '🎉';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0 space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to your Applymate!
            </h1>
          </div>
          
          <div className="mb-6">
            <p className="text-lg text-gray-600">
              Hi, <span className="font-semibold text-gray-900">{user?.email}</span>!
            </p>
            <p className="text-gray-500 mt-2">
              Here's an overview of your job application progress.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Jobs */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{totalJobs}</p>
              </div>
            </div>
          </div>

          {/* Applied */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📝</span>
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-500">Applied</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.applied || 0}</p>
              </div>
            </div>
          </div>

          {/* Interviewing */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">🎯</span>
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-500">Interviewing</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.interviewing || 0}</p>
              </div>
            </div>
          </div>

          {/* Offered */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">🎉</span>
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-500">Offered</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.offered || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown and Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <Link
                to="/jobs"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      {job.date_applied && (
                        <p className="text-xs text-gray-500">
                          Applied: {new Date(job.date_applied).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No applications yet</p>
              )}
            </div>
          </div>
          {/* Status Breakdown */}
          <div className="bg-white shadow rounded-lg p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Status</h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getStatusIcon(status)}</span>
                    <span className="capitalize text-gray-700">{status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900 mr-2">{count}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              ))}
              {totalJobs === 0 && (
                <p className="text-gray-500 text-center py-4">No applications yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowAddJobModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-md transition duration-200 text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold">Add New Job</h4>
              <p className="text-blue-100 text-sm">Track a new application</p>
            </button>
            
            <Link
              to="/jobs"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg shadow-md transition duration-200 text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold">Manage Jobs</h4>
              <p className="text-green-100 text-sm">View and edit applications</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        onJobAdded={handleJobAdded}
      />
    </div>
  );
};

export default DashboardPage;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { jobsAPI } from '../api/jobs.js';
import AddJobModal from '../components/AddJobModal.jsx';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_applied');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { logout } = useAuth();


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
      if (error.response?.status === 401) { //if the user is not authenticated, logout
        logout();
      } else { //if the user is authenticated, but the request failed, set the error
        setError('Failed to load jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => { //handle edit for the form
    setEditingJob(job);
    setShowAddJobModal(true);
  };

  const handleDelete = async (jobId) => { //handle delete for the form
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.delete(jobId);
        loadJobs(); // Reload the jobs list
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
        } else {
          setError('Failed to delete job');
        }
      }
    }
  };

  const getStatusColor = (status) => { //return CSS classes for the status
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort jobs
  const getFilteredAndSortedJobs = () => {
    let filteredJobs = [...jobs];

    // Search filter
    if (searchTerm) {
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.notes && job.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filteredJobs = filteredJobs.filter(job => {
            const jobDate = new Date(job.date_applied);
            return jobDate >= filterDate;
          });
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filteredJobs = filteredJobs.filter(job => {
            const jobDate = new Date(job.date_applied);
            return jobDate >= filterDate;
          });
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filteredJobs = filteredJobs.filter(job => {
            const jobDate = new Date(job.date_applied);
            return jobDate >= filterDate;
          });
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          filteredJobs = filteredJobs.filter(job => {
            const jobDate = new Date(job.date_applied);
            return jobDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }

    // Sort jobs
    filteredJobs.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date_applied':
          aValue = new Date(a.date_applied || a.created_at || 0);
          bValue = new Date(b.date_applied || b.created_at || 0);
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortBy === 'date_applied') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      } else {
        if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      }
    });

    return filteredJobs;
  };

  const filteredJobs = getFilteredAndSortedJobs();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('date_applied');
    setSortOrder('desc');
  };

  // Handle job added from modal
  const handleJobAdded = () => {
    loadJobs(); // Refresh the jobs data
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAddJobModal(false);
    setEditingJob(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Job Applications</h1>
          <button
            onClick={() => setShowAddJobModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Add New Job
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, company, notes, or tags..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date_applied">Date Applied</option>
                  <option value="company">Company</option>
                  <option value="title">Job Title</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Summary and Clear Button */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                <span className="ml-2 text-blue-600">
                  (filtered)
                </span>
              )}
            </div>
            {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}


        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your job applications by adding your first job.</p>
            <button
              onClick={() => setShowAddJobModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Add Your First Job
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs match your filters</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or clear the filters.</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <li key={job.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between text-left">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            {job.date_applied && (
                              <p className="text-sm text-gray-500">
                                Applied: {new Date(job.date_applied).toLocaleDateString()}
                              </p>
                            )}
                            <div className="mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                            </div>
                            {job.link && (
                              <div className="mt-1">
                                <a
                                  href={job.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                  View Job Posting →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      
                      
                      {job.notes && (
                        <p className="text-sm text-gray-600 mt-1 text-left">{job.notes}</p>
                      )}
                      
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add/Edit Job Modal */}
      <AddJobModal
        isOpen={showAddJobModal}
        onClose={handleModalClose}
        onJobAdded={handleJobAdded}
        editingJob={editingJob}
      />
    </div>
  );
};

export default JobsPage;

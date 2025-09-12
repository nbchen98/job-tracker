import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { jobsAPI } from '../api/jobs.js';

const AddJobModal = ({ isOpen, onClose, onJobAdded, editingJob = null }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state for adding/editing jobs
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    link: '',
    status: 'applied',
    date_applied: '',
    notes: '',
    tags: ''
  });

  // Update form data when editingJob changes
  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || '',
        company: editingJob.company || '',
        link: editingJob.link || '',
        status: editingJob.status || 'applied',
        date_applied: editingJob.date_applied ? editingJob.date_applied.split('T')[0] : '',
        notes: editingJob.notes || '',
        tags: editingJob.tags ? editingJob.tags.join(', ') : ''
      });
    } else {
      // Reset form for new job
      setFormData({
        title: '',
        company: '',
        link: '',
        status: 'applied',
        date_applied: '',
        notes: '',
        tags: ''
      });
    }
  }, [editingJob]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      link: '',
      status: 'applied',
      date_applied: '',
      notes: '',
      tags: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      // Convert tags string to array
      const jobData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      if (editingJob) {
        // Update existing job
        await jobsAPI.update(editingJob.id, jobData);
      } else {
        // Create new job
        await jobsAPI.create(jobData);
      }
      
      resetForm();
      onJobAdded(); // Callback to refresh data
      onClose(); // Close modal
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        setError(editingJob ? 'Failed to update job' : 'Failed to add job');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingJob ? 'Edit Job' : 'Add New Job'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tech Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Applied
                </label>
                <input
                  type="date"
                  name="date_applied"
                  value={formData.date_applied}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="react, frontend, remote (comma separated)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (editingJob ? 'Updating...' : 'Adding...') 
                  : (editingJob ? 'Update Job' : 'Add Job')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJobModal;

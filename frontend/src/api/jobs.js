import api from './axios.js';

// Jobs API functions
export const jobsAPI = {
  // Get all jobs
  getAll: async () => {
    const response = await api.get('/api/jobs');
    return response.data;
  },

  // Get a single job by ID
  getById: async (id) => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },

  // Create a new job
  create: async (jobData) => {
    const response = await api.post('/api/jobs', jobData);
    return response.data;
  },

  // Update a job
  update: async (id, jobData) => {
    const response = await api.put(`/api/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete a job
  delete: async (id) => {
    const response = await api.delete(`/api/jobs/${id}`);
    return response.data;
  },
};

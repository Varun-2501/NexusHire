import axios from 'axios';

// In dev, Vite proxy forwards /api → localhost:3001
// So we use relative URLs — no CORS issue at all
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://nexushire-zo1f.onrender.com',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Log every request/response for easy debugging
api.interceptors.request.use(req => {
  console.log(`[API] ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`);
  return req;
});

api.interceptors.response.use(
  res => res,
  err => {
    console.error('[API Error]', err.response?.status, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password }).then(r => r.data);

// Jobs
export const fetchJobs = (params = {}) =>
  api.get('/api/jobs', { params }).then(r => r.data);

// Resume
export const getResume = (email) =>
  api.get('/api/resume', { params: { email } }).then(r => r.data);

export const uploadResume = (email, file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const res = await api.post('/api/resume', {
          email,
          filename: file.name,
          content: base64,
          mimeType: file.type,
        });
        resolve(res.data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

// Applications
export const getApplications = (email) =>
  api.get('/api/applications', { params: { email } }).then(r => r.data);

export const createApplication = (email, job, status = 'applied') =>
  api.post('/api/applications', { email, job, status }).then(r => r.data);

export const updateApplication = (id, email, status, note) =>
  api.put(`/api/applications/${id}`, { email, status, note }).then(r => r.data);

// AI Assistant
export const sendMessage = (message, history = []) =>
  api.post('/api/assistant', { message, history }).then(r => r.data);

export default api;

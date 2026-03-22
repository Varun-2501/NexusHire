import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const JobContext = createContext(null);

const DEFAULT_FILTERS = {
  title: '', skills: [], jobType: 'all',
  workMode: 'all', datePosted: 'any', matchScore: 'all', location: '',
};

export function JobProvider({ children }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [bestMatches, setBestMatches] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const filtersRef = useRef(DEFAULT_FILTERS);
  const userRef = useRef(user);
  const pollRef = useRef(null);

  useEffect(() => { userRef.current = user; }, [user]);

  const fetchJobs = useCallback(async (overrideFilters, silent = false) => {
    const f = overrideFilters || filtersRef.current;
    const u = userRef.current;

    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.title)                               params.set('title',      f.title);
      if (f.skills?.length)                      params.set('skills',     f.skills.join(','));
      if (f.jobType    && f.jobType    !== 'all') params.set('jobType',    f.jobType);
      if (f.workMode   && f.workMode   !== 'all') params.set('workMode',   f.workMode);
      if (f.location)                            params.set('location',   f.location);
      if (f.datePosted && f.datePosted !== 'any') params.set('datePosted', f.datePosted);
      if (f.matchScore && f.matchScore !== 'all') params.set('matchScore', f.matchScore);
      if (u?.email)                              params.set('email',      u.email);

      const BASE = import.meta.env.VITE_API_URL || 'https://nexushire-zo1f.onrender.com';
      const res = await fetch(`${BASE}/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setJobs(data.jobs || []);
      setBestMatches(data.bestMatches || []);
      setTotal(data.total || 0);
      return data;
    } catch (err) {
      console.error('[Jobs] Error:', err.message);
      if (!silent) toast.error('Failed to load jobs — is the backend running on port 3001?');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Poll silently after first load to pick up AI scores from background
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    let count = 0;
    pollRef.current = setInterval(async () => {
      count++;
      if (count >= 4) {               // stop after 4 polls (~20s)
        clearInterval(pollRef.current);
        return;
      }
      await fetchJobs(undefined, true); // silent = no loading spinner
    }, 5000); // every 5s
  }, [fetchJobs]);

  const loadJobs = useCallback(async (overrideFilters) => {
    await fetchJobs(overrideFilters);
    // If user has resume, poll for AI scores filling in
    if (userRef.current?.hasResume) startPolling();
  }, [fetchJobs, startPolling]);

  // Load once on mount
  useEffect(() => {
    loadJobs();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []); // eslint-disable-line

  const updateFilters = useCallback((updates) => {
    setFilters(prev => {
      const next = { ...prev, ...updates };
      filtersRef.current = next;
      loadJobs(next);
      return next;
    });
  }, [loadJobs]);

  const applyAIFilters = useCallback((filterUpdates) => {
    if (!filterUpdates) return;
    if (filterUpdates.clear) {
      filtersRef.current = DEFAULT_FILTERS;
      setFilters(DEFAULT_FILTERS);
      loadJobs(DEFAULT_FILTERS);
      toast.success('All filters cleared!');
      return;
    }
    const mapped = {};
    if (filterUpdates.workMode)  mapped.workMode   = filterUpdates.workMode;
    if (filterUpdates.jobType)   mapped.jobType    = filterUpdates.jobType;
    if (filterUpdates.datePosted)mapped.datePosted  = filterUpdates.datePosted;
    if (filterUpdates.matchScore)mapped.matchScore  = filterUpdates.matchScore;
    if (filterUpdates.location)  mapped.location    = filterUpdates.location;
    if (filterUpdates.title)     mapped.title       = filterUpdates.title;
    if (filterUpdates.skills)    mapped.skills      = Array.isArray(filterUpdates.skills)
      ? filterUpdates.skills : [filterUpdates.skills];

    setFilters(prev => {
      const next = { ...prev, ...mapped };
      filtersRef.current = next;
      loadJobs(next);
      return next;
    });
    toast.success('Filters updated by AI!', { icon: '🤖' });
  }, [loadJobs]);

  const resetFilters = useCallback(() => {
    filtersRef.current = DEFAULT_FILTERS;
    setFilters(DEFAULT_FILTERS);
    loadJobs(DEFAULT_FILTERS);
  }, [loadJobs]);

  return (
    <JobContext.Provider value={{
      jobs, bestMatches, filters, loading, total,
      updateFilters, applyAIFilters, resetFilters, loadJobs,
    }}>
      {children}
    </JobContext.Provider>
  );
}

export const useJobs = () => useContext(JobContext);

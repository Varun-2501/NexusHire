// In-memory store — simple, fast, no DB needed
export const store = {
  users: {
    'test@gmail.com': {
      email: 'test@gmail.com',
      password: 'test@123',
      name: 'Alex Johnson',
      resume: null, // { text, filename, uploadedAt }
    }
  },
  applications: {}, // keyed by email -> array of applications
  matchScoreCache: {}, // cache: `${email}-${jobId}` -> { score, explanation }
};

export const getUser = (email) => store.users[email] || null;

export const updateUserResume = (email, resumeData) => {
  if (store.users[email]) {
    store.users[email].resume = resumeData;
  }
};

export const getApplications = (email) => store.applications[email] || [];

export const addApplication = (email, application) => {
  if (!store.applications[email]) store.applications[email] = [];
  store.applications[email].push(application);
};

export const updateApplication = (email, appId, updates) => {
  if (!store.applications[email]) return null;
  const idx = store.applications[email].findIndex(a => a.id === appId);
  if (idx === -1) return null;
  store.applications[email][idx] = { ...store.applications[email][idx], ...updates };
  return store.applications[email][idx];
};

export const getMatchCache = (key) => store.matchScoreCache[key] || null;
export const setMatchCache = (key, value) => { store.matchScoreCache[key] = value; };

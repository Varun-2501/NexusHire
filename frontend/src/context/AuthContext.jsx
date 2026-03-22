import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const API_BASE = '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexushire_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Check if this user already completed onboarding (stored in localStorage)
      const existing = (() => {
        try { return JSON.parse(localStorage.getItem('nexushire_user')); } catch { return null; }
      })();

      // Merge server data with any saved profile (fullName, dob, etc.)
      const userData = {
        ...data.user,
        email,
        // Preserve profile fields if already filled
        ...(existing?.email === email ? {
          fullName: existing.fullName,
          dob: existing.dob,
          gender: existing.gender,
          phone: existing.phone,
          college: existing.college,
          degree: existing.degree,
          graduationYear: existing.graduationYear,
        } : {}),
      };

      setUser(userData);
      localStorage.setItem('nexushire_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('nexushire_user');
    toast.success('Logged out');
  }, []);

  // Called after onboarding form submit
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('nexushire_user', JSON.stringify(updated));
      return updated;  // this triggers re-render → App.jsx sees fullName → redirects to /
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

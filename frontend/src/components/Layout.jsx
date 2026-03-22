import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Zap, Briefcase, LayoutDashboard, LogOut, Upload, CheckCircle, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ResumeUpload from './Resume/ResumeUpload.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [showResume, setShowResume] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', icon: Briefcase, label: 'Jobs' },
    { to: '/applications', icon: LayoutDashboard, label: 'Applications' },
  ];

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-40 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.25), rgba(167,139,250,0.25))', border: '1px solid rgba(45,212,191,0.3)' }}>
                <Zap size={16} className="text-teal-400" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">NexusHire</span>
            </div>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-teal-400'
                        : 'hover:text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(45,212,191,0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(45,212,191,0.2)' : '1px solid transparent',
                    color: isActive ? '#2DD4BF' : 'var(--text-secondary)',
                  })}>
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #2DD4BF, #A78BFA)', color: '#050508' }}>
                  {(user?.fullName || user?.name)?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{user?.fullName || user?.name}</div>
                  <div className="text-xs flex items-center gap-1" style={{ color: user?.hasResume ? '#2DD4BF' : 'var(--text-muted)' }}>
                    {user?.hasResume ? <><CheckCircle size={10} /> Resume uploaded</> : 'No resume'}
                  </div>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden"
                    style={{ background: '#12121C', border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.fullName || user?.name}</div>
                      <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
                      {user?.college && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>🎓 {user.college}</div>}
                      {user?.gender && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>· {user.gender}{user?.graduationYear ? ` · ${user.graduationYear}` : ''}</div>}
                    </div>
                    <button onClick={() => { setShowResume(true); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left hover:bg-white/5"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Upload size={14} />
                      {user?.hasResume ? 'Update Resume' : 'Upload Resume'}
                    </button>
                    <button onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left hover:bg-white/5"
                      style={{ color: '#F87171', borderTop: '1px solid var(--border)' }}>
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-lg animate-fsu">
            <button onClick={() => setShowResume(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors"
              style={{ background: '#12121C', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <X size={14} />
            </button>
            <ResumeUpload onSuccess={() => setShowResume(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

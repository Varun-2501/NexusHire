import { useState, useEffect, useCallback } from 'react';
import { getApplications } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ApplicationCard from './ApplicationCard.jsx';
import { LayoutDashboard, CheckCircle, Clock, Trophy, XCircle, Inbox } from 'lucide-react';

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];

const statusConfig = {
  applied: { label: 'Applied', icon: CheckCircle, color: '#60A5FA', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  interview: { label: 'Interview', icon: Clock, color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  offer: { label: 'Offer', icon: Trophy, color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.2)' },
  rejected: { label: 'Rejected', icon: XCircle, color: '#F87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const load = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await getApplications(user.email);
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = useCallback((updated) => {
    setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
  }, []);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length;
    return acc;
  }, {});

  const filtered = activeFilter === 'all'
    ? applications
    : applications.filter(a => a.status === activeFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}>
          <LayoutDashboard size={18} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Applications
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Track your job application pipeline
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUSES.map(s => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => setActiveFilter(activeFilter === s ? 'all' : s)}
              className="glass rounded-2xl p-4 text-left transition-all"
              style={{
                border: activeFilter === s ? `1px solid ${cfg.border}` : '1px solid var(--border)',
                background: activeFilter === s ? cfg.bg : undefined,
              }}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={16} style={{ color: cfg.color }} />
                <span className="font-display text-xl font-bold" style={{ color: cfg.color }}>
                  {counts[s] || 0}
                </span>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setActiveFilter('all')}
          className={`chip px-4 py-2 rounded-xl text-sm ${activeFilter === 'all' ? 'active' : ''}`}>
          All ({applications.length})
        </button>
        {STATUSES.map(s => (
          counts[s] > 0 && (
            <button key={s} onClick={() => setActiveFilter(s)}
              className={`chip px-4 py-2 rounded-xl text-sm ${activeFilter === s ? 'active' : ''}`}>
              {statusConfig[s].label} ({counts[s]})
            </button>
          )
        ))}
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 space-y-3 h-32 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Inbox size={36} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="font-display text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {applications.length === 0 ? 'No applications yet' : `No ${activeFilter} applications`}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {applications.length === 0
              ? 'Apply to jobs and track your progress here'
              : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <ApplicationCard key={app.id} application={app} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

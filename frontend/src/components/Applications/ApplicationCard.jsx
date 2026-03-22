import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ChevronUp, CheckCircle, Clock, Trophy, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { updateApplication } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];

const statusConfig = {
  applied: { label: 'Applied', icon: CheckCircle, cls: 'status-applied' },
  interview: { label: 'Interview', icon: Clock, cls: 'status-interview' },
  offer: { label: 'Offer', icon: Trophy, cls: 'status-offer' },
  rejected: { label: 'Rejected', icon: XCircle, cls: 'status-rejected' },
};

const statusColors = {
  applied: '#60A5FA',
  interview: '#A78BFA',
  offer: '#2DD4BF',
  rejected: '#F87171',
};

export default function ApplicationCard({ application, onUpdate }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { job, status, appliedAt, timeline } = application;
  const cfg = statusConfig[status] || statusConfig.applied;
  const Icon = cfg.icon;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      const updated = await updateApplication(application.id, user.email, newStatus);
      onUpdate?.(updated.application);
      toast.success(`Status updated to ${newStatus}`, { icon: '✅' });
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}>

      {/* Status bar */}
      <div className="h-0.5 w-full" style={{ background: statusColors[status] }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {job.title}
              </h3>
              <span className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
                <Icon size={10} />{cfg.label}
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{job.company}</div>
            <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              {job.location && <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>}
              <span>Applied {formatDistanceToNow(new Date(appliedAt), { addSuffix: true })}</span>
            </div>
          </div>

          {job.matchScore != null && (
            <div className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium flex-shrink-0 ${
              job.matchScore > 70 ? 'badge-high' : job.matchScore >= 40 ? 'badge-medium' : 'badge-low'
            }`}>
              {job.matchScore}%
            </div>
          )}
        </div>

        {/* Status changer */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Status:</span>
          {STATUSES.map(s => {
            const c = statusConfig[s];
            const isActive = s === status;
            return (
              <button key={s} onClick={() => handleStatusChange(s)} disabled={updating}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${isActive ? c.cls : 'chip'}`}>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Expand timeline */}
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mt-4 text-xs transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide' : 'Show'} timeline
        </button>

        <AnimatePresence>
          {expanded && timeline?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}>
              <div className="space-y-3">
                {timeline.map((entry, i) => {
                  const ec = statusConfig[entry.status] || statusConfig.applied;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${statusColors[entry.status]}20`, border: `1px solid ${statusColors[entry.status]}40` }}>
                          <ec.icon size={11} style={{ color: statusColors[entry.status] }} />
                        </div>
                        {i < timeline.length - 1 && (
                          <div className="w-px flex-1 mt-1" style={{ background: 'var(--border)' }} />
                        )}
                      </div>
                      <div className="pb-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ec.label}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{entry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

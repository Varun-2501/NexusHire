import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, X, ExternalLink } from 'lucide-react';
import { createApplication } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function ApplyPopup({ job, onClose }) {
  const { user } = useAuth();

  const handleChoice = async (choice) => {
    if (choice === 'yes' || choice === 'earlier') {
      try {
        await createApplication(user.email, job, 'applied');
        toast.success(`Application tracked for ${job.title}!`, { icon: '🎯' });
      } catch (err) {
        if (err.response?.status === 409) {
          toast('Already tracked!', { icon: 'ℹ️' });
        } else {
          toast.error('Failed to track application');
        }
      }
    }
    onClose(choice);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(5,5,8,0.7)', backdropFilter: 'blur(6px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass-bright rounded-2xl p-6 w-full max-w-md"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="text-xs font-medium mb-1" style={{ color: '#2DD4BF' }}>Application Tracker</div>
              <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Did you apply to <span style={{ color: '#2DD4BF' }}>{job.title}</span>?
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>at {job.company}</p>
            </div>
            <button onClick={() => onClose('dismiss')}
              className="w-7 h-7 rounded-lg flex items-center justify-center ml-3 transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            <button onClick={() => handleChoice('yes')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all group"
              style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,212,191,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(45,212,191,0.08)'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(45,212,191,0.15)' }}>
                <CheckCircle size={16} className="text-teal-400" />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: '#2DD4BF' }}>Yes, I applied!</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Save this as Applied with today's date</div>
              </div>
            </button>

            <button onClick={() => handleChoice('earlier')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
              style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(167,139,250,0.06)'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(167,139,250,0.12)' }}>
                <Clock size={16} style={{ color: '#A78BFA' }} />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: '#A78BFA' }}>Applied Earlier</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Track an application you submitted before</div>
              </div>
            </button>

            <button onClick={() => handleChoice('no')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <ExternalLink size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No, just browsing</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Don't track this visit</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

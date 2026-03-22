import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Briefcase, ExternalLink, ChevronDown, ChevronUp, Zap, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ApplyPopup from './ApplyPopup.jsx';

const workModeColors = {
  remote: { bg: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: 'rgba(45,212,191,0.25)' },
  hybrid: { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.25)' },
  'on-site': { bg: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: 'rgba(251,191,36,0.25)' },
};

const jobTypeColors = {
  'full-time': { bg: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: 'rgba(59,130,246,0.2)' },
  'part-time': { bg: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: 'rgba(251,191,36,0.2)' },
  contract: { bg: 'rgba(239,68,68,0.1)', color: '#F87171', border: 'rgba(239,68,68,0.2)' },
  internship: { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.2)' },
};

function MatchBadge({ score }) {
  if (score === null || score === undefined) return null;
  const isHigh = score > 70;
  const isMed = score >= 40;
  const cls = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';
  const emoji = isHigh ? '🟢' : isMed ? '🟡' : '⚪';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-mono ${cls}`}>
      <span style={{ fontSize: '10px' }}>{emoji}</span>
      {score}% match
    </div>
  );
}

export default function JobCard({ job, isBestMatch }) {
  const [expanded, setExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { workMode, type } = job;

  const wmStyle = workModeColors[workMode] || workModeColors.remote;
  const jtStyle = jobTypeColors[type] || jobTypeColors['full-time'];

  const handleApply = () => {
    window.open(job.applyUrl, '_blank');
    setTimeout(() => setShowPopup(true), 1500);
  };

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(job.postedAt), { addSuffix: true }); }
    catch { return 'Recently'; }
  })();

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-2xl overflow-hidden transition-all"
        style={{
          border: isBestMatch ? '1px solid rgba(45,212,191,0.25)' : '1px solid var(--border)',
          boxShadow: isBestMatch ? '0 4px 24px rgba(45,212,191,0.08)' : 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = isBestMatch ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = isBestMatch ? 'rgba(45,212,191,0.25)' : 'var(--border)'}>

        {isBestMatch && (
          <div className="px-4 py-1.5 flex items-center gap-1.5 text-xs"
            style={{ background: 'rgba(45,212,191,0.08)', borderBottom: '1px solid rgba(45,212,191,0.15)', color: '#2DD4BF' }}>
            <Zap size={11} />
            Best Match
          </div>
        )}

        <div className="p-5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-display text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {job.title}
                </h3>
                <MatchBadge score={job.matchScore} />
              </div>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Building2 size={13} />
                <span className="font-medium">{job.company}</span>
              </div>
            </div>

            {/* Logo placeholder */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {job.company?.charAt(0)}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <MapPin size={11} /> {job.location}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={11} /> {timeAgo}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full"
              style={{ background: wmStyle.bg, color: wmStyle.color, border: `1px solid ${wmStyle.border}` }}>
              {workMode}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full"
              style={{ background: jtStyle.bg, color: jtStyle.color, border: `1px solid ${jtStyle.border}` }}>
              {type}
            </span>
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills.slice(0, 5).map(s => (
                <span key={s} className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {s}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  +{job.skills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Expand / Match details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden">
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {job.description}
                  </p>
                  {job.matchDetails && (
                    <div className="mt-4 rounded-xl p-4 space-y-2"
                      style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)' }}>
                      <div className="text-xs font-semibold" style={{ color: '#2DD4BF' }}>AI Match Analysis</div>
                      {job.matchDetails.matchingSkills?.length > 0 && (
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Matching skills: </span>
                          {job.matchDetails.matchingSkills.join(', ')}
                        </div>
                      )}
                      {job.matchDetails.relevantExperience && (
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Experience: </span>
                          {job.matchDetails.relevantExperience}
                        </div>
                      )}
                      {job.matchDetails.keywordsAlignment && (
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Keywords: </span>
                          {job.matchDetails.keywordsAlignment}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action row */}
          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              {expanded ? <><ChevronUp size={13} /> Less</> : <><ChevronDown size={13} /> Details{job.matchDetails ? ' & AI Analysis' : ''}</>}
            </button>

            <button onClick={handleApply}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(45,212,191,0.85), rgba(45,212,191,0.65))',
                color: '#050508',
                boxShadow: '0 4px 12px rgba(45,212,191,0.2)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,212,191,0.35)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,212,191,0.2)'}>
              Apply <ExternalLink size={11} />
            </button>
          </div>
        </div>
      </motion.div>

      {showPopup && <ApplyPopup job={job} onClose={() => setShowPopup(false)} />}
    </>
  );
}

import { useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useJobs } from '../../context/JobContext.jsx';

const SKILLS_OPTIONS = ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'GraphQL', 'Vue.js', 'Go', 'Java', 'PostgreSQL', 'MongoDB', 'Kubernetes', 'Next.js', 'FastAPI', 'PyTorch', 'TensorFlow', 'Flutter'];

const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const WORK_MODES = [
  { value: 'all', label: 'All Modes' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
];

const DATE_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: '24h', label: 'Last 24h' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
];

const MATCH_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: '🟢 High (>70%)' },
  { value: 'medium', label: '🟡 Medium (40-70%)' },
];

export default function FilterPanel() {
  const { filters, updateFilters, resetFilters } = useJobs();
  const [showSkills, setShowSkills] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const hasActiveFilters =
    filters.title || filters.skills?.length > 0 ||
    filters.jobType !== 'all' || filters.workMode !== 'all' ||
    filters.datePosted !== 'any' || filters.matchScore !== 'all' || filters.location;

  const toggleSkill = (skill) => {
    const current = filters.skills || [];
    const next = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    updateFilters({ skills: next });
  };

  const addCustomSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      toggleSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} style={{ color: '#2DD4BF' }} />
          <span className="font-display text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</span>
          {hasActiveFilters && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.3)' }}>
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs flex items-center gap-1 transition-colors hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}>
            <X size={12} /> Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Role / Title</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={filters.title}
            onChange={e => updateFilters({ title: e.target.value })}
            placeholder="e.g. React Developer"
            className="input-dark w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
          {filters.title && (
            <button onClick={() => updateFilters({ title: '' })} className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Location</label>
        <input
          type="text"
          value={filters.location}
          onChange={e => updateFilters({ location: e.target.value })}
          placeholder="City or region"
          className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
        />
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Job Type</label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map(opt => (
            <button key={opt.value} onClick={() => updateFilters({ jobType: opt.value })}
              className={`chip px-3 py-1.5 rounded-lg text-xs ${filters.jobType === opt.value ? 'active' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Work Mode</label>
        <div className="flex flex-wrap gap-2">
          {WORK_MODES.map(opt => (
            <button key={opt.value} onClick={() => updateFilters({ workMode: opt.value })}
              className={`chip px-3 py-1.5 rounded-lg text-xs ${filters.workMode === opt.value ? 'active' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Posted */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Date Posted</label>
        <div className="flex flex-wrap gap-2">
          {DATE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => updateFilters({ datePosted: opt.value })}
              className={`chip px-3 py-1.5 rounded-lg text-xs ${filters.datePosted === opt.value ? 'active' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match Score */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Match Score</label>
        <div className="flex flex-wrap gap-2">
          {MATCH_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => updateFilters({ matchScore: opt.value })}
              className={`chip px-3 py-1.5 rounded-lg text-xs ${filters.matchScore === opt.value ? 'active' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <button onClick={() => setShowSkills(!showSkills)}
          className="flex items-center justify-between w-full text-xs font-medium mb-2"
          style={{ color: 'var(--text-secondary)' }}>
          <span>Skills {filters.skills?.length > 0 && <span style={{ color: '#2DD4BF' }}>({filters.skills.length})</span>}</span>
          {showSkills ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Selected skill tags */}
        {filters.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.skills.map(s => (
              <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full badge-high">
                {s}
                <button onClick={() => toggleSkill(s)} className="hover:opacity-70"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {showSkills && (
          <div className="space-y-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={addCustomSkill}
              placeholder="Type skill + Enter"
              className="input-dark w-full rounded-xl px-3 py-2 text-xs"
            />
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {SKILLS_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleSkill(s)}
                  className={`chip px-2.5 py-1 rounded-full text-xs ${filters.skills?.includes(s) ? 'active' : ''}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

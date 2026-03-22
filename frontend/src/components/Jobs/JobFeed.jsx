import { useJobs } from '../../context/JobContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import JobCard from './JobCard.jsx';
import FilterPanel from './FilterPanel.jsx';
import { Sparkles, Briefcase, Upload, RefreshCw } from 'lucide-react';

function Skeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-lg shimmer w-3/4" />
          <div className="h-3 rounded-lg shimmer w-1/2" />
        </div>
        <div className="w-10 h-10 rounded-xl shimmer flex-shrink-0" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full shimmer" />
        <div className="h-5 w-20 rounded-full shimmer" />
        <div className="h-5 w-14 rounded-full shimmer" />
      </div>
      <div className="flex gap-1.5">
        {[60, 80, 70, 55].map(w => (
          <div key={w} className="h-5 rounded-full shimmer" style={{ width: w + 'px' }} />
        ))}
      </div>
    </div>
  );
}

export default function JobFeed() {
  const { jobs, bestMatches, loading, total, loadJobs } = useJobs();
  const { user } = useAuth();

  const hasResume = user?.hasResume;

  return (
    <div className="flex gap-6">
      {/* Sidebar filters — sticky */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24">
          <FilterPanel />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* No resume banner */}
        {!hasResume && (
          <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(167,139,250,0.15)' }}>
              <Upload size={16} style={{ color: '#A78BFA' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: '#A78BFA' }}>Upload your resume to enable AI matching</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Get personalized match scores on every job — click your avatar in the top right
              </div>
            </div>
          </div>
        )}

        {/* Best Matches section */}
        {bestMatches.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.25)' }}>
                  <Sparkles size={14} className="text-teal-400" />
                </div>
                <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Best Matches
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full badge-high">{bestMatches.length} jobs</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {bestMatches.map(job => (
                <JobCard key={`bm-${job.id}`} job={job} isBestMatch />
              ))}
            </div>
          </section>
        )}

        {/* All Jobs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                <Briefcase size={14} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                All Jobs
              </h2>
              {!loading && (
                <span className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {total} results
                </span>
              )}
            </div>
            <button onClick={() => loadJobs()} disabled={loading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4">
            <FilterPanel />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Briefcase size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-display text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No jobs found</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or use the AI assistant</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { fetchJobs } from '../services/jobService.js';
import { getUser } from '../store/index.js';
import { getMatchCache, setMatchCache } from '../store/index.js';

// Simple keyword scorer — instant, no API
function keywordMatch(resume, job) {
  const r = resume.toLowerCase();
  const matched = (job.skills || []).filter(s => r.includes(s.toLowerCase()));
  const total = job.skills?.length || 1;
  const score = Math.min(70, Math.round((matched.length / total) * 60 + 10));
  return {
    score,
    matchingSkills: matched,
    summary: `${matched.length}/${total} skills matched`,
    relevantExperience: 'Keyword analysis',
    keywordsAlignment: `${matched.length} skills found`,
  };
}

export default async function jobRoutes(fastify) {
  fastify.get('/api/jobs', async (req, reply) => {
    try {
      const { title, skills, jobType, workMode, location, datePosted, matchScore, email } = req.query;

      const filters = {
        title: title || '',
        skills: skills ? skills.split(',').filter(Boolean) : [],
        jobType: jobType || 'all',
        workMode: workMode || 'all',
        location: location || '',
        datePosted: datePosted || 'any',
      };

      let jobs = await fetchJobs(filters);

      if (email) {
        const user = getUser(email);
        const resume = user?.resume?.text;
        const resumeKey = resume ? resume.substring(0, 60).replace(/\s+/g, '_') : null;

        if (resume && resumeKey) {
          // Step 1: Apply cached scores instantly (zero wait)
          jobs = jobs.map(job => {
            const hit = getMatchCache(`${resumeKey}-${job.id}`);
            if (hit) return { ...job, matchScore: hit.score, matchDetails: hit };
            // Instant keyword score for uncached
            const km = keywordMatch(resume, job);
            return { ...job, matchScore: km.score, matchDetails: km };
          });

          // Step 2: Trigger AI scoring in background (don't await — response goes out now)
          const uncached = jobs.filter(j => !getMatchCache(`${resumeKey}-${j.id}`));
          if (uncached.length > 0) {
            import('../services/matchingService.js').then(({ batchScoreJobs }) => {
              batchScoreJobs(resume, uncached).catch(() => {});
            }).catch(() => {});
          }

        } else {
          jobs = jobs.map(j => ({ ...j, matchScore: null, matchDetails: null }));
        }
      } else {
        jobs = jobs.map(j => ({ ...j, matchScore: null, matchDetails: null }));
      }

      // Filter by match score
      if (matchScore === 'high') {
        jobs = jobs.filter(j => j.matchScore !== null && j.matchScore > 70);
      } else if (matchScore === 'medium') {
        jobs = jobs.filter(j => j.matchScore !== null && j.matchScore >= 40);
      }

      // Sort by score then date
      jobs.sort((a, b) => {
        if (a.matchScore !== null && b.matchScore !== null) return b.matchScore - a.matchScore;
        if (a.matchScore !== null) return -1;
        if (b.matchScore !== null) return 1;
        return new Date(b.postedAt) - new Date(a.postedAt);
      });

      const bestMatches = jobs.filter(j => j.matchScore !== null && j.matchScore > 70).slice(0, 8);

      return { jobs, bestMatches, total: jobs.length };
    } catch (err) {
      console.error('[Jobs] Error:', err.message);
      return reply.status(500).send({ error: 'Failed to load jobs', detail: err.message });
    }
  });
}

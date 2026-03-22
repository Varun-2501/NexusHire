import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getMatchCache, setMatchCache } from '../store/index.js';

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.1-8b-instant',
  temperature: 0,
  maxTokens: 600,
});

const prompt = ChatPromptTemplate.fromMessages([
  ['system', `Score resume vs jobs. Return ONLY a JSON array, no markdown:
[{"id":"job_id","score":0-100,"skills":["matched","skills"],"summary":"one sentence"}]`],
  ['human', `RESUME:\n{resume}\n\nJOBS:\n{jobs}`],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

// Score up to 6 jobs in ONE API call
export async function batchScoreJobs(resumeText, jobs) {
  if (!resumeText || !jobs?.length) {
    return jobs.map(j => ({ ...j, matchScore: null, matchDetails: null }));
  }

  const resumeKey = resumeText.substring(0, 60).replace(/\s+/g, '_');

  // Split into cached vs needs scoring
  const cached = {};
  const toScore = [];

  for (const job of jobs) {
    const hit = getMatchCache(`${resumeKey}-${job.id}`);
    if (hit) cached[job.id] = hit;
    else toScore.push(job);
  }

  // Score only first 6 uncached — fast single call
  if (toScore.length > 0) {
    const batch = toScore.slice(0, 6);
    try {
      const jobsText = batch.map(j =>
        `ID:${j.id}|${j.title} at ${j.company}|Skills:${(j.skills||[]).join(',')}|${j.description.substring(0,150)}`
      ).join('\n');

      const raw = await chain.invoke({
        resume: resumeText.substring(0, 1200),
        jobs: jobsText,
      });

      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      for (const item of parsed) {
        const match = {
          score: Math.min(100, Math.max(0, Math.round(item.score))),
          matchingSkills: item.skills || [],
          summary: item.summary || '',
          relevantExperience: item.summary || '',
          keywordsAlignment: `${(item.skills||[]).length} skills matched`,
        };
        setMatchCache(`${resumeKey}-${item.id}`, match);
        cached[item.id] = match;
      }
    } catch (err) {
      console.error('[Match] API error:', err.message);
      // Fallback keyword match for this batch
      for (const job of batch) {
        cached[job.id] = keywordMatch(resumeText, job);
      }
    }

    // Remaining jobs beyond 6 — instant keyword match (no API wait)
    for (const job of toScore.slice(6)) {
      const km = keywordMatch(resumeText, job);
      setMatchCache(`${resumeKey}-${job.id}`, km);
      cached[job.id] = km;
    }
  }

  return jobs.map(job => {
    const m = cached[job.id];
    return m
      ? { ...job, matchScore: m.score, matchDetails: m }
      : { ...job, matchScore: null, matchDetails: null };
  });
}

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

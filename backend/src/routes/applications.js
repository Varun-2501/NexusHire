import { v4 as uuidv4 } from 'uuid';
import { getApplications, addApplication, updateApplication } from '../store/index.js';

export default async function applicationRoutes(fastify) {
  fastify.get('/api/applications', async (req, reply) => {
    const { email } = req.query;
    if (!email) return reply.status(400).send({ error: 'Email required' });
    const apps = getApplications(email);
    return { applications: apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)) };
  });

  fastify.post('/api/applications', async (req, reply) => {
    const { email, job, status } = req.body;
    if (!email || !job) return reply.status(400).send({ error: 'Email and job required' });

    const existing = getApplications(email).find(a => a.job.id === job.id);
    if (existing) return reply.status(409).send({ error: 'Already tracked', application: existing });

    const app = {
      id: uuidv4(),
      job,
      status: status || 'applied',
      appliedAt: new Date().toISOString(),
      timeline: [{ status: status || 'applied', date: new Date().toISOString(), note: 'Application submitted' }],
    };

    addApplication(email, app);
    return { success: true, application: app };
  });

  fastify.put('/api/applications/:id', async (req, reply) => {
    const { email, status, note } = req.body;
    if (!email) return reply.status(400).send({ error: 'Email required' });

    const updated = updateApplication(email, req.params.id, {
      status,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) return reply.status(404).send({ error: 'Application not found' });

    // Add to timeline
    if (!updated.timeline) updated.timeline = [];
    updated.timeline.push({ status, date: new Date().toISOString(), note: note || `Status updated to ${status}` });

    return { success: true, application: updated };
  });
}

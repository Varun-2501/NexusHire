import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import resumeRoutes from './routes/resume.js';
import applicationRoutes from './routes/applications.js';
import assistantRoutes from './routes/assistant.js';

const fastify = Fastify({
  logger: { level: 'info' },
  bodyLimit: 5 * 1024 * 1024,
});

// CORS — allow all origins in dev
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Register routes
await fastify.register(authRoutes);
await fastify.register(jobRoutes);
await fastify.register(resumeRoutes);
await fastify.register(applicationRoutes);
await fastify.register(assistantRoutes);

// Root route
fastify.get('/', async () => ({
  app: 'NexusHire API',
  status: 'ok',
  version: '1.0.0',
  endpoints: [
    'POST /api/auth/login',
    'GET  /api/jobs',
    'GET  /api/resume',
    'POST /api/resume',
    'GET  /api/applications',
    'POST /api/applications',
    'PUT  /api/applications/:id',
    'POST /api/assistant',
  ],
}));

fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Start server
const PORT = process.env.PORT || 3001;
try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`\n🚀 NexusHire Backend running on http://localhost:${PORT}`);
  console.log(`   Visit http://localhost:${PORT} to confirm it's running\n`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

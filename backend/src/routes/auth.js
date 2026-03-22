import { getUser } from '../store/index.js';

export default async function authRoutes(fastify) {
  fastify.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body;
    const user = getUser(email);

    if (!user || user.password !== password) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    return {
      success: true,
      user: { email: user.email, name: user.name, hasResume: !!user.resume },
    };
  });
}

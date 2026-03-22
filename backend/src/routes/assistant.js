export default async function assistantRoutes(fastify) {
  fastify.post('/api/assistant', async (req, reply) => {
    try {
      const { message, history } = req.body;
      if (!message) return reply.status(400).send({ error: 'Message required' });

      const { runAssistant } = await import('../services/assistantService.js');
      const result = await runAssistant(message, history || []);
      return result;
    } catch (err) {
      console.error('[Assistant Error]', err.message);
      // Graceful fallback — app still works without AI
      return {
        response: "I'm having trouble connecting right now. You can still use the filters manually!",
        intent: 'help',
        filterUpdates: null,
        searchQuery: null,
      };
    }
  });
}

import { getUser, updateUserResume } from '../store/index.js';

export default async function resumeRoutes(fastify) {
  // Get current resume
  fastify.get('/api/resume', async (req, reply) => {
    const { email } = req.query;
    const user = getUser(email);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return { resume: user.resume ? { filename: user.resume.filename, uploadedAt: user.resume.uploadedAt } : null };
  });

  // Upload resume (base64-encoded in JSON)
  fastify.post('/api/resume', async (req, reply) => {
    const { email, filename, content, mimeType } = req.body;
    const user = getUser(email);
    if (!user) return reply.status(401).send({ error: 'User not found' });

    let text = '';
    try {
      if (mimeType === 'application/pdf') {
        // Dynamically import pdf-parse to handle its quirks
        const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
        const buffer = Buffer.from(content, 'base64');
        const result = await pdfParse(buffer);
        text = result.text;
      } else {
        // TXT or other text formats
        text = Buffer.from(content, 'base64').toString('utf-8');
      }
    } catch (err) {
      console.error('PDF parse error:', err.message);
      // Try to extract as plain text
      text = Buffer.from(content, 'base64').toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
    }

    if (!text || text.trim().length < 10) {
      return reply.status(400).send({ error: 'Could not extract text from resume. Please try a text file.' });
    }

    updateUserResume(email, {
      filename,
      text: text.trim(),
      uploadedAt: new Date().toISOString(),
    });

    return { success: true, message: 'Resume uploaded successfully', preview: text.substring(0, 200) };
  });
}

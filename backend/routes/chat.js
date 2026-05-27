const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DbService = require('../services/db');
const { streamChatCompletion } = require('../services/groq');

/**
 * @route   POST /chat
 * @desc    Send a prompt and stream the Groq AI response using SSE
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  let { sessionId, content } = req.body;

  if (!content) {
    return res.status(400).json({ msg: 'Please provide prompt content' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish connection immediately

  try {
    let session = null;

    // If no sessionId provided, create a new one automatically
    if (!sessionId) {
      // Create session title from first 4 words of the prompt
      const titleWords = content.trim().split(/\s+/).slice(0, 4).join(' ');
      const sessionTitle = titleWords.length > 30 ? titleWords.substring(0, 27) + '...' : titleWords;

      session = await DbService.session.create({
        userId: req.user.id,
        title: sessionTitle || 'New Conversation',
      });
      sessionId = session.id || session._id;

      // Send the newly created session back in a custom SSE metadata block
      res.write(`data: ${JSON.stringify({ metadata: { sessionId, title: session.title } })}\n\n`);
    } else {
      session = await DbService.session.findById(sessionId);
      if (!session) {
        res.write(`data: ${JSON.stringify({ error: 'Session not found' })}\n\n`);
        return res.end();
      }
      if (session.userId.toString() !== req.user.id) {
        res.write(`data: ${JSON.stringify({ error: 'Unauthorized session' })}\n\n`);
        return res.end();
      }
    }

    // Save the user's message
    await DbService.message.create({
      sessionId,
      role: 'user',
      content: content.trim(),
    });

    // Fetch conversation history for context
    const history = await DbService.message.findForSession(sessionId);

    // Stream from Groq completion service
    await streamChatCompletion(
      history,
      // onToken callback
      (token) => {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      },
      // onComplete callback
      async (fullText) => {
        try {
          // Save assistant's message
          await DbService.message.create({
            sessionId,
            role: 'assistant',
            content: fullText,
          });

          // Stream DONE block
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (dbErr) {
          console.error('Error saving assistant response:', dbErr);
          res.write(`data: ${JSON.stringify({ error: 'Failed to persist message' })}\n\n`);
          res.end();
        }
      },
      // onError callback
      (err) => {
        console.error('Streaming error:', err);
        res.write(`data: ${JSON.stringify({ error: 'Error during streaming' })}\n\n`);
        res.end();
      }
    );

  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Internal Server Error' })}\n\n`);
    res.end();
  }
});

module.exports = router;

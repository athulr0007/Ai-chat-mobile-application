const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DbService = require('../services/db');

/**
 * @route   GET /sessions
 * @desc    Get all chat sessions for the authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await DbService.session.findForUser(req.user.id);
    res.json(sessions);
  } catch (err) {
    console.error('Get Sessions Error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /sessions
 * @desc    Create a new chat session
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ msg: 'Please provide a session title' });
  }

  try {
    const session = await DbService.session.create({
      userId: req.user.id,
      title: title.trim(),
    });
    res.json(session);
  } catch (err) {
    console.error('Create Session Error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /sessions/:id
 * @desc    Delete a session and all its messages
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await DbService.session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Verify user owns the session
    if (session.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete session and messages
    await DbService.session.delete(req.params.id);

    res.json({ msg: 'Session and associated messages deleted successfully' });
  } catch (err) {
    console.error('Delete Session Error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /sessions/:id/messages
 * @desc    Get all messages for a specific session
 * @access  Private
 */
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const session = await DbService.session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Verify user owns the session
    if (session.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const messages = await DbService.message.findForSession(req.params.id);
    res.json(messages);
  } catch (err) {
    console.error('Get Messages Error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /sessions/:id/messages
 * @desc    Add a message to a session (manual storage)
 * @access  Private
 */
router.post('/:id/messages', auth, async (req, res) => {
  const { role, content } = req.body;

  if (!role || !content) {
    return res.status(400).json({ msg: 'Please provide role and content' });
  }

  try {
    const session = await DbService.session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Verify user owns the session
    if (session.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const message = await DbService.message.create({
      sessionId: req.params.id,
      role,
      content,
    });

    res.json(message);
  } catch (err) {
    console.error('Add Message Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

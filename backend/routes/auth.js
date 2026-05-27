const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const DbService = require('../services/db');

/**
 * @route   POST /auth/google
 * @desc    Simulated Google Sign-in / JWT Token Generation
 * @access  Public
 */
router.post('/google', async (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email || !name) {
    return res.status(400).json({ msg: 'Please provide email and name' });
  }

  try {
    // Check if user already exists
    let user = await DbService.user.findOne({ email });

    if (!user) {
      // Create new user
      user = await DbService.user.create({
        name,
        email,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      });
    } else if (avatar && user.avatar !== avatar) {
      // Update avatar if changed
      user.avatar = avatar;
      await user.save();
    }

    // Create JWT Payload
    const userId = user.id || user._id;
    const payload = {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'eye1_ultra_secure_jwt_secret_token_key_2026',
      { expiresIn: '30d' }, // Valid for 30 days
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: userId,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        });
      }
    );
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

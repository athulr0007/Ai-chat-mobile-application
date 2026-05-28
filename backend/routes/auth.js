const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const DbService = require('../services/db');

/**
 * @route   POST /auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      msg: 'Please provide all fields',
    });
  }

  try {
    let existingUser = await DbService.user.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        msg: 'User already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await DbService.user.create({
      name,
      email,
      password: hashedPassword,
      provider: 'local',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    const payload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'eye1_ultra_secure_jwt_secret_token_key_2026',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          user: payload.user,
        });
      }
    );
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /auth/login
 * @desc    Login existing user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: 'Please provide email and password',
    });
  }

  try {
    const user = await DbService.user.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: 'Invalid credentials',
      });
    }

    const payload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'eye1_ultra_secure_jwt_secret_token_key_2026',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          user: payload.user,
        });
      }
    );
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /auth/google
 * @desc    Simulated Google Sign-in / JWT Token Generation
 * @access  Public
 */
router.post('/google', async (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email || !name) {
    return res.status(400).json({
      msg: 'Please provide email and name',
    });
  }

  try {
    let user = await DbService.user.findOne({ email });

    if (!user) {
      user = await DbService.user.create({
        name,
        email,
  provider: 'google',        avatar:
          avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      });
    }

    const userId = user.id || user._id;

    const payload = {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'eye1_ultra_secure_jwt_secret_token_key_2026',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          user: payload.user,
        });
      }
    );
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


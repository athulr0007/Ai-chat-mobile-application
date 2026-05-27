const mongoose = require('mongoose');
const crypto = require('crypto');

// In-memory mock database storage
const mockDb = {
  users: [],
  sessions: [],
  messages: []
};

// Check if mongoose is connected
const isConnected = () => mongoose.connection.readyState === 1;

const DbService = {
  // --- USER OPERATIONS ---
  user: {
    findOne: async ({ email }) => {
      if (isConnected()) {
        const User = require('../models/User');
        return await User.findOne({ email });
      }
      return mockDb.users.find(u => u.email === email.toLowerCase()) || null;
    },
    create: async ({ name, email, avatar }) => {
      if (isConnected()) {
        const User = require('../models/User');
        const user = new User({ name, email, avatar });
        return await user.save();
      }
      const newUser = {
        id: crypto.randomBytes(12).toString('hex'),
        _id: crypto.randomBytes(12).toString('hex'),
        name,
        email: email.toLowerCase(),
        avatar,
        createdAt: new Date()
      };
      // Allow it to act like a mongoose document (updating fields & save method)
      newUser.save = async function() {
        const idx = mockDb.users.findIndex(u => u.id === this.id);
        if (idx !== -1) mockDb.users[idx] = this;
        return this;
      };
      mockDb.users.push(newUser);
      return newUser;
    }
  },

  // --- SESSION OPERATIONS ---
  session: {
    findForUser: async (userId) => {
      if (isConnected()) {
        const Session = require('../models/Session');
        return await Session.find({ userId }).sort({ updatedAt: -1 });
      }
      return mockDb.sessions
        .filter(s => s.userId === userId)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },
    findById: async (id) => {
      if (isConnected()) {
        const Session = require('../models/Session');
        return await Session.findById(id);
      }
      const session = mockDb.sessions.find(s => s.id === id || s._id === id);
      if (session) {
        session.save = async function() { return this; };
      }
      return session || null;
    },
    create: async ({ userId, title }) => {
      if (isConnected()) {
        const Session = require('../models/Session');
        const session = new Session({ userId, title });
        return await session.save();
      }
      const newSession = {
        id: crypto.randomBytes(12).toString('hex'),
        _id: crypto.randomBytes(12).toString('hex'),
        userId,
        title,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      newSession.save = async function() {
        const idx = mockDb.sessions.findIndex(s => s.id === this.id);
        if (idx !== -1) mockDb.sessions[idx] = this;
        return this;
      };
      mockDb.sessions.push(newSession);
      return newSession;
    },
    delete: async (id) => {
      if (isConnected()) {
        const Session = require('../models/Session');
        const Message = require('../models/Message');
        await Session.findByIdAndDelete(id);
        await Message.deleteMany({ sessionId: id });
        return true;
      }
      mockDb.sessions = mockDb.sessions.filter(s => s.id !== id && s._id !== id);
      mockDb.messages = mockDb.messages.filter(m => m.sessionId !== id);
      return true;
    }
  },

  // --- MESSAGE OPERATIONS ---
  message: {
    findForSession: async (sessionId) => {
      if (isConnected()) {
        const Message = require('../models/Message');
        return await Message.find({ sessionId }).sort({ createdAt: 1 });
      }
      return mockDb.messages
        .filter(m => m.sessionId === sessionId)
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    create: async ({ sessionId, role, content }) => {
      if (isConnected()) {
        const Message = require('../models/Message');
        const message = new Message({ sessionId, role, content });
        return await message.save();
      }
      const newMessage = {
        id: crypto.randomBytes(12).toString('hex'),
        _id: crypto.randomBytes(12).toString('hex'),
        sessionId,
        role,
        content,
        createdAt: new Date()
      };
      newMessage.save = async function() {
        mockDb.messages.push(this);
        return this;
      };
      mockDb.messages.push(newMessage);
      
      // Update session's updatedAt time
      const session = mockDb.sessions.find(s => s.id === sessionId || s._id === sessionId);
      if (session) {
        session.updatedAt = new Date();
      }

      return newMessage;
    }
  }
};

module.exports = DbService;

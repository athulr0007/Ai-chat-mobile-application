# EYE 1 — AI Chat Mobile Application

EYE 1 is a modern AI-powered mobile chat application built using React Native, Expo, Node.js, Express, MongoDB, and Groq AI.

The application delivers a premium conversational experience with real-time streaming responses, persistent chat history, authentication, theme customization, text-to-speech playback, and a polished mobile-first user interface inspired by modern AI products such as ChatGPT, Claude, and Gemini.

---

# Features

## Authentication & Security

* User Registration (Email & Password)
* User Login (Email & Password)
* JWT Authentication
* Protected API Routes
* Persistent Login Sessions using AsyncStorage
* Secure Logout Functionality

---

## AI Chat Experience

* Real-Time Streaming Responses (Server-Sent Events)
* Groq LLM Integration
* Automatic Session Creation
* Automatic Conversation Titles
* Persistent Chat History
* Multi-Session Support
* Typing Indicator Animation
* Smooth Auto-Scrolling During Streaming

---

## Chat Actions

* Copy AI Responses
* Share AI Responses
* Text-to-Speech Playback
* Long-Press Message Actions
* Read Aloud / Stop Playback Controls

---

## User Interface

* Modern Mobile Chat Design
* Dark Theme
* Light Theme
* System Theme Support
* Animated Drawer Navigation
* Animated Typing Indicator
* Smooth Reanimated Transitions
* Responsive Layout
* Professional Settings Screen

---

## Data Persistence

* MongoDB Storage
* Session Persistence
* Message Persistence
* User Persistence
* Automatic Chat Retrieval

---

## Offline Development Support

* In-Memory Database Fallback
* Mock AI Response Fallback
* Local Development Mode
* Production Deployment Ready

---

# Technology Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Mobile Framework | React Native            |
| Expo SDK         | Expo SDK 56             |
| Navigation       | Expo Router             |
| State Management | Zustand                 |
| Server State     | TanStack Query          |
| Animations       | React Native Reanimated |
| Authentication   | JWT                     |
| Storage          | AsyncStorage            |
| Text To Speech   | expo-speech             |
| Backend          | Node.js                 |
| API Server       | Express.js              |
| Database         | MongoDB + Mongoose      |
| AI Provider      | Groq                    |
| AI Model         | llama-3.1-8b-instant    |

---

# Project Structure

```text
EYE-1/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── welcome.tsx
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── (drawer)/
│   │   │   ├── index.tsx
│   │   │   ├── settings.tsx
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   │
│   ├── components/
│   │   ├── ChatBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── SkeletonLoader.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   └── useThemeStore.ts
│   │
│   └── constants/
│       └── theme.ts
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── Message.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── sessions.js
│   │
│   ├── services/
│   │   ├── db.js
│   │   └── groq.js
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# API Endpoints

## Authentication

### Register User

```http
POST /auth/register
```

### Login User

```http
POST /auth/login
```

### Google Login (Optional Demo Endpoint)

```http
POST /auth/google
```

---

## Chat Sessions

### Get Sessions

```http
GET /sessions
```

### Create Session

```http
POST /sessions
```

### Delete Session

```http
DELETE /sessions/:id
```

---

## Messages

### Get Session Messages

```http
GET /sessions/:id/messages
```

### Stream AI Response

```http
POST /chat
```

---

# MongoDB Collections

## Users

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  avatar: String,
  createdAt: Date
}
```

## Sessions

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Messages

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,
  role: "user" | "assistant",
  content: String,
  createdAt: Date
}
```

---

# Environment Variables

Backend `.env`

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
```

---

# Local Setup

## Backend

```bash
cd backend

npm install

npm start
```

Server runs at:

```text
http://localhost:5000
```

---

## Mobile App

```bash
npm install

npx expo start
```

Run using:

* Android Emulator
* iOS Simulator
* Expo Go
* Physical Device

---

# Deployment

## Backend

Recommended:

* Render
* Railway

## Database

* MongoDB Atlas

## Mobile Build

```bash
eas build --platform android
```

---

# Highlights

* Full Stack Mobile Application
* JWT Authentication
* MongoDB Integration
* Real-Time Streaming AI Responses
* Groq AI Integration
* Session-Based Chat History
* Theme Switching
* Text-to-Speech Support
* Copy & Share AI Responses
* Modern Mobile UI/UX
* Production Deployment Ready

---

## Version

**EYE 1 v1.0.0-beta**

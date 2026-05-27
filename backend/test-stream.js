/**
 * EYE 1 Backend Verification Script
 * This script tests the JWT generation and SSE Chat Streaming in the console.
 */
const http = require('http');

const PORT = process.env.PORT || 5000;
const host = 'localhost';

async function runTest() {
  console.log('🏁 Starting EYE 1 Backend Verification Test...');

  // 1. Obtain JWT Token
  console.log('\n🔐 Step 1: Performing Simulated Google Sign-In...');
  const authData = JSON.stringify({
    email: 'test-developer@eye1.ai',
    name: 'Developer EyeOne',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dev'
  });

  let token = '';
  try {
    token = await new Promise((resolve, reject) => {
      const req = http.request({
        host,
        port: PORT,
        path: '/auth/google',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(authData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Auth failed with status ${res.statusCode}: ${body}`));
            return;
          }
          try {
            const data = JSON.parse(body);
            console.log('✅ Auth Succeeded! Token generated successfully.');
            resolve(data.token);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(authData);
      req.end();
    });
  } catch (err) {
    console.error('❌ Step 1 Failed:', err.message);
    console.log('⚠️ Make sure your backend server is running! Run `node backend/index.js` first.');
    return;
  }

  // 2. Test SSE Chat Streaming
  console.log('\n💬 Step 2: Testing Server-Sent Events (SSE) AI Chat Stream...');
  const chatData = JSON.stringify({
    content: 'Explain the core features of EYE 1'
  });

  try {
    await new Promise((resolve, reject) => {
      const req = http.request({
        host,
        port: PORT,
        path: '/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(chatData),
          'Authorization': `Bearer ${token}`
        }
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Chat failed with status ${res.statusCode}`));
          return;
        }

        console.log('🌊 Connection established! Incoming AI Stream:\n----------------------------------------');
        
        res.on('data', (chunk) => {
          const chunkStr = chunk.toString();
          // Parse SSE lines
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                console.log('\n----------------------------------------');
                console.log('✅ SSE Stream complete! [DONE] token received.');
                resolve();
                return;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.token) {
                  process.stdout.write(parsed.token);
                } else if (parsed.metadata) {
                  console.log(`[Metadata Received: Created Session ID - ${parsed.metadata.sessionId}]`);
                }
              } catch (e) {
                // Ignore parsing errors for partial/malformed JSON chunks
              }
            }
          }
        });
      });

      req.on('error', reject);
      req.write(chatData);
      req.end();
    });
  } catch (err) {
    console.error('❌ Step 2 Failed:', err.message);
  }
}

runTest();

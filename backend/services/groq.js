const { OpenAI } = require('openai');
const fs = require('fs');

let openai = null;
const apiKey = process.env.GROQ_API_KEY;

if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
} else {
  console.warn('⚠️ GROQ_API_KEY is not defined in the backend environment. Running in SIMULATED/MOCK mode.');
}

/**
 * Streams AI completions from Groq llama-3.1-8b-instant or simulated stream
 * @param {Array} messages - Message history
 * @param {Function} onToken - Callback for every token received
 * @param {Function} onComplete - Callback when completed
 * @param {Function} onError - Callback for errors
 */
async function streamChatCompletion(messages, onToken, onComplete, onError) {
  if (!openai) {
    // Simulated stream
    try {
      const mockResponse = `Hello! I am **EYE 1**, your premium AI assistant. 
      
I am currently running in **Simulated Offline Mode** because a \`GROQ_API_KEY\` was not found in the backend \`.env\` file. 

### What can you do now?
1. **Chat**: I will respond with custom simulations and explain system features!
2. **Text-to-Speech**: You can click the speaker icon next to any message to hear it read aloud!
3. **Voice Input**: Hold the microphone button to send voice recording. I will mock transcribe it!
4. **Theme Toggle**: Switch between **Light**, **Dark**, and **System** themes in Settings!

To unlock the live **llama-3.1-8b-instant** model, simply add your \`GROQ_API_KEY\` in \`backend/.env\` and restart the server! 

How can I help you today?`;

      // Split into small chunks to simulate live streaming
      const words = mockResponse.split(' ');
      let currentWordIndex = 0;

      const interval = setInterval(() => {
        if (currentWordIndex >= words.length) {
          clearInterval(interval);
          onComplete(mockResponse);
        } else {
          // Add back the space we split on
          const token = words[currentWordIndex] + (currentWordIndex === words.length - 1 ? '' : ' ');
          onToken(token);
          currentWordIndex++;
        }
      }, 30); // Stream smooth tokens
    } catch (err) {
      onError(err);
    }
    return;
  }

  try {
    const responseStream = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullText += token;
        onToken(token);
      }
    }
    onComplete(fullText);
  } catch (err) {
    console.error('Groq API Error:', err);
    onError(err);
  }
}

/**
 * Transcribes audio file using Groq Whisper API or simulated transcriber
 * @param {string} filePath - Absolute path to audio file
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(filePath) {
  if (!openai) {
    // Simulated Whisper transcription
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a randomized helpful voice prompt
        const prompts = [
          "Explain what makes EYE 1 a premium AI chat application.",
          "Tell me a joke about artificial intelligence.",
          "How do I configure my GROQ API key in the backend?",
          "Show me a React Native typescript code snippet for a bounce animation.",
          "What is the capital of France and explain it using markdown styling."
        ];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        resolve(randomPrompt);
      }, 1500); // Simulate transcription delay
    });
  }

  try {
    const fileStream = fs.createReadStream(filePath);
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-large-v3',
    });
    return transcription.text;
  } catch (err) {
    console.error('Groq Whisper Transcription Error:', err);
    throw err;
  }
}

module.exports = {
  streamChatCompletion,
  transcribeAudio,
};

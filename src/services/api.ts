import { BACKEND_URL, useAuthStore } from '../store/useAuthStore';

// Helper to get authorization headers
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export interface ChatSession {
  _id: string;
  id?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  id?: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const ApiService = {
  // --- SESSIONS ---
  getSessions: async (): Promise<ChatSession[]> => {
    const response = await fetch(`${BACKEND_URL}/sessions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch sessions');
    return response.json();
  },

  createSession: async (title: string): Promise<ChatSession> => {
    const response = await fetch(`${BACKEND_URL}/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create session');
    return response.json();
  },

  deleteSession: async (id: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/sessions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete session');
  },

  // --- MESSAGES ---
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await fetch(`${BACKEND_URL}/sessions/${sessionId}/messages`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  // --- VOICE SPEECH-TO-TEXT ---
  transcribeVoice: async (fileUri: string, mimeType: string = 'audio/m4a'): Promise<string> => {
    const token = useAuthStore.getState().token;
    
    // Setup FormData for file upload
    const formData = new FormData();
    
    // File name
    const filename = fileUri.split('/').pop() || 'voice.m4a';
    
    // React Native FormData requires a specific file object shape:
    formData.append('audio', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await fetch(`${BACKEND_URL}/voice/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: Do NOT set 'Content-Type' header here, fetch will set it automatically with the correct boundary!
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.msg || 'Transcription failed');
    }

    const data = await response.json();
    return data.text;
  },

  // --- SERVER-SENT EVENTS (SSE) STREAMING CLIENT ---
  streamChat: (
    sessionId: string | null,
    content: string,
    onToken: (token: string) => void,
    onMetadata: (metadata: { sessionId: string; title: string }) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: string) => void
  ): () => void => {
    const token = useAuthStore.getState().token;
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `${BACKEND_URL}/chat`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    let lastIndex = 0;
    let fullResponse = '';

    const handleProgress = () => {
      const responseText = xhr.responseText;
      if (!responseText) return;

      const newText = responseText.substring(lastIndex);
      lastIndex = responseText.length;

      // Split SSE chunks by double newlines
      const chunks = newText.split('\n');
      
      for (const chunk of chunks) {
        const cleanChunk = chunk.trim();
        if (!cleanChunk) continue;

        if (cleanChunk.startsWith('data: ')) {
          const dataStr = cleanChunk.slice(6).trim();

          if (dataStr === '[DONE]') {
            onComplete(fullResponse);
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.token) {
              fullResponse += parsed.token;
              onToken(parsed.token);
            } else if (parsed.metadata) {
              onMetadata(parsed.metadata);
            } else if (parsed.error) {
              onError(parsed.error);
            }
          } catch (e) {
            // Ignore JSON parse error in case of incomplete chunks in buffer
          }
        }
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 3) {
        handleProgress();
      } else if (xhr.readyState === 4) {
        handleProgress();
        if (xhr.status !== 200) {
          onError(`Connection terminated with status ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      onError('Network request failed');
    };

    // Send payload
    xhr.send(JSON.stringify({ sessionId, content }));

    // Return cancellation function (to let the UI abort the stream if user stops it!)
    return () => {
      if (xhr.readyState !== 4) {
        xhr.abort();
      }
    };
  }
};

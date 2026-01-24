/**
 * API service for Azure Functions backend
 */

const API_TIMEOUT = 10000;

/**
 * Get the API base URL
 * @returns {string}
 */
function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071';
}

/**
 * Fetch with timeout wrapper
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Get speech token from Azure Functions
 * @returns {Promise<{token: string, region: string}>}
 */
export async function getSpeechToken() {
  const response = await fetchWithTimeout(`${getBaseUrl()}/api/speechToken`);
  
  if (!response.ok) {
    throw new Error(`Speech token request failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Text-to-speech using Azure Neural TTS
 * @param {string} text - Text to speak
 * @param {string} voice - Voice name (default: en-US-AnaNeural)
 * @param {string} style - Speaking style (default: friendly)
 * @returns {Promise<{audio: string, format: string}>}
 */
export async function textToSpeech(text, voice = 'en-US-AnaNeural', style = 'friendly') {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for speech synthesis');
  }
  
  // Limit text length to prevent abuse
  const sanitizedText = text.slice(0, 500);
  
  const response = await fetchWithTimeout(`${getBaseUrl()}/api/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: sanitizedText, voice, style })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `TTS request failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Send chat message to LLM
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @returns {Promise<{reply: string}>}
 */
export async function sendChatMessage(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required');
  }
  
  const response = await fetchWithTimeout(`${getBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Chat request failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Audio cache for TTS responses
 */
const audioCache = new Map();
const MAX_CACHE_SIZE = 20;

/**
 * Get cached audio or fetch new
 * @param {string} text - Text to speak
 * @returns {Promise<HTMLAudioElement>}
 */
export async function getCachedAudio(text) {
  const cacheKey = text.toLowerCase().trim();
  
  if (audioCache.has(cacheKey)) {
    const audio = audioCache.get(cacheKey);
    audio.currentTime = 0;
    return audio;
  }
  
  const data = await textToSpeech(text);
  const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
  
  // Manage cache size
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const firstKey = audioCache.keys().next().value;
    audioCache.delete(firstKey);
  }
  
  audioCache.set(cacheKey, audio);
  return audio;
}

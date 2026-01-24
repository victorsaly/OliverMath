import { app } from '@azure/functions';

app.http('speak', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const origin = request.headers.get('origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return { status: 204, headers: corsHeaders };
    }

    try {
      const body = await request.json();
      const { text, voice = 'en-GB-RyanNeural', style = 'default' } = body;

      if (!text) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          jsonBody: { error: 'Text is required' }
        };
      }

      const speechKey = process.env.AZURE_SPEECH_KEY;
      const speechRegion = process.env.AZURE_SPEECH_REGION || 'eastus';

      if (!speechKey) {
        return {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          jsonBody: { error: 'Speech service not configured' }
        };
      }

      // Build SSML for neural voice with expression
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
               xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
          <voice name="${voice}">
            <mstts:express-as style="${style}">
              <prosody rate="0.9" pitch="-5%" contour="(0%,+0Hz)(50%,-2Hz)(100%,+0Hz)">
                ${escapeXml(text)}
              </prosody>
            </mstts:express-as>
          </voice>
        </speak>
      `.trim();

      // Call Azure Speech TTS REST API
      const ttsUrl = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
      
      const response = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'OliverMath'
        },
        body: ssml
      });

      if (!response.ok) {
        const errorText = await response.text();
        context.log('TTS API error:', response.status, errorText);
        return {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          jsonBody: { error: 'Speech synthesis failed', details: errorText }
        };
      }

      // Return audio as base64 for easier client handling
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        jsonBody: { 
          audio: base64Audio,
          format: 'audio/mpeg'
        }
      };

    } catch (error) {
      context.log('TTS error:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

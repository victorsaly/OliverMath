import { app } from '@azure/functions';
import fetch from 'node-fetch';

app.http('speechToken', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const origin = request.headers.get('origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') {
      return { status: 204, headers: corsHeaders };
    }

    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) {
      return { status: 500, headers: corsHeaders, jsonBody: { error: 'missing_speech_config' } };
    }

    try {
      const url = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': key }
      });
      if (!resp.ok) {
        const text = await resp.text();
        context.error(`Speech token error: ${resp.status} ${text}`);
        return { status: 502, headers: corsHeaders, jsonBody: { error: 'speech_token_failed' } };
      }
      const token = await resp.text();
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        jsonBody: { token, region }
      };
    } catch (err) {
      context.error(err);
      return { status: 500, headers: corsHeaders, jsonBody: { error: 'server_error' } };
    }
  }
});

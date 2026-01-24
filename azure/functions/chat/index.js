import { app } from '@azure/functions';
import OpenAI from 'openai';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const getModel = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';

app.http('chat', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    // CORS
    const origin = request.headers.get('origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') {
      return { status: 204, headers: corsHeaders };
    }

    try {
      const body = await request.json();
      const messages = Array.isArray(body?.messages) ? body.messages : [];
      if (messages.length === 0) {
        return { status: 400, headers: corsHeaders, jsonBody: { error: 'messages array required' } };
      }

      // Add a system prompt to ensure safe math explanations
      const system = {
        role: 'system',
        content: 'You are a helpful math assistant for students. Explain step-by-step, be concise, and avoid exposing personal data.'
      };

      const completion = await getClient().chat.completions.create({
        model: getModel(),
        messages: [system, ...messages],
        temperature: 0.2
      });

      const reply = completion.choices?.[0]?.message?.content || '';
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        jsonBody: { reply }
      };
    } catch (err) {
      context.error(err);
      return { status: 500, headers: corsHeaders, jsonBody: { error: 'server_error' } };
    }
  }
});

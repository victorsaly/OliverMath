import { app } from '@azure/functions';
import OpenAI from 'openai';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const getModel = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';

app.http('validateAnswer', {
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
      const { spokenText, expectedAnswer, question, language } = body;

      // Translate spoken text to English if needed
      let translatedText = spokenText;
      if (language && language !== 'en') {
        const translatePrompt = `Translate the following text to English. If it's already in English or is just a number, return it as-is. Only return the translated text, nothing else:\n\n"${spokenText}"`;
        
        const translateCompletion = await getClient().chat.completions.create({
          model: getModel(),
          messages: [{ role: 'user', content: translatePrompt }],
          temperature: 0,
          max_tokens: 50
        });
        
        const translated = translateCompletion.choices?.[0]?.message?.content?.trim();
        if (translated) {
          translatedText = translated;
          context.log(`Translated "${spokenText}" to "${translatedText}"`);
        }
      }

      // Use LLM to interpret the spoken response
      const systemPrompt = `You are a math answer validator for a children's educational game. 
Your job is to determine if a child's spoken response matches the expected numerical answer.

Rules:
1. Accept numbers in word form: "twelve" = 12, "twenty-four" = 24
2. Accept numbers with extra words: "it's twelve", "the answer is 24", "I think it's forty-two"
3. Accept slight mispronunciations that clearly mean the number
4. Accept responses like "times tables answer is..." or "equals..."
5. Be lenient with children's speech patterns
6. If the response is clearly a different number, mark as incorrect
7. If the response is unclear, gibberish, or empty, mark as unclear

Respond ONLY with a JSON object in this exact format:
{"correct": true/false, "understood": true/false, "interpretedNumber": <number or null>, "confidence": "high"/"medium"/"low"}

- correct: true if the spoken answer matches the expected answer
- understood: true if you could interpret a number from the speech, false if unclear/gibberish
- interpretedNumber: the number you interpreted from the speech, or null if unclear
- confidence: how confident you are in the interpretation`;

      const userPrompt = `Question: "${question}"
Expected answer: ${expectedAnswer}
Child's spoken response: "${translatedText}" (original: "${spokenText}")

Analyze if the child answered correctly.`;

      const completion = await getClient().chat.completions.create({
        model: getModel(),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 100
      });

      const reply = completion.choices?.[0]?.message?.content || '';
      
      // Parse the JSON response
      let result;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { correct: false, understood: false };
      } catch {
        context.warn('Failed to parse LLM response:', reply);
        result = { correct: false, understood: false, interpretedNumber: null, confidence: 'low' };
      }

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        jsonBody: result
      };
    } catch (err) {
      context.error(err);
      return { status: 500, headers: corsHeaders, jsonBody: { error: 'server_error' } };
    }
  }
});

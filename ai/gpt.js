// Lightweight wrapper for OpenAI chat completion used for explanations.
// This file lazily requires the OpenAI package so it can be imported
// even when the package is not installed in the environment yet.

function getClient() {
  if (global.__nbabot_openai_client) return global.__nbabot_openai_client;
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    global.__nbabot_openai_client = client;
    return client;
  } catch (err) {
    // Defer the error until the function is actually used
    throw new Error('OpenAI client not available. Install the `openai` package and set OPENAI_API_KEY.');
  }
}

async function explainWithGPT(context) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.3,
    max_tokens: 180,
    messages: [
      {
        role: 'system',
        content:
          'You are an NBA analytics explainer. Use ONLY the provided data. Do not invent stats, odds, or outcomes. Do not predict results.'
      },
      {
        role: 'user',
        content: JSON.stringify(context)
      }
    ]
  });

  return response.choices?.[0]?.message?.content || null;
}

module.exports = { explainWithGPT };

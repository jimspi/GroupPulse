// FILE: pages/api/gpt-checkin.js
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  // — Allow CORS & preflight across the board —
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 1) Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2) Gracefully handle GET
  if (req.method === 'GET') {
    return res.status(200).json({
      aiMessage: '',
      aiSuggestion: '',
      aiAffirmation: ''
    });
  }

  // 3) Block any other non-POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 4) Real POST -> run GPT
  const { mood, reasons } = req.body;
  try {
    const messages = [
      {
        role: 'system',
        content: `You are a compassionate mental health assistant. Based on the user's mood and reasons, provide 3 things:
1. A supportive message
2. A helpful suggestion
3. A positive affirmation
Keep each response under 2 sentences.`
      },
      {
        role: 'user',
        content: `Mood: ${mood}\nReasons: ${reasons.join(', ')}`
      }
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const reply = completion.data.choices[0].message.content;
    const [aiMessage, aiSuggestion, aiAffirmation] = reply
      .split(/\r?\n/)
      .filter(Boolean);

    return res.status(200).json({ aiMessage, aiSuggestion, aiAffirmation });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate response.' });
  }
}





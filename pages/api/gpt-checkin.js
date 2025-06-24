// FILE: pages/api/gpt-checkin.js
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  // 1) Gracefully handle GET: always return an empty-but-valid JSON
  if (req.method === 'GET') {
    return res.status(200).json({
      aiMessage: '',
      aiSuggestion: '',
      aiAffirmation: ''
    });
  }

  // 2) Block anything except POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 3) Extract payload
  const { mood, reasons } = req.body;

  try {
    // 4) Build the conversation for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are a compassionate mental health assistant. Based on the user's mood and reasons, provide 3 things:\n` +
                 `1. A supportive message\n` +
                 `2. A helpful suggestion\n` +
                 `3. A positive affirmation\n` +
                 `Keep each response under 2 sentences.`
      },
      {
        role: 'user',
        content: `Mood: ${mood}\nReasons: ${reasons.join(', ')}`
      }
    ];

    // 5) Call the API
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });

    // 6) Parse the reply
    const reply = completion.data.choices[0].message.content;
    const [aiMessage, aiSuggestion, aiAffirmation] = reply
      .split(/\r?\n/)
      .filter(Boolean);

    // 7) Send it back
    return res.status(200).json({ aiMessage, aiSuggestion, aiAffirmation });

  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate response.' });
  }
}




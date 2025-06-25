// FILE: pages/api/gpt-checkin.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // — CORS & preflight —
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      aiMessage: '',
      aiSuggestion: '',
      aiAffirmation: ''
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mood, reasons } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a compassionate mental health assistant. Based on the user's mood and reasons, output exactly three lines:
1) The supportive message itself
2) The suggestion itself
3) The affirmation itself
Do NOT prefix lines with labels. Keep each under 2 sentences.`
        },
        {
          role: 'user',
          content: `Mood: ${mood}\nReasons: ${reasons.join(', ')}`
        }
      ]
    });

    const reply = response.choices[0].message.content;
    const [aiMessage, aiSuggestion, aiAffirmation] = reply
      .split(/\r?\n/)
      .filter(Boolean);

    return res.status(200).json({ aiMessage, aiSuggestion, aiAffirmation });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate response.' });
  }
}







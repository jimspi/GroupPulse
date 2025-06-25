// FILE: pages/api/gpt-checkin.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS & preflight
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
    // Tell the model exactly how to format its output
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: [
            "You are a compassionate mental health assistant.",
            "Based on the user's mood and reasons, reply with exactly three lines that are 2 sentences each:",
            "1) A supportive message (just the message).",
            "2) A suggestion (just the suggestion).",
            "3) An affirmation (just the affirmation).",
            "No labels or prefixes—only the text itself. Separate each item with a newline."
          ].join("\n")
        },
        {
          role: 'user',
          content: `Mood: ${mood}\nReasons: ${reasons.join(', ')}`
        }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Split into lines, trim, and pad to always have three entries
    const lines = reply
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line !== "");

    const aiMessage     = lines[0] || "";
    const aiSuggestion  = lines[1] || "";
    const aiAffirmation = lines[2] || "";

    return res.status(200).json({ aiMessage, aiSuggestion, aiAffirmation });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate response.' });
  }
}








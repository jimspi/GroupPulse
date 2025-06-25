// FILE: pages/api/gpt-checkin.js
import OpenAI from 'openai';

// Initialize OpenAI (v4)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Airtable configuration from environment
const AIRTABLE_BASE_ID    = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME; // e.g. 'GroupPulse'
const AIRTABLE_ENDPOINT   = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

export default async function handler(req, res) {
  // CORS & preflight support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return empty JSON on GET
  if (req.method === 'GET') {
    return res.status(200).json({ aiMessage: '', aiSuggestion: '', aiAffirmation: '' });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mood, reasons } = req.body;

  try {
    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: [
            "You are a compassionate mental health assistant.",
            "Based on the user's mood and reasons, reply with exactly three lines:",
            "1) A supportive message.",
            "2) A suggestion.",
            "3) An affirmation.",
            "No labels or prefixes—only the text itself, each on its own line."
          ].join("\n")
        },
        {
          role: 'user',
          content: `Mood: ${mood}\nReasons: ${reasons.join(', ')}`
        }
      ]
    });

    // Parse the lines
    const reply = completion.choices[0].message.content;
    const lines = reply
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const aiMessage     = lines[0] || '';
    const aiSuggestion  = lines[1] || '';
    const aiAffirmation = lines[2] || '';

    // Save to Airtable (fire-and-forget)
    fetch(AIRTABLE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Mood:            mood,
          Reasons:         reasons.join(', '),
          'AI Message':      aiMessage,
          'AI Suggestion':   aiSuggestion,
          'AI Affirmation':  aiAffirmation
        }
      })
    }).catch(err => console.error('Airtable error:', err));

    // Return to client
    return res.status(200).json({ aiMessage, aiSuggestion, aiAffirmation });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate response.' });
  }
}









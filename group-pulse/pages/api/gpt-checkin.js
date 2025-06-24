import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { mood, reasons } = req.body;

  if (!mood || !Array.isArray(reasons)) {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  const systemPrompt = `You are a supportive mental health companion. When given a user's mood and a list of reasons, your job is to respond with:
1. A short, empathetic message (1–2 sentences),
2. One gentle, relevant suggestion (1 sentence),
3. One uplifting affirmation (1 sentence).
Use kind, validating language. Avoid sounding robotic or clinical. Do not mention you're an AI. Keep it conversational and warm.`;

  const userPrompt = `Mood: ${mood}\nReasons: ${reasons.join(', ')}\n\nRespond in this format:\nMessage: [your message]\nSuggestion: [your suggestion]\nAffirmation: [your affirmation]`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    const result = await openaiRes.json();

    const rawText = result?.choices?.[0]?.message?.content || '';
    const lines = rawText.split('\n').filter(Boolean);

    const aiMessage = lines.find(line => line.startsWith('Message:'))?.replace('Message:', '').trim() || '';
    const aiSuggestion = lines.find(line => line.startsWith('Suggestion:'))?.replace('Suggestion:', '').trim() || '';
    const aiAffirmation = lines.find(line => line.startsWith('Affirmation:'))?.replace('Affirmation:', '').trim() || '';

    res.status(200).json({
      aiMessage,
      aiSuggestion,
      aiAffirmation,
    });
  } catch (error) {
    console.error('GPT API Error:', error);
    res.status(500).json({ error: 'Failed to generate response from GPT' });
  }
}

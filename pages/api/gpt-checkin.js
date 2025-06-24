import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { mood, reasons } = req.body;
  try {
    const messages = [
      { role:'system', content:'You are a supportive companion.' },
      { role:'user', content:`Mood: ${mood}\nReasons: ${reasons.join(', ')}` }
    ];
    const completion = await openai.createChatCompletion({ model:'gpt-3.5-turbo', messages });
    const reply = completion.data.choices[0].message.content;
    const [aiMessage, aiSuggestion, aiAffirmation] = reply.split(/\r?\n/).filter(Boolean);
    res.status(200).json({ aiMessage, aiSuggestion, aiAffirmation });
  } catch(err) {
    res.status(500).json({ error:'Failed' });
  }
}

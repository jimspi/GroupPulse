import { useState } from 'react';

export default function Home() {
  const emojis = ['😄','😊','😌','😐','😶','😞','😢','😰','😫','😤','😟','🫣'];
  const reasonsList = [
    'Family','Friends','Partner','Loneliness','Job','Finances',
    'Burnout','Body Image','Health','Addiction','Safety','Overthinking'
  ];

  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [response, setResponse] = useState(null);

  const toggleReason = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const submitCheckIn = async () => {
    if (!selectedEmoji) {
      alert("Please select a mood emoji.");
      return;
    }
    const res = await fetch('/api/gpt-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: selectedEmoji, reasons: selectedReasons })
    });
    const data = await res.json();
    setResponse(data);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: 800, margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>🧠 GroupPulse Check-In</h1>

      <div style={{ marginBottom: 30 }}>
        <h3>1. How are you feeling today?</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {emojis.map(e => (
            <button key={e}
              onClick={() => setSelectedEmoji(e)}
              style={{
                fontSize: 24, padding: '10px 15px',
                background: selectedEmoji === e ? '#d0f0fd' : '#fff',
                border: '1px solid #ccc', borderRadius: 10
              }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3>2. What's contributing to this feeling?</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {reasonsList.map(reason => (
            <button key={reason}
              onClick={() => toggleReason(reason)}
              style={{
                padding: '8px 12px',
                fontSize: 16,
                background: selectedReasons.includes(reason) ? '#d0f0fd' : '#fff',
                border: '1px solid #ccc', borderRadius: 8
              }}>
              {reason}
            </button>
          ))}
        </div>
      </div>

      <button onClick={submitCheckIn}
        style={{
          display: 'block', margin: '0 auto', padding: '12px 20px',
          fontSize: 18, background: '#1d9bf0', color: '#fff',
          border: 'none', borderRadius: 8
        }}>
        Submit Check-In
      </button>

      {response && (
        <div style={{ marginTop: 30, background: '#e3f6f5', padding: 20, borderRadius: 10 }}>
          <h3>Your AI Reflection</h3>
          <p><strong>💬 Message:</strong> {response.aiMessage}</p>
          <p><strong>🧘 Suggestion:</strong> {response.aiSuggestion}</p>
          <p><strong>💡 Affirmation:</strong> {response.aiAffirmation}</p>
        </div>
      )}
    </div>
  );
}


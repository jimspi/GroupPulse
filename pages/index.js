// FILE: pages/index.js
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleReason = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const submitCheckIn = async () => {
    setError(null);
    setResponse(null);
    setLoading(true);

    if (!selectedEmoji) {
      alert("Please select a mood emoji.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/gpt-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedEmoji, reasons: selectedReasons })
      });

      if (!res.ok) {
        setError(`API error: ${res.status}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResponse(data);
      setLoading(false);
    } catch (e) {
      console.error("Fetch error", e);
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <header>
          <h1>🧠 GroupPulse Check-In</h1>
          <p className="subtitle">Share your mood. Get a supportive AI reflection.</p>
        </header>

        <div className="card">
          <section>
            <h2>1. How are you feeling today?</h2>
            <div className="buttons-grid emojis">
              {emojis.map(e => (
                <button
                  key={e}
                  className={`button emoji ${selectedEmoji === e ? 'selected' : ''}`}
                  onClick={() => setSelectedEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2>2. What’s contributing to this feeling?</h2>
            <div className="buttons-grid reasons">
              {reasonsList.map(reason => (
                <button
                  key={reason}
                  className={`button reason ${selectedReasons.includes(reason) ? 'selected' : ''}`}
                  onClick={() => toggleReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
          </section>

          <button
            className="submit-button"
            onClick={submitCheckIn}
            disabled={loading}
          >
            {loading ? 'Processing…' : 'Submit Check-In'}
          </button>
        </div>

        {loading && (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {response && (
          <div className="response-card">
            <h3>Your AI Reflection</h3>
            <p><strong>💬 Message:</strong> {response.aiMessage}</p>
            <p><strong>🧘 Suggestion:</strong> {response.aiSuggestion}</p>
            <p><strong>💡 Affirmation:</strong> {response.aiAffirmation}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 720px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          color: #333;
        }
        header {
          text-align: center;
          margin-bottom: 30px;
        }
        header h1 {
          margin: 0;
          font-size: 2.5rem;
          color: #1d4ed8;
        }
        .subtitle {
          margin-top: 8px;
          font-size: 1rem;
          color: #555;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-bottom: 20px;
        }
        section + section {
          margin-top: 25px;
        }
        h2 {
          font-size: 1.2rem;
          margin-bottom: 12px;
          color: #1e40af;
        }
        .buttons-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .button:hover {
          background: #e5e7eb;
        }
        .button.selected {
          background: #bfdbfe;
          border-color: #3b82f6;
        }
        .emoji {
          font-size: 1.5rem;
        }
        .submit-button {
          display: block;
          width: 100%;
          margin-top: 30px;
          padding: 14px;
          font-size: 1.1rem;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-button:hover {
          background: #2563eb;
        }
        .submit-button:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }
        .spinner-container {
          text-align: center;
          margin: 20px 0;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 4px solid #d1d5db;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .response-card {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 20px;
          border-radius: 8px;
        }
        .response-card h3 {
          margin-top: 0;
          color: #065f46;
        }
        .response-card p {
          margin: 8px 0;
        }
        .error {
          color: #b91c1c;
          background: #fee2e2;
          border-left: 4px solid #f87171;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
}




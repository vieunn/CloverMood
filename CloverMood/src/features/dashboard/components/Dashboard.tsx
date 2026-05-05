import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { API_CONFIG } from '../../../config/api';

type Mood = 'Happy' | 'Peaceful' | 'Calm' | 'Stressed' | 'Neutral' | 'Sad' | null;

const moodEmojis: Record<string, string> = {
  Happy: '😄',
  Peaceful: '😇',
  Calm: '😌',
  Stressed: '😭',
  Neutral: '😐',
  Sad: '😔',
};

const moodAnimationStyles = `
  @keyframes moodSquish {
    0% { transform: scale(1); }
    100% { transform: scale(0.95); }
  }

  @keyframes moodPop {
    0% { transform: scale(1); }
    100% { transform: scale(1.02); }
  }

  @keyframes moodGlow {
    0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
    100% { box-shadow: 0 0 20px 8px rgba(5, 150, 105, 0.1); }
  }

  @keyframes emojiSpring {
    0% { transform: translateY(0) scale(1); opacity: 0.7; filter: grayscale(0.3); }
    100% { transform: translateY(-8px) scale(1.15); opacity: 1; filter: grayscale(0); }
  }

  .mood-button-pressing {
    animation: moodSquish 0.1s ease-out forwards !important;
  }

  .mood-button-selected {
    animation: moodPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .mood-button-selected::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    animation: moodGlow 0.6s ease-out forwards;
  }

  .mood-emoji {
    will-change: transform, opacity, filter;
  }

  .mood-emoji.spring {
    animation: emojiSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
`;

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const moods: Mood[] = ['Happy', 'Peaceful', 'Calm', 'Stressed', 'Neutral', 'Sad'];

  const handleMoodClick = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleSave = async () => {
    if (!selectedMood) {
      setError('Please select a mood first');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // 1. Get stored credentials
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      console.log('Dashboard handleSave - localStorage contents:', { authToken: token ? token.substring(0, 20) + '...' : null, userId });

      if (!token || !userId) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      // 2. Send mood with Authorization header
      const moodResponse = await fetch(API_CONFIG.MOODS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          moodValue: selectedMood,
          note,
        }),
      });

      const data = await moodResponse.json();

      if (!moodResponse.ok) {
        setError(data.message || 'Failed to save mood');
        setLoading(false);
        return;
      }

      setMessage('Mood saved successfully! 🎉');
      setSelectedMood(null);
      setNote('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving mood:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <style>{moodAnimationStyles}</style>
      
      {/* Header Navigation */}
      <header style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '18px',
          color: '#059669',
          letterSpacing: '0.05em',
        }}>
          <Leaf style={{ width: '24px', height: '24px' }} />
          <span>CLOVERMOOD</span>
        </div>
        <nav style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
        }}>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: '#059669',
              fontWeight: '500',
              fontSize: '14px',
              borderBottom: '3px solid #059669',
              paddingBottom: '4px',
            }}
          >
            Home
          </Link>
          <Link
            to="/history"
            style={{
              textDecoration: 'none',
              color: '#6B7280',
              fontWeight: '500',
              fontSize: '14px',
              paddingBottom: '4px',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#059669';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            History
          </Link>
          <Link
            to="/statistics"
            style={{
              textDecoration: 'none',
              color: '#6B7280',
              fontWeight: '500',
              fontSize: '14px',
              paddingBottom: '4px',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#059669';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#6B7280';
            }}
          >
            Statistics
          </Link>
          <Link
            to="/profile"
            style={{
              textDecoration: 'none',
              color: '#6B7280',
              fontWeight: '500',
              fontSize: '14px',
              paddingBottom: '4px',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#059669';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#6B7280';
            }}
          >
            Profile
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>How are you feeling today?</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>Select a mood to get started</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 16px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: selectedMood === mood ? '#059669' : '#E5E7EB',
                  backgroundColor: selectedMood === mood ? '#f0fdf4' : '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  outline: 'none',
                }}
                onMouseOver={(e) => {
                  if (selectedMood !== mood) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#86EFAC';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedMood !== mood) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <span style={{ fontSize: '40px', marginBottom: '8px', display: 'block' }}>
                  {mood && moodEmojis[mood]}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{mood}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '14px',
                }}>
                  {error}
                </div>
              )}

              {message && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  color: '#16A34A',
                  fontSize: '14px',
                }}>
                  {message}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Add a note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's on your mind?"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '120px',
                    resize: 'vertical',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#9CA3AF' : '#059669',
                  color: 'white',
                  fontWeight: '500',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#047857';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#059669';
                  }
                }}
              >
                {loading ? 'Saving Mood...' : 'Save Mood Entry'}
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

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
    pointer-events: none;
  }

  .mood-emoji-spring {
    display: inline-block;
    animation: emojiSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
`;

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);
  const [thought, setThought] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [pressingMood, setPressingMood] = useState<Mood>(null);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedMood) {
      setError('Please select a mood to continue');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/mood/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          thought: thought.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to save check-in. Please try again.');
        return;
      }

      setSuccess(true);
      setSelectedMood(null);
      setThought('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Check-in error:', err);
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <>
      <style>{moodAnimationStyles}</style>
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      color: '#111827',
      backgroundColor: '#F9FAFB',
    }}>
      {/* Navigation Header */}
      <header style={{
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#059669',
          fontWeight: 'bold',
          fontSize: '20px',
          letterSpacing: '-0.025em',
        }}>
          <Leaf style={{ width: '24px', height: '24px' }} />
          <span>CLOVERMOOD</span>
        </div>
        <nav style={{ display: 'flex', gap: '32px' }}>
          <Link to="/dashboard" style={{ color: '#059669', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
          <a href="#" style={{ color: '#6B7280', fontWeight: '500', textDecoration: 'none' }}>History</a>
          <a href="#" style={{ color: '#6B7280', fontWeight: '500', textDecoration: 'none' }}>Statistics</a>
          <Link to="/profile" style={{ color: '#6B7280', fontWeight: '500', textDecoration: 'none' }}>Profile</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '48px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            letterSpacing: '-0.025em',
            color: '#111827',
            marginBottom: '8px',
          }}>
            Hello, User!
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '16px' }}>
            {formatDate()}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#D1FAE5',
            border: '1px solid #6EE7B7',
            color: '#059669',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            ✓ Your mood check-in has been saved!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
        }}>
          {/* Left Column - Mood Selection */}
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '24px',
            }}>
              How are you feeling?
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}>
              {(Object.keys(moodEmojis) as Array<Exclude<Mood, null>>).map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  onMouseDown={() => setPressingMood(mood)}
                  onMouseUp={() => setPressingMood(null)}
                  style={{
                    padding: '24px 16px',
                    borderRadius: '12px',
                    border: selectedMood === mood ? '2px solid #059669' : '1px solid #E5E7EB',
                    backgroundColor: selectedMood === mood ? '#F0FDF4' : 'white',
                    color: '#111827',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className={`${pressingMood === mood ? 'mood-button-pressing' : ''} ${selectedMood === mood ? 'mood-button-selected' : ''}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(5, 150, 105, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    setPressingMood(null);
                    e.currentTarget.style.borderColor = selectedMood === mood ? '#059669' : '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span className={selectedMood === mood ? 'mood-emoji-spring' : ''}>{moodEmojis[mood]}</span>
                  <span style={{ fontSize: '12px', fontWeight: '500', marginTop: '4px' }}>{mood}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Thoughts */}
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '24px',
            }}>
              What's making you feel this way?
            </h2>

            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="Write your thoughts here..."
              style={{
                width: '100%',
                minHeight: '250px',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'white',
                color: '#111827',
                fontSize: '14px',
                fontFamily: 'system-ui, sans-serif',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#059669';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: selectedMood ? '#059669' : '#D1D5DB',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: selectedMood && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (selectedMood && !loading) {
                e.currentTarget.style.backgroundColor = '#047857';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedMood && !loading) {
                e.currentTarget.style.backgroundColor = '#059669';
              }
            }}
          >
            {loading ? 'Saving...' : 'Complete Check-in'}
          </button>
          {!selectedMood && (
            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              marginTop: '8px',
              position: 'absolute',
              marginLeft: '-100px',
            }}>
              Please select a mood to continue
            </p>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
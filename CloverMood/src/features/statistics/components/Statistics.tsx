import React, { useState, useEffect } from 'react';
import { Flame, Activity, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { StatisticsData } from '../types';
import { statisticsService } from '../services/statisticsService';

// Mood emoji mapping
const MOOD_EMOJIS: Record<string, string> = {
  happy: '☀️',
  sad: '☔',
  energetic: '⚡',
  calm: '🧘',
  peaceful: '☮️',
  focused: '🎯',
  stressed: '😰',
  excited: '🎉',
  neutral: '😐',
  meh: '😐',
  radiant: '☀️',
  tired: '😴',
  anxious: '😰',
  content: '😌',
  frustrated: '😤',
};

// Motivational messages based on mood stats
const getMotivationalMessage = (percentage: number): string => {
  if (percentage >= 80) return "You're crushing it! Keep up the positive vibes! 🚀";
  if (percentage >= 60) return "Great job maintaining this mood! Keep going! 💪";
  if (percentage >= 40) return "Nice balance! Keep tracking your progress! 📈";
  return "Every moment counts. Keep logging your feelings! 📝";
};

export const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = localStorage.getItem('userId');

        if (!userId) {
          setError('Please log in to view statistics.');
          setLoading(false);
          return;
        }

        const data = await statisticsService.getStatistics(userId);
        setStats(data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const moodEmoji = stats
    ? MOOD_EMOJIS[stats.most_frequent_mood.mood.toLowerCase()] || '😐'
    : '😐';

  const maxWeeklyCount = stats
    ? Math.max(...stats.weekly_overview.map((d) => d.count), 10)
    : 10;

  const maxMonthlyCount = stats
    ? Math.max(...stats.monthly_overview.map((d) => d.count), 10)
    : 10;

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* Header Navigation */}
      <header style={styles.header}>
        <div
          style={{
            fontWeight: '600',
            fontSize: '18px',
            color: '#059669',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Leaf style={{ width: '24px', height: '24px' }} />
          <span>CLOVERMOOD</span>
        </div>
        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navLink}>
            Home
          </Link>
          <Link to="/history" style={styles.navLink}>
            History
          </Link>
          <Link to="/statistics" style={{ ...styles.navLink, color: '#059669', borderBottom: '3px solid #059669', paddingBottom: '4px' }}>
            Statistics
          </Link>
          <Link to="/profile" style={styles.navLink}>
            Profile
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          {/* Header Section */}
          <div className="stats-header">
            <h1 className="stats-title">STATISTICS</h1>
            <p className="stats-subtitle">Get mood insights</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading your statistics...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p className="error-text">{error}</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && stats && (
            <>
              {/* Top Row: Most Frequent Mood + Metrics */}
              <div className="top-section">
                {/* Most Frequent Mood Card */}
                <div className="most-frequent-mood-card">
                  <div className="mood-emoji-display">{moodEmoji}</div>
                  <h2 className="mood-name">{stats.most_frequent_mood.mood.toUpperCase()}</h2>
                  <p className="mood-percentage">{stats.most_frequent_mood.percentage}% of the time</p>
                  <p className="mood-count">{stats.most_frequent_mood.count} entries</p>
                  <p className="motivational-message">{getMotivationalMessage(stats.most_frequent_mood.percentage)}</p>
                </div>

                {/* Right Column Metrics */}
                <div className="metrics-column">
                  {/* Total Entries */}
                  <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#dbeafe' }}>
                      <Activity size={24} style={{ color: '#0284c7' }} />
                    </div>
                    <div className="metric-info">
                      <p className="metric-label">Total Entries</p>
                      <p className="metric-value">{stats.total_entries}</p>
                    </div>
                  </div>

                  {/* Day Streak */}
                  <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#fef3c7' }}>
                      <Flame size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="metric-info">
                      <p className="metric-label">Day Streak</p>
                      <p className="metric-value">{stats.day_streak}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-section">
                {/* Weekly Overview Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">WEEKLY OVERVIEW</h3>
                    <p className="chart-subtitle">Frequency per day</p>
                  </div>
                  <div className="chart-container">
                    <div className="bar-chart">
                      <div className="chart-y-axis">
                        <span className="y-label">{maxWeeklyCount}</span>
                        <span className="y-label">{Math.floor(maxWeeklyCount / 2)}</span>
                        <span className="y-label">0</span>
                      </div>
                      <div className="bars-wrapper">
                        {stats.weekly_overview.map((day, index) => (
                          <div key={index} className="bar-group">
                            <div className="bar-container">
                              <div
                                className="bar"
                                style={{
                                  height: `${(day.count / maxWeeklyCount) * 100}%`,
                                  backgroundColor: '#059669',
                                }}
                                title={`${day.day}: ${day.count}`}
                              ></div>
                            </div>
                            <span className="bar-label">{day.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Overview Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">MONTHLY OVERVIEW</h3>
                    <p className="chart-subtitle">Avg Moods per Week</p>
                  </div>
                  <div className="chart-container">
                    <div className="bar-chart">
                      <div className="chart-y-axis">
                        <span className="y-label">{maxMonthlyCount}</span>
                        <span className="y-label">{Math.floor(maxMonthlyCount / 2)}</span>
                        <span className="y-label">0</span>
                      </div>
                      <div className="bars-wrapper">
                        {stats.monthly_overview.map((week, index) => (
                          <div key={index} className="bar-group">
                            <div className="bar-container">
                              <div
                                className="bar"
                                style={{
                                  height: `${(week.count / maxMonthlyCount) * 100}%`,
                                  backgroundColor: '#3b82f6',
                                }}
                                title={`${week.week}: ${week.count}`}
                              ></div>
                            </div>
                            <span className="bar-label">{week.week}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  nav: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  } as const,
  navLink: {
    textDecoration: 'none',
    color: '#6B7280',
    fontWeight: '500' as const,
    fontSize: '14px',
    paddingBottom: '4px',
    transition: 'color 0.2s ease',
  },
  mainContent: {
    flex: 1,
    padding: '24px',
  } as const,
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as const,
};

// CSS Styles
const cssStyles = `
  * {
    box-sizing: border-box;
  }

  /* Header */
  .stats-header {
    margin-bottom: 32px;
    text-align: center;
  }

  .stats-title {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
    letter-spacing: 0.05em;
  }

  .stats-subtitle {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
    font-weight: 400;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top-color: #059669;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  /* Error State */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
    background-color: #fee2e2;
    border-radius: 12px;
    border: 1px solid #fecaca;
  }

  .error-text {
    font-size: 16px;
    color: #991b1b;
    margin: 0;
  }

  /* Top Section */
  .top-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }

  /* Most Frequent Mood Card */
  .most-frequent-mood-card {
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    border: 2px solid #059669;
    border-radius: 24px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(5, 150, 105, 0.12);
  }

  .mood-emoji-display {
    font-size: 72px;
    margin-bottom: 16px;
    line-height: 1;
  }

  .mood-name {
    font-size: 36px;
    font-weight: 700;
    color: #059669;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .mood-percentage {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .mood-count {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
  }

  .motivational-message {
    font-size: 15px;
    color: #047857;
    font-weight: 500;
    margin: 0;
    font-style: italic;
  }

  /* Metrics Column */
  .metrics-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .metric-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .metric-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .metric-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .metric-info {
    flex: 1;
  }

  .metric-label {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 4px 0 0 0;
  }

  /* Charts Section */
  .charts-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .chart-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .chart-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .chart-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chart-subtitle {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }

  .chart-container {
    overflow-x: auto;
    padding-top: 12px;
  }

  .bar-chart {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    min-height: 200px;
  }

  .chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    padding-right: 12px;
    height: 200px;
    border-right: 1px solid #e5e7eb;
  }

  .y-label {
    font-size: 11px;
    color: #9ca3af;
    line-height: 1;
  }

  .bars-wrapper {
    display: flex;
    gap: 12px;
    flex: 1;
    align-items: flex-end;
  }

  .bar-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    flex: 1;
  }

  .bar-container {
    width: 100%;
    height: 200px;
    background-color: #f9fafb;
    border-radius: 8px 8px 0 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    overflow: hidden;
  }

  .bar {
    width: 100%;
    border-radius: 6px 6px 0 0;
    min-height: 4px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .bar:hover {
    opacity: 0.8;
    filter: brightness(1.1);
  }

  .bar-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-align: center;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .top-section {
      grid-template-columns: 1fr;
    }

    .charts-section {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .most-frequent-mood-card {
      padding: 24px;
    }

    .mood-emoji-display {
      font-size: 56px;
    }

    .mood-name {
      font-size: 28px;
    }

    .mood-percentage {
      font-size: 20px;
    }

    .stats-title {
      font-size: 24px;
    }

    .chart-card {
      padding: 16px;
    }

    .bar-container {
      height: 150px;
    }

    .bar-chart {
      min-height: 150px;
    }

    .chart-y-axis {
      height: 150px;
      font-size: 10px;
    }
  }
`;

export default Statistics;

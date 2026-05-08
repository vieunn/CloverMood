import React, { useState, useMemo, useEffect } from 'react';
import { Search, Smile, Target, Zap, Clock, AlertCircle, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../../../config/api';
import { getAuthHeaders } from '../../../shared/utils/api';

// ============================================================================
// Types & Interfaces
// ============================================================================

type ActivityType = 'mood' | 'goal' | 'system';

interface ApiActivityResponse {
  id: string;
  userId: string;
  moodValue?: string;
  mood_value?: string;
  activity_type?: string;
  activityType?: string;
  note?: string;
  description: string;
  timestamp: string;
  type?: string;
  intensity?: number;
  level?: number;
}

interface HistoryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  timestamp: Date;
  type: ActivityType;
  icon: React.ReactNode;
  color: string;
  moodValue?: string;
  moodEmoji?: string;
  note?: string;
  intensity?: number;
}

// Mood emoji mapping
const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  sad: '😢',
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

// ============================================================================
// Helper function to map API response to HistoryItem
const mapApiResponseToHistoryItem = (item: ApiActivityResponse): HistoryItem => {
  const activityType = item.activity_type || item.activityType || item.type || 'mood';
  
  // Determine the type - if activity_type is "mood_recorded", treat as mood type
  let type: ActivityType = 'mood';
  if (activityType.toLowerCase().includes('goal')) {
    type = 'goal';
  } else if (activityType.toLowerCase().includes('system')) {
    type = 'system';
  } else {
    type = 'mood'; // Default to mood for mood_recorded and other mood-related activities
  }

  let icon: React.ReactNode;
  let color: string;
  let moodEmoji = '';

  // Extract mood value - handle both camelCase and snake_case from API
  const moodValueRaw = item.moodValue || item.mood_value || '';
  const moodValueLower = moodValueRaw.toLowerCase().trim();
  moodEmoji = MOOD_EMOJIS[moodValueLower] || '😐';

  switch (type) {
    case 'goal':
      icon = <Target size={20} />;
      color = '#3b82f6'; // Blue
      break;
    case 'system':
      icon = <Zap size={20} />;
      color = '#f59e0b'; // Amber
      break;
    case 'mood':
    default:
      icon = <Smile size={20} />;
      color = '#059669'; // Emerald
      break;
  }

  // Format title: "{mood_value} Mood" e.g., "Happy Mood", "Peaceful Mood"
  const formattedMoodName = moodValueLower
    ? moodValueLower.charAt(0).toUpperCase() + moodValueLower.slice(1)
    : 'Unknown';

  return {
    id: item.id,
    title: type === 'mood' ? `${formattedMoodName} Mood` : `${type.charAt(0).toUpperCase() + type.slice(1)} Entry`,
    category: type.charAt(0).toUpperCase() + type.slice(1),
    description: item.note || item.description || `Logged "${moodValueRaw || 'activity'}"`,
    timestamp: new Date(item.timestamp),
    type,
    icon,
    color,
    moodValue: moodValueRaw,
    moodEmoji,
    note: item.note,
    intensity: item.intensity || item.level || 5,
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return 'Now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// ============================================================================
// Main Component
// ============================================================================

export const ActivityHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(3);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch activity history from API
  useEffect(() => {
    const fetchActivityHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');

        if (!token) {
          setError('Please log in to view your activity history.');
          setLoading(false);
          return;
        }

        console.log('Fetching activity history with token:', token.substring(0, 20) + '...');
        console.log('Using endpoint:', API_CONFIG.ACTIVITY.HISTORY);
        
        const headers = getAuthHeaders();
        console.log('Headers:', headers);

        // Fetch from API
        const response = await fetch(API_CONFIG.ACTIVITY.HISTORY, {
          method: 'GET',
          headers: headers,
          credentials: 'include',
          mode: 'cors',
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          throw new Error('Failed to fetch activity history');
        }

        const data: ApiActivityResponse[] = await response.json();

        // Map API response to HistoryItem and sort by timestamp descending
        const mappedData = data
          .map(mapApiResponseToHistoryItem)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setHistoryData(mappedData);
      } catch (err) {
        console.error('Error fetching activity history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load activity history');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityHistory();
  }, []);

  // Search and filter logic
  const filteredHistory = useMemo(() => {
    let result = historyData;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, historyData]);

  const displayedItems = filteredHistory.slice(0, displayCount);
  const hasMore = displayCount < filteredHistory.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 3);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <style>{styles}</style>

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
          fontWeight: '600',
          fontSize: '18px',
          color: '#059669',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
            Home
          </Link>
          <Link
            to="/history"
            style={{
              textDecoration: 'none',
              color: '#059669',
              fontWeight: '500',
              fontSize: '14px',
              borderBottom: '3px solid #059669',
              paddingBottom: '4px',
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <style>{styles}</style>

          {/* Header */}
          <div className="activity-header">
            <h1 className="activity-title">Mood History</h1>
            <p className="activity-subtitle">Track your daily mood entries and emotional patterns</p>
          </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search moods or notes..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-state">
          <AlertCircle size={48} className="error-state-icon" />
          <h2 className="error-state-title">Unable to Load History</h2>
          <p className="error-state-description">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your activity history...</p>
        </div>
      )}

      {/* Activity List or Empty State */}
      {!loading && !error && displayedItems.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">No Activities Found</h2>
          <p className="empty-state-description">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Start tracking your moods and goals to see your history here.'}
          </p>
        </div>
      ) : (
        <div className="activity-list">
          {displayedItems.map((item) => (
            <div key={item.id} className="mood-card">
              {/* Left Column: Visual */}
              <div className="mood-visual">
                <div className="mood-icon-circle">
                  {item.type === 'mood' && item.moodEmoji ? (
                    <span className="mood-icon-emoji">{item.moodEmoji}</span>
                  ) : (
                    <div style={{ color: item.color }}>{item.icon}</div>
                  )}
                </div>
                {/* Intensity Bar */}
                <div className="mood-intensity-bar">
                  <div 
                    className="mood-intensity-fill" 
                    style={{ height: `${(item.intensity || 5) * 10}%` }}
                  ></div>
                </div>
              </div>

              {/* Right Column: Info */}
              <div className="mood-info">
                <div className="mood-header-row">
                  <h3 className="mood-title">
                    {item.title}
                  </h3>
                  <span className="mood-timestamp">{formatTime(item.timestamp)}</span>
                </div>
                
                {item.note && <p className="mood-description">{item.note}</p>}
                
                <div className="mood-actions-row">
                  <button 
                    className="view-details-btn"
                    onClick={() => toggleExpand(item.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === item.id && (
                <div className="mood-expanded-details">
                  <div className="mood-details-content">
                    {item.type === 'mood' && item.moodValue && (
                      <p className="mood-detail-text">
                        <strong>Mood:</strong> {item.title}
                      </p>
                    )}
                    {item.note && (
                      <p className="mood-detail-text">
                        <strong>Note:</strong> {item.note}
                      </p>
                    )}
                    <p className="mood-detail-text">
                      <strong>Recorded:</strong> {item.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!loading && !error && hasMore && displayedItems.length > 0 && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Styles (Pure CSS)
// ============================================================================

const styles = `
  * {
    box-sizing: border-box;
  }

  .activity-history-container {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* ========== Header ========== */
  .activity-header {
    margin-bottom: 32px;
    text-align: center;
  }

  .activity-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .activity-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  /* ========== Search & Filter Bar ========== */
  .search-filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-input-wrapper {
    flex: 1;
    min-width: 240px;
    display: flex;
    align-items: center;
    background-color: #f9fafb;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
    padding: 10px 14px;
    transition: all 0.2s ease;
  }

  .search-input-wrapper:focus-within {
    border-color: #059669;
    background-color: #f0fdf4;
  }

  .search-icon {
    color: #6b7280;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #111827;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: #d1d5db;
  }

  /* ========== Empty State ========== */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
  }

  .empty-state-icon {
    color: #d1d5db;
    margin-bottom: 16px;
  }

  .empty-state-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .empty-state-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    max-width: 400px;
  }

  /* ========== Error State ========== */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
  }

  .error-state-icon {
    color: #ef4444;
    margin-bottom: 16px;
  }

  .error-state-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .error-state-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    max-width: 400px;
  }

  /* ========== Loading State ========== */
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

  /* ========== Activity List ========== */
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .activity-item {
    background-color: white;
    border: 1px solid #f3f4f6;
    border-left: 4px solid #059669;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
  }

  .activity-item:hover {
    border-color: #059669;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.12);
  }

  /* ========== Mood Card Layout ========== */
  .mood-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 20px;
    display: flex;
    gap: 24px;
    transition: all 0.3s ease;
    margin-bottom: 12px;
  }

  .mood-card:hover {
    border-color: #059669;
    box-shadow: 0 4px 16px rgba(5, 150, 105, 0.15);
    transform: translateX(8px);
  }

  /* ========== Left Column: Visual Strip ========== */
  .mood-visual {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .mood-icon-circle {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background-color: #f9fafb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #059669;
    font-size: 28px;
    flex-shrink: 0;
  }

  .mood-icon-emoji {
    font-size: 28px;
    line-height: 1;
  }

  .mood-intensity-bar {
    position: relative;
    width: 4px;
    height: 80px;
    background-color: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .mood-intensity-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #059669;
    border-radius: 2px;
    transition: height 0.3s ease;
  }

  /* ========== Right Column: Info ========== */
  .mood-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mood-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .mood-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    text-transform: capitalize;
  }

  .mood-timestamp {
    font-size: 12px;
    color: #9ca3af;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .mood-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }

  .mood-actions-row {
    margin-top: 4px;
  }

  .view-details-btn {
    background: none;
    border: none;
    color: #059669;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: color 0.2s ease;
    font-family: inherit;
  }

  .view-details-btn:hover {
    color: #047857;
    text-decoration: underline;
  }

  /* ========== Expanded Details ========== */
  .mood-expanded-details {
    grid-column: 1 / -1;
    margin-top: 12px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
  }

  .mood-details-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mood-detail-text {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }

  .mood-detail-text strong {
    color: #111827;
    font-weight: 600;
  }

  /* ========== Mood Emoji Styling ========== */
  .mood-emoji-box {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0fdf4;
  }

  .mood-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 6px;
    justify-content: space-between;
  }

  .mood-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    text-transform: capitalize;
  }

  .mood-note {
    font-size: 13px;
    color: #6b7280;
    margin: 6px 0 0 0;
    line-height: 1.4;
  }

  .mood-actions {
    margin-top: 8px;
  }

  .view-details-link {
    background: none;
    border: none;
    color: #059669;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: color 0.2s ease;
    font-family: inherit;
  }

  .view-details-link:hover {
    color: #047857;
    text-decoration: underline;
  }

  /* ========== Activity Details ========== */
  .activity-details {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
  }

  /* ========== Responsive Design ========== */
  @media (max-width: 640px) {
    .mood-card {
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .mood-visual {
      flex-direction: row;
      width: 100%;
      justify-content: flex-start;
    }

    .mood-intensity-bar {
      width: 100%;
      height: 4px;
      flex: 1;
      margin-left: 8px;
    }

    .mood-header-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .mood-timestamp {
      align-self: flex-start;
    }

    .mood-title {
      font-size: 16px;
    }

    .mood-description {
      font-size: 13px;
    }

    .search-filter-bar {
      flex-direction: column;
    }

    .search-input-wrapper {
      min-width: 100%;
    }
  }

  /* ========== Load More Button ========== */
  .load-more-container {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }

  .load-more-button {
    padding: 12px 32px;
    border: 1px solid #059669;
    border-radius: 12px;
    background-color: white;
    color: #059669;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .load-more-button:hover {
    background-color: #f0fdf4;
    border-color: #047857;
    color: #047857;
  }

  .load-more-button:active {
    transform: scale(0.98);
  }
`;

export default ActivityHistory;

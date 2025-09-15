import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSearch, FaTimes, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Social.css';

const Social = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeed();
    } else if (activeTab === 'explore') {
      fetchExplore();
    }
  }, [activeTab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'search' && searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const searchUsers = async () => {
    try {
      const response = await fetch(`/api/social/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.success) setSearchResults(data.data);
    } catch (e) {
      console.error('Failed to search users:', e);
    }
  };
  const fetchFeed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setItems([]);
        return;
      }
      const response = await fetch('/api/social/reviews-feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setItems(data.data.reviews);
    } catch (e) {
      console.error('Failed to load feed reviews:', e);
    } finally {
      setLoading(false);
    }
  };
  const fetchExplore = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/social/reviews');
      const data = await response.json();
      if (data.success) setItems(data.data.reviews);
    } catch (e) {
      console.error('Failed to load explore reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateToProfile = (username) => navigate(`/profile/${username}`);
  const handleUsernameClick = (username) => navigateToProfile(username);

  const renderStars = (rating) => (
    <div className="stars-container">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );

  return (
    <div className="social-page">
      <div className="social-container">
        <motion.div 
          className="social-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>UMN Social</h1>
          <div className="social-tabs">
            <button 
              className={`tab-button ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              Feed
            </button>
            <button 
              className={`tab-button ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              Explore
            </button>
            <button 
              className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Find Users
            </button>
          </div>
        </motion.div>
        {(activeTab === 'feed' || activeTab === 'explore') && (
          <div className="timeline">
            {loading && (
              <div className="timeline-loading">
                <div className="loading-spinner" />
                <p>Loading reviews…</p>
              </div>
            )}
            <AnimatePresence>
              {!loading && items.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="review-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="review-avatar" onClick={() => navigateToProfile(post.username)}>
                    {post.avatar_url ? (
                      <img src={post.avatar_url} alt={post.username} />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div className="review-main">
                    <div className="review-headerline">
                      <span
                        className="review-username"
                        onClick={() => handleUsernameClick(post.username)}
                      >
                        @{post.username}
                      </span>
                      <span className="review-action">
                        reviewed{" "}
                        {post.review_type === "professor" ? (
                          <span
                            className="review-target-link"
                            onClick={() => navigate(`/professor/${post.target_id}`)}
                          >
                            Professor {post.professor_name || `#${post.target_id}`}
                          </span>
                        ) : (
                          <span
                            className="review-target-link"
                            onClick={() => navigate(`/course/${post.target_id}`)}
                          >
                            Course #{post.target_id}
                          </span>
                        )}
                      </span>
                      <span className="review-time">· {formatDate(post.created_at)}</span>
                    </div>
                    <div className="review-rating">{renderStars(post.rating)}</div>
                    {post.comment && <p className="review-comment">{post.comment}</p>}
                    {post.is_anonymous && (
                      <div className="anonymous-badge">
                        <FaEyeSlash /> Anonymous
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {activeTab === 'search' && (
          <div className="search-users">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="user-result"
                    onClick={() => navigate(`/profile/${u.username}`)}
                  >
                    <div className="user-avatar">
                      {u.avatar_url ? <img src={u.avatar_url} alt={u.username} /> : <FaUser />}
                    </div>
                    <div className="user-info">
                      <span className="username">@{u.username}</span>
                      <span className="name">{u.full_name || 'Unnamed Student'}</span>
                    </div>
                  </div>
                ))
              ) : (
                searchQuery.length >= 2 && <p>No users found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
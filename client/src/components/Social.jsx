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
      {[1,2,3,4,5].map(star => (
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

        {activeTab === 'search' && (
          <motion.div 
            className="search-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <FaTimes />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Found {searchResults.length} users</h3>
                <div className="users-list">
                  {searchResults.map((u, idx) => (
                    <motion.div
                      key={u.id}
                      className="user-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      onClick={() => navigateToProfile(u.username)}
                    >
                      <div className="user-avatar"><FaUser /></div>
                      <div className="user-info">
                        <h4>@{u.username}</h4>
                        {u.bio && <p>{u.bio}</p>}
                        <div className="user-stats">
                          <span>{u.posts_count} posts</span>
                          <span>{u.followers_count} followers</span>
                          <span>{u.following_count} following</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="no-results">
                <h3>No users found</h3>
                <p>Try searching with a different username</p>
              </div>
            )}

            {searchQuery.length === 0 && (
              <div className="search-suggestions">
                <h3>Find and connect with other UMN students</h3>
                <p>Search by username to discover new people to follow</p>
              </div>
            )}
          </motion.div>
        )}
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
                  className="tweet"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="tweet-content">
                    <div className="tweet-header">
                      <div className="user-avatar" onClick={() => navigateToProfile(post.username)}>
                        {post.avatar_url ? (
                          <img src={post.avatar_url} alt={post.username} />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className="tweet-meta">
                        <span 
                          className="username"
                          onClick={() => handleUsernameClick(post.username)}
                        >
                          @{post.username}
                        </span>
                        <span className="tweet-time">·</span>
                        <span className="tweet-time">{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    <div className="tweet-text">
                      <p>
               
                        <strong>
                          {post.review_type === 'professor'
                            ? `Reviewed Professor ${post.professor_name || '#' + post.target_id}`
                            : `Reviewed Course #${post.target_id}`}
                        </strong>


                      </p>
                      <div className="review-rating">
                        {renderStars(post.rating)}
                      </div>
                      {post.comment && <p className="review-comment">{post.comment}</p>}
                      {post.is_anonymous && (
                        <div className="anonymous-badge">
                          <FaEyeSlash /> Anonymous
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && items.length === 0 && (
              <motion.div 
                className="empty-timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h3>
                  {activeTab === 'feed' 
                    ? 'Your timeline is empty' 
                    : 'No reviews yet'}
                </h3>
                <p>
                  {activeTab === 'feed' 
                    ? 'Follow other users to see their reviews here.' 
                    : 'Be the first to leave a review on a professor or course!'}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
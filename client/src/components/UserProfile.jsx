import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/UserProfile.css';
import professorMap from '../../../data/professor_map.json';

const getProfessorName = (id) => {
  const prof = professorMap.find((p) => p.id === Number(id));
  return prof ? prof.name : `#${id}`;
};

const UserProfile = ({ user: currentUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchUserProfile(); }, [username]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'posts') {
      fetchUserReviews();
    } else if (activeTab === 'followers') {
      fetchFollowers();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
    fetchSuggestions();
  }, [activeTab, user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/social/users/${username}`, { headers });
      const data = await res.json();
      if (data.success) setUser(data.data);
      else setError(data.error || 'Failed to load user');
    } catch (e) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !user?.username) return;

      const response = await fetch(`/api/social/users/${username}/reviews`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);   // ✅ save into reviews state
      }
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
    }
  };


  const fetchFollowers = async () => {
    try {
      const res = await fetch(`/api/social/users/${username}/followers`);
      const data = await res.json();
      if (data.success) setFollowers(data.data);
    } catch (e) {
      console.error('Failed to fetch followers:', e);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await fetch(`/api/social/users/${username}/following`);
      const data = await res.json();
      if (data.success) setFollowing(data.data);
    } catch (e) {
      console.error('Failed to fetch following:', e);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await fetch(`/api/social/suggestions/${user?.id || 'me'}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSuggestions(data.data);
    } catch (e) {
      console.error('Failed to fetch suggestions:', e);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - d) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateToProfile = (uname) => navigate(`/profile/${uname}`);

  const renderStars = (rating) => (
    <div className="stars-container">
      {[1,2,3,4,5].map(star => (
        <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="user-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-profile-error">
        <h2>Profile Not Found</h2>
        <p>{error || 'User not found'}</p>
        <button onClick={() => navigate('/social')} className="back-button">
          <FaArrowLeft /> Back to Social
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="sidebar-content">
              <button onClick={() => navigate('/social')} className="back-button">
                <FaArrowLeft /> Back
              </button>
              <div className="profile-card">
                <div 
                  className="profile-banner"
                  style={{
                    backgroundImage: user?.banner_url 
                      ? `url(${user.banner_url})` 
                      : 'linear-gradient(135deg, var(--primary-medium), var(--primary-light))'
                  }}
                />
                <div className="profile-info">
                  <div className="profile-header">
                    <div className="profile-avatar-container">
                      <div className="profile-avatar">
                        {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" /> : <FaUser />}
                      </div>
                    </div>
                  </div>

                  <div className="profile-details">
                    <div className="profile-names">
                      <h2 className="username">@{user?.username}</h2>
                      <p className="join-date">
                        Joined {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    {user?.bio && (
                      <div className="bio-section">
                        <p className="bio">{user.bio}</p>
                      </div>
                    )}

                    <div className="profile-stats">
                      <button 
                        className={`stat ${activeTab === 'following' ? 'active' : ''}`}
                        onClick={() => setActiveTab('following')}
                      >
                        <span className="stat-number">{user.following_count}</span>
                        <span className="stat-label">Following</span>
                      </button>
                      <button 
                        className={`stat ${activeTab === 'followers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('followers')}
                      >
                        <span className="stat-number">{user.followers_count}</span>
                        <span className="stat-label">Followers</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {suggestions.length > 0 && (
                <div className="suggestions-card">
                  <h3>You might like</h3>
                  <div className="suggestions-list">
                    {suggestions.slice(0, 2).map((s) => (
                      <div key={s.id} className="suggestion-item">
                        <div className="suggestion-user">
                          <div className="suggestion-avatar" onClick={() => navigateToProfile(s.username)}>
                            {s.avatar_url ? <img src={s.avatar_url} alt={s.username} /> : <FaUser />}
                          </div>
                          <div className="suggestion-info">
                            <p className="suggestion-name" onClick={() => navigateToProfile(s.username)}>
                              {s.display_name || s.username}
                            </p>
                            <p className="suggestion-username">@{s.username}</p>
                          </div>
                        </div>
                        <button className="follow-suggestion-btn" onClick={() => navigateToProfile(s.username)}>
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
          <main className="profile-main">
            <div className="profile-tabs">
              <nav className="tabs-nav">
                <button 
                  className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  Reviews
                </button>
                <button 
                  className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('followers')}
                >
                  Followers
                </button>
                <button 
                  className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
                  onClick={() => setActiveTab('following')}
                >
                  Following
                </button>
              </nav>
            </div>

            <div className="profile-content">
              <AnimatePresence mode="wait">
                {activeTab === 'posts' && (
                  <motion.div
                    key="posts"
                    className="posts-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {reviews.length > 0 ? (
                      reviews.map((r) => (
                        <div key={r.id} className="post-item">
                          <div className="post-header">
                            <div className="post-avatar">
                              {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" /> : <FaUser />}
                            </div>
                            <div className="post-content">
                              <div className="post-meta">
                                <span className="post-username">@{user?.username}</span>
                                <span className="post-time">· {formatDate(r.created_at)}</span>
                              </div>
                              <p className="post-text">
                                <strong>
                                  {r.review_type === 'professor'
                                    ? `Reviewed Professor ${r.professor_name || r.target_id}`
                                    : `Reviewed Course #${r.target_id}`}
                                </strong>
                              </p>
                              <div className="post-stars">
                                {renderStars(r.rating)}
                              </div>
                              {r.comment && (
                                <div className="post-review">
                                  <p>{r.comment}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>No reviews yet</h3>
                        <p>@{user.username} hasn’t written any reviews yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'followers' && (
                  <motion.div
                    key="followers"
                    className="users-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {followers.length > 0 ? (
                      followers.map((f, i) => (
                        <motion.div
                          key={f.id}
                          className="user-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          onClick={() => navigateToProfile(f.username)}
                        >
                          <div className="user-avatar"><FaUser /></div>
                          <div className="user-info">
                            <h4>@{f.username}</h4>
                            {f.bio && <p>{f.bio}</p>}
                          </div>
                          <span className="follow-date">Followed {formatDate(f.followed_at)}</span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>No followers yet</h3>
                        <p>@{user.username} doesn’t have any followers yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'following' && (
                  <motion.div
                    key="following"
                    className="users-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {following.length > 0 ? (
                      following.map((fu, i) => (
                        <motion.div
                          key={fu.id}
                          className="user-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          onClick={() => navigateToProfile(fu.username)}
                        >
                          <div className="user-avatar"><FaUser /></div>
                          <div className="user-info">
                            <h4>@{fu.username}</h4>
                            {fu.bio && <p>{fu.bio}</p>}
                          </div>
                          <span className="follow-date">Following {formatDate(fu.followed_at)}</span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>Not following anyone</h3>
                        <p>@{user.username} isn’t following anyone yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
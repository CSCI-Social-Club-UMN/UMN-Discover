import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaYoutube, FaSpotify, FaFacebook, FaDiscord, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaCamera, FaCalendarAlt, FaUserPlus, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = ({ user: propUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(propUser);
  const [loading, setLoading] = useState(!propUser);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    youtube_url: '',
    spotify_url: '',
    facebook_url: '',
    discord_username: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    github_url: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({
    avatar: null,
    banner: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    avatar: null,
    banner: null
  });
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);

  useEffect(() => {
    if (!propUser) {
      fetchUserProfile();
    } else {
      setUser(propUser);
      setFormData({
        username: propUser.username || '',
        display_name: propUser.display_name || '',
        bio: propUser.bio || '',
        youtube_url: propUser.youtube_url || '',
        spotify_url: propUser.spotify_url || '',
        facebook_url: propUser.facebook_url || '',
        discord_username: propUser.discord_username || '',
        twitter_url: propUser.twitter_url || '',
        instagram_url: propUser.instagram_url || '',
        linkedin_url: propUser.linkedin_url || '',
        github_url: propUser.github_url || ''
      });
      setLoading(false);
    }
    fetchSuggestions();
    fetchUserPosts();
  }, [propUser]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        setFormData({
          username: data.data.username || '',
          display_name: data.data.display_name || '',
          bio: data.data.bio || '',
          youtube_url: data.data.youtube_url || '',
          spotify_url: data.data.spotify_url || '',
          facebook_url: data.data.facebook_url || '',
          discord_username: data.data.discord_username || '',
          twitter_url: data.data.twitter_url || '',
          instagram_url: data.data.instagram_url || '',
          linkedin_url: data.data.linkedin_url || '',
          github_url: data.data.github_url || ''
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/social/suggestions/${user?.id || 'me'}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !user?.username) return;

      const response = await fetch(`/api/social/users/${user.username}/reviews`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = (type, file) => {
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => ({ ...prev, [type]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.username.length < 3 || formData.username.length > 30) {
      errors.username = 'Username must be between 3 and 30 characters';
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedFiles.avatar) {
        formDataToSend.append('avatar', selectedFiles.avatar);
      }
      if (selectedFiles.banner) {
        formDataToSend.append('banner', selectedFiles.banner);
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        setIsEditing(false);
        setSelectedFiles({ avatar: null, banner: null });
        setPreviewUrls({ avatar: null, banner: null });
        
        if (data.data.username !== user.username) {
          const userData = JSON.parse(localStorage.getItem('userData'));
          userData.username = data.data.username;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } else {
        setValidationErrors({ general: data.error });
      }
    } catch (error) {
      setValidationErrors({ general: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      display_name: user.display_name || '',
      bio: user.bio || '',
      youtube_url: user.youtube_url || '',
      spotify_url: user.spotify_url || '',
      facebook_url: user.facebook_url || '',
      discord_username: user.discord_username || '',
      twitter_url: user.twitter_url || '',
      instagram_url: user.instagram_url || '',
      linkedin_url: user.linkedin_url || '',
      github_url: user.github_url || ''
    });
    setValidationErrors({});
    setSelectedFiles({ avatar: null, banner: null });
    setPreviewUrls({ avatar: null, banner: null });
    setIsEditing(false);
  };

  const getSocialIcon = (platform) => {
    const icons = {
      youtube: <FaYoutube />,
      spotify: <FaSpotify />,
      facebook: <FaFacebook />,
      discord: <FaDiscord />,
      twitter: <FaTwitter />,
      instagram: <FaInstagram />,
      linkedin: <FaLinkedin />,
      github: <FaGithub />
    };
    return icons[platform];
  };

  const getSocialColor = (platform) => {
    const colors = {
      youtube: '#FF0000',
      spotify: '#1DB954',
      facebook: '#1877F2',
      discord: '#5865F2',
      twitter: '#1DA1F2',
      instagram: '#E4405F',
      linkedin: '#0A66C2',
      github: '#333333'
    };
    return colors[platform];
  };

  const formatSocialUrl = (platform, value) => {
    if (!value) return '';
    
    const baseUrls = {
      youtube: 'https://youtube.com/',
      spotify: 'https://open.spotify.com/user/',
      facebook: 'https://facebook.com/',
      twitter: 'https://twitter.com/',
      instagram: 'https://instagram.com/',
      linkedin: 'https://linkedin.com/in/',
      github: 'https://github.com/'
    };

    if (platform === 'discord') return value;
    
    if (value.startsWith('http')) return value;
    return baseUrls[platform] + value.replace(/^@/, '');
  };

  const handleFollowSuggestion = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/social/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== userId));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="sidebar-content">
              <div className="profile-card">
                <div 
                  className="profile-banner"
                  style={{
                    backgroundImage: previewUrls.banner 
                      ? `url(${previewUrls.banner})` 
                      : user?.banner_url 
                        ? `url(${user.banner_url})` 
                        : 'linear-gradient(135deg, var(--primary-medium), var(--primary-light))'
                  }}
                >
                  {isEditing && (
                    <label className="banner-upload">
                      <FaCamera />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect('banner', e.target.files[0])}
                        hidden
                      />
                    </label>
                  )}
                </div>
                <div className="profile-info">
                  <div className="profile-header">
                    <div className="profile-avatar-container">
                      <div className="profile-avatar">
                        {previewUrls.avatar ? (
                          <img src={previewUrls.avatar} alt="Avatar preview" />
                        ) : user?.avatar_url ? (
                          <img src={user.avatar_url} alt="Avatar" />
                        ) : (
                          <FaUser />
                        )}
                        {isEditing && (
                          <label className="avatar-upload">
                            <FaCamera />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect('avatar', e.target.files[0])}
                              hidden
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      className="edit-profile-btn"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="editing"
                        className="profile-edit-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {validationErrors.general && (
                          <div className="error-message">{validationErrors.general}</div>
                        )}

                        <div className="form-group">
                          <label>Username *</label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className={validationErrors.username ? 'error' : ''}
                            placeholder="Enter username"
                          />
                          {validationErrors.username && (
                            <span className="field-error">{validationErrors.username}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Display Name</label>
                          <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => handleInputChange('display_name', e.target.value)}
                            placeholder="Enter display name"
                          />
                        </div>

                        <div className="form-group">
                          <label>Bio ({formData.bio.length}/500)</label>
                          <textarea
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            className={validationErrors.bio ? 'error' : ''}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            maxLength={500}
                          />
                          {validationErrors.bio && (
                            <span className="field-error">{validationErrors.bio}</span>
                          )}
                        </div>

                        <div className="social-form-section">
                          <h4>Social Media</h4>
                          <button 
                            type="button"
                            className="add-connections-btn"
                            onClick={() => setShowConnectionsModal(true)}
                          >
                            <FaPlus /> Add Social Connections
                          </button>
                        </div>

                        <div className="form-actions">
                          <button 
                            className="save-btn"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            <FaSave />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            <FaTimes />
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="viewing"
                        className="profile-details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="profile-names">
                          <h2 className="username">@{user?.username}</h2>
                          <p className="join-date">Joined {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>

                        {user?.bio && (
                          <div className="bio-section">
                            <p className="bio">{user.bio}</p>
                          </div>
                        )}

                        <div className="profile-stats">
                          <a href="#" className="stat">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Following</span>
                          </a>
                          <a href="#" className="stat">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Followers</span>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {!isEditing && (user?.youtube_url || user?.spotify_url || user?.facebook_url || user?.discord_username || 
                  user?.twitter_url || user?.instagram_url || user?.linkedin_url || user?.github_url) && (
                  <div className="connections-section">
                    <h3>CONNECTIONS</h3>
                    <div className="connections-list">
                      {[
                        { key: 'youtube_url', platform: 'youtube', label: 'YOUTUBE' },
                        { key: 'spotify_url', platform: 'spotify', label: 'SPOTIFY' },
                        { key: 'facebook_url', platform: 'facebook', label: 'FACEBOOK' },
                        { key: 'discord_username', platform: 'discord', label: 'DISCORD' },
                        { key: 'twitter_url', platform: 'twitter', label: 'TWITTER' },
                        { key: 'instagram_url', platform: 'instagram', label: 'INSTAGRAM' },
                        { key: 'linkedin_url', platform: 'linkedin', label: 'LINKEDIN' },
                        { key: 'github_url', platform: 'github', label: 'GITHUB' }
                      ].map(({ key, platform, label }) => {
                        const value = user[key];
                        if (!value) return null;

                        return (
                          <div key={key} className="connection-item">
                            {platform === 'discord' ? (
                              <div className="connection-link">
                                <span className="social-icon" style={{ color: getSocialColor(platform) }}>
                                  {getSocialIcon(platform)}
                                </span>
                                <span className="connection-label">{value}</span>
                              </div>
                            ) : (
                              <a 
                                href={formatSocialUrl(platform, value)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="connection-link"
                              >
                                <span className="social-icon" style={{ color: getSocialColor(platform) }}>
                                  {getSocialIcon(platform)}
                                </span>
                                <span className="connection-label">{label}</span>
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {!isEditing && suggestions.length > 0 && (
                <div className="suggestions-card">
                  <h3>You might like</h3>
                  <div className="suggestions-list">
                    {suggestions.slice(0, 2).map((suggestion) => (
                      <div key={suggestion.id} className="suggestion-item">
                        <div className="suggestion-user">
                          <div 
                            className="suggestion-avatar"
                            onClick={() => navigate(`/profile/${suggestion.username}`)}
                          >
                            {suggestion.avatar_url ? (
                              <img src={suggestion.avatar_url} alt={suggestion.username} />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="suggestion-info">
                            <p className="suggestion-name" onClick={() => navigate(`/profile/${suggestion.username}`)}>
                              {suggestion.display_name || suggestion.username}
                            </p>
                            <p className="suggestion-username">@{suggestion.username}</p>
                          </div>
                        </div>
                        <button 
                          className="follow-suggestion-btn"
                          onClick={() => handleFollowSuggestion(suggestion.id)}
                        >
                          Follow
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
                  Posts
                </button>
                <button 
                  className={`tab-button ${activeTab === 'replies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('replies')}
                >
                  Replies
                </button>
                <button 
                  className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
                  onClick={() => setActiveTab('media')}
                >
                  Media
                </button>
              </nav>
            </div>
            <div className="posts-content">
              {activeTab === 'posts' && (
                <div className="reviews-list">
                  {posts.length > 0 ? (
                    posts.map((review) => (
                      <motion.div
                        key={review.id}
                        className="review-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="review-avatar">
                          {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" />
                          ) : (
                            <FaUser />
                          )}
                        </div>

                        <div className="review-main">
                          <div className="review-headerline">
                            <span className="review-username">@{user?.username}</span>
                            <span className="review-action">
                              reviewed{" "}
                              {review.review_type === "professor" ? (
                                <span
                                  className="review-target-link"
                                  onClick={() => navigate(`/professor/${review.target_id}`)}
                                >
                                  Professor {review.professor_name || `#${review.target_id}`}
                                </span>
                              ) : (
                                <span
                                  className="review-target-link"
                                  onClick={() => navigate(`/course/${review.target_id}`)}
                                >
                                  Course #{review.target_id}
                                </span>
                              )}
                            </span>
                            <span className="review-time">· {formatDate(review.created_at)}</span>
                          </div>

                          <div className="review-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star ${star <= review.rating ? "filled" : ""}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>

                          {review.comment && (
                            <p className="review-comment">{review.comment}</p>
                          )}

                          {review.is_anonymous && (
                            <div className="anonymous-badge">
                              <FaUser /> Anonymous
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="empty-posts">
                      <h3>No reviews yet</h3>
                      <p>You haven’t written any reviews yet.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'replies' && (
                <div className="posts-list">
                  {posts.filter(post => post.is_reply).length > 0 ? (
                    posts.filter(post => post.is_reply).map((post) => (
                      <div key={post.id} className="post-item">
                        <div className="post-header">
                          <div className="post-avatar">
                            {user?.avatar_url ? (
                              <img src={user.avatar_url} alt="Avatar" />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="post-content">
                            <div className="post-meta">
                              <span className="post-username">@{user?.username}</span>
                              <span className="post-time">· {formatDate(post.created_at)}</span>
                            </div>
                            <p className="post-text">{post.content}</p>
                            {post.image_url && (
                              <div className="post-image">
                                <img src={post.image_url} alt="Post content" />
                              </div>
                            )}
                            <div className="post-actions">
                              <button className="action-btn">
                                <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span>{post.likes_count}</span>
                              </button>
                              <button className="action-btn">
                                <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                </svg>
                                <span>{post.comments_count}</span>
                              </button>
                              <button className="action-btn">
                                <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-posts">
                      <h3>No replies yet</h3>
                      <p>Your replies to other posts will appear here.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'media' && (
                <div className="posts-list">
                  {posts.filter(post => post.image_url).length > 0 ? (
                    posts.filter(post => post.image_url).map((post) => (
                      <div key={post.id} className="post-item">
                        <div className="post-header">
                          <div className="post-avatar">
                            {user?.avatar_url ? (
                              <img src={user.avatar_url} alt="Avatar" />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="post-content">
                            <div className="post-meta">
                              <span className="post-username">@{user?.username}</span>
                              <span className="post-time">· {formatDate(post.created_at)}</span>
                            </div>
                            <p className="post-text">{post.content}</p>
                            <div className="post-image">
                              <img src={post.image_url} alt="Post content" />
                            </div>
                            <div className="post-actions">
                              <button className="action-btn">
                                <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span>{post.likes_count}</span>
                              </button>
                              <button className="action-btn">
                                <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                </svg>
                                <span>{post.comments_count}</span>
                              </button>
                              <button className="action-btn">
                                <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-posts">
                      <h3>No media yet</h3>
                      <p>Posts with images will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <AnimatePresence>
        {showConnectionsModal && (
          <motion.div
            className="connections-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConnectionsModal(false)}
          >
            <motion.div
              className="connections-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="connections-modal-header">
                <h3>Add Social Connections</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowConnectionsModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="connections-modal-content">
                {[
                  { key: 'youtube_url', label: 'YouTube', placeholder: 'Channel URL', platform: 'youtube' },
                  { key: 'spotify_url', label: 'Spotify', placeholder: 'Profile URL', platform: 'spotify' },
                  { key: 'facebook_url', label: 'Facebook', placeholder: 'Profile URL', platform: 'facebook' },
                  { key: 'discord_username', label: 'Discord', placeholder: 'Username#1234', platform: 'discord' },
                  { key: 'twitter_url', label: 'Twitter', placeholder: 'Profile URL', platform: 'twitter' },
                  { key: 'instagram_url', label: 'Instagram', placeholder: 'Profile URL', platform: 'instagram' },
                  { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'Profile URL', platform: 'linkedin' },
                  { key: 'github_url', label: 'GitHub', placeholder: 'Profile URL', platform: 'github' }
                ].map(({ key, label, placeholder, platform }) => (
                  <div key={key} className="connection-modal-item">
                    <div className="connection-modal-header">
                      <span className="connection-modal-icon" style={{ color: getSocialColor(platform) }}>
                        {getSocialIcon(platform)}
                      </span>
                      <span className="connection-modal-label">{label}</span>
                    </div>
                    <input
                      type="text"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="connection-modal-input"
                    />
                  </div>
                ))}
              </div>
              
              <div className="connections-modal-actions">
                <button 
                  className="save-connections-btn"
                  onClick={() => setShowConnectionsModal(false)}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
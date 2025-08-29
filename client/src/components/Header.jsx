import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import '../styles/Header.css';

const Header = ({ darkMode, setDarkMode, user, onAuthSuccess, onLogout }) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success && JSON.stringify(data.data) !== JSON.stringify(user)) {
            onAuthSuccess(data.data, token);
          }
        })
        .catch(console.error);
      }
    }
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleAuthSuccess = (userData, token) => {
    onAuthSuccess(userData, token);
    setShowAuthModal(false);
    setShowAccountDropdown(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowAccountDropdown(false);
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }).catch(console.error);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        handleLogout();
        alert('Account deleted successfully');
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account');
    }
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
    setShowAccountDropdown(false);
  };

    return (
    <>
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo-container">
            <motion.div className="logo" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <img src="/gopher_icon.svg" alt="UMN Gopher Logo" className="logo-icon" />
            </motion.div>
            <div>
              <h1 className="app-name">UDiscover</h1>
              <p className="tagline">University of Minnesota</p>
            </div>
          </Link>
          <button
            className={`mobile-menu-btn ${darkMode ? 'dark' : 'light'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <nav className="nav-links desktop-only">
            <Link to="/map">Map</Link>
            <Link to="/clubs">Clubs</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/grades">Grades</Link>
            <Link to="/social">Social</Link>
            <Link to="/professors">Professors</Link>
            <Link to="/studyspots">Study Spots</Link>
            <motion.button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </motion.button>
            <div className="account-dropdown" ref={dropdownRef}>
            <button 
              className="account-button"
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            >
              {user ? (user.displayName || user.username) : 'Account'}
              <FaChevronDown className={`chevron ${showAccountDropdown ? 'rotated' : ''}`} />
            </button>
            <AnimatePresence>
              {showAccountDropdown && (
                <motion.div
                  className="dropdown-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {user ? (
                    <>
                      <Link to="/profile" className="dropdown-item">Profile</Link>
                      <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
                      <button className="dropdown-item delete" onClick={handleDeleteAccount}>Delete Account</button>
                    </>
                  ) : (
                    <button className="dropdown-item" onClick={openAuthModal}>Google Sign In</button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </nav>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              className={`nav-links mobile-only ${darkMode ? 'dark' : 'light'}`}
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 85, opacity: 1 }}
              exit={{ y: -500, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link to="/map" onClick={() => setMobileMenuOpen(false)}>Map</Link>
              <Link to="/clubs" onClick={() => setMobileMenuOpen(false)}>Clubs</Link>
              <Link to="/calendar" onClick={() => setMobileMenuOpen(false)}>Calendar</Link>
              <Link to="/grades" onClick={() => setMobileMenuOpen(false)}>Grades</Link>
              <Link to="/social" onClick={() => setMobileMenuOpen(false)}>Social</Link>
              <Link to="/professors" onClick={() => setMobileMenuOpen(false)}>Professors</Link>
              <Link to="/studyspots" onClick={() => setMobileMenuOpen(false)}>Study Spots</Link>
              <motion.button
                className="theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </motion.button>
                <div className="account-dropdown" ref={dropdownRef}>
                  <button 
                    className="account-button"
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  >
                    {user ? (user.displayName || user.username) : 'Account'}
                    <FaChevronDown className={`chevron ${showAccountDropdown ? 'rotated' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showAccountDropdown && (
                      <motion.div
                        className="dropdown-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {user ? (
                          <>
                            <Link to="/profile" className="dropdown-item">Profile</Link>
                            <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
                            <button className="dropdown-item delete" onClick={handleDeleteAccount}>Delete Account</button>
                          </>
                        ) : (
                          <button className="dropdown-item" onClick={openAuthModal}>Google Sign In</button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(userData, token) => {
          onAuthSuccess(userData, token);
          setShowAuthModal(false);
        }}
      />
    </>
  );
};

export default Header;
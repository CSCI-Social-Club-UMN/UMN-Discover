import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import '../styles/Header.css';

const Header = ({ darkMode, setDarkMode, user, onAuthSuccess, onLogout }) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showClubsDropdown, setShowClubsDropdown] = useState(false);
  const [showMapDropdown, setShowMapDropdown] = useState(false);
  const [showProfGradesDropdown, setShowProfGradesDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
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
    fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }).catch(console.error);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/delete-account', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        handleLogout();
        alert('Account deleted successfully');
      } else alert('Failed to delete account');
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
          <button className={`mobile-menu-btn ${darkMode ? 'dark' : 'light'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <nav className="nav-links desktop-only">
            <div className="multi-dropdown"
                onMouseEnter={() => setShowMapDropdown(true)}
                onMouseLeave={() => setShowMapDropdown(false)}>
              <button className="dropdown-button">
                Navigate <FaChevronDown className={showMapDropdown ? 'rotated' : ''} />
              </button>
              <AnimatePresence>
                {showMapDropdown && (
                  <motion.div className="dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to="/map" className="dropdown-item">Map</Link>
                    <Link to="/studyspots" className="dropdown-item">Study Spots</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="multi-dropdown" onMouseEnter={() => setShowClubsDropdown(true)} onMouseLeave={() => setShowClubsDropdown(false)}>
              <button className="dropdown-button">
                Community <FaChevronDown className={showClubsDropdown ? 'rotated' : ''} />
              </button>
              <AnimatePresence>
                {showClubsDropdown && (
                  <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <Link to="/clubs" className="dropdown-item">Clubs</Link>
                    <Link to="/social" className="dropdown-item">Social</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="multi-dropdown" onMouseEnter={() => setShowProfGradesDropdown(true)} onMouseLeave={() => setShowProfGradesDropdown(false)}>
              <button className="dropdown-button">
                Academics <FaChevronDown className={showProfGradesDropdown ? 'rotated' : ''} />
              </button>
              <AnimatePresence>
                {showProfGradesDropdown && (
                  <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <Link to="/professors" className="dropdown-item">Professors</Link>
                    <Link to="/grades" className="dropdown-item">Grades</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/calendar">Calendar</Link>
            <motion.button className="theme-toggle" onClick={toggleDarkMode} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </motion.button>
            <div className="account-dropdown" ref={dropdownRef}>
              <button className="account-button" onClick={() => setShowAccountDropdown(!showAccountDropdown)}>
                {user ? (user.displayName || user.username) : 'Account'}
                <FaChevronDown className={`chevron ${showAccountDropdown ? 'rotated' : ''}`} />
              </button>
              <AnimatePresence>
                {showAccountDropdown && (
                  <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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
            <motion.nav className={`nav-links mobile-only ${darkMode ? 'dark' : 'light'}`} initial={{ y: -200, opacity: 0 }} animate={{ y: 85, opacity: 1 }} exit={{ y: -500, opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="mobile-dropdown">
                <button className="dropdown-button" onClick={() => setShowClubsDropdown(!showClubsDropdown)}>
                  Community <FaChevronDown className={showClubsDropdown ? 'rotated' : ''} />
                </button>
                <AnimatePresence>
                  {showClubsDropdown && (
                    <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <Link to="/clubs" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>Clubs</Link>
                      <Link to="/social" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>Social</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mobile-dropdown">
                <button className="dropdown-button" onClick={() => setShowProfGradesDropdown(!showProfGradesDropdown)}>
                  Academics <FaChevronDown className={showProfGradesDropdown ? 'rotated' : ''} />
                </button>
                <AnimatePresence>
                  {showProfGradesDropdown && (
                    <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <Link to="/professors" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>Professors</Link>
                      <Link to="/grades" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>Grades</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mobile-dropdown">
                <button className="dropdown-button" onClick={() => setShowMapDropdown(!showMapDropdown)}>
                  Navigate <FaChevronDown className={showMapDropdown ? 'rotated' : ''} />
                </button>
                <AnimatePresence>
                  {showMapDropdown && (
                    <motion.div className="dropdown-menu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to="/map" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>Map</Link>
                      <Link to="/studyspots" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>Study Spots</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/calendar" onClick={() => setMobileMenuOpen(false)}>Calendar</Link>
              <motion.button className="theme-toggle" onClick={toggleDarkMode} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </motion.button>
              <div className="account-dropdown" ref={dropdownRef}>
                <button className="account-button" onClick={() => setShowAccountDropdown(!showAccountDropdown)}>
                  {user ? (user.displayName || user.username) : 'Account'}
                  <FaChevronDown className={`chevron ${showAccountDropdown ? 'rotated' : ''}`} />
                </button>
                <AnimatePresence>
                  {showAccountDropdown && (
                    <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
    </>
  );
};

export default Header;

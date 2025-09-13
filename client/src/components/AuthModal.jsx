import React, { useState, useEffect } from 'react';
import { FaTimes, FaGoogle, FaUniversity } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/AuthModal.css';
import Turnstile from "react-turnstile";

const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE;
const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    const turnstileToken = sessionStorage.getItem("cf_turnstile_token");

    if (!turnstileToken) {
      setLoading(false);
      setError("Please complete CAPTCHA first.");
      return;
    }
    window.location.href = `/api/auth/google?cf_token=${turnstileToken}`;
  };

  const resetForm = () => {
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    sessionStorage.removeItem('oauth_processed');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="auth-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-header">
              <h2>Sign in to UDiscover</h2>
              <button className="close-button" onClick={handleClose}>
                <FaTimes />
              </button>
            </div>
            
            <div className="auth-content">
              <div className="auth-description">
                <FaUniversity className="university-icon" />
                <h3>University of Minnesota Students Only</h3>
                <Turnstile
                  sitekey={siteKey}
                  onVerify={(token) => {
                    sessionStorage.setItem("cf_turnstile_token", token);
                  }}
                />
                <p>Sign in with your UMN Google account to access the platform</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                onClick={handleGoogleLogin}
                className="google-signin-button"
                disabled={loading}
              >
                <FaGoogle className="google-icon" />
                <span>{loading ? 'Signing in...' : 'Sign in with UMN Google'}</span>
              </button>

              <div className="auth-footer">
                <div className="supported-domains">
                  <h4>Supported UMN Email Domains:</h4>
                  <div className="domain-list">
                    <span>@umn.edu</span>
                    <span>@tc.umn.edu</span>
                    <span>@d.umn.edu</span>
                    <span>@r.umn.edu</span>
                    <span>@c.umn.edu</span>
                    <span>@m.umn.edu</span>
                    <span>@crk.umn.edu</span>
                    <span>@morris.umn.edu</span>
                    <span>@duluth.umn.edu</span>
                    <span>@rochester.umn.edu</span>
                  </div>
                </div>
                <div className="security-note">
                  <p>Secure authentication through Google OAuth 2.0</p>
                  <p>Only UMN email addresses are accepted</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
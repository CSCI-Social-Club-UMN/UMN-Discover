import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import passport from '../config/passport.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';

async function verifyTurnstileToken(token) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secretKey}&response=${token}`
  });
  return res.json();
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'umn-discover-secret-key';
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/google', async (req, res, next) => {
  try {
    const cfToken = req.query.cf_token;
    if (!cfToken) {
      return res.status(400).json({ error: "Missing CAPTCHA token" });
    }
    const verify = await verifyTurnstileToken(cfToken);
    console.log("Turnstile verify response:", verify);
    if (!verify.success) {
      return res.status(403).json({ error: "CAPTCHA failed" });
    }
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })(req, res, next);
  } catch (err) {
    console.error("CAPTCHA check error:", err);
    res.status(500).json({ error: "Server error during CAPTCHA check" });
  }
});


router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=auth_failed`);
      }
      const { user, token } = req.user;
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name
      }))}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=server_error`);
    }
  }
);

router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, username, display_name, bio, avatar_url, banner_url, youtube_url, spotify_url, facebook_url, discord_username, twitter_url, instagram_url, linkedin_url, github_url, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    await pool.query('DELETE FROM users WHERE id = $1', [decoded.userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

router.put('/profile', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { 
      username, 
      display_name, 
      bio,
      youtube_url,
      spotify_url,
      facebook_url,
      discord_username,
      twitter_url,
      instagram_url,
      linkedin_url,
      github_url
    } = req.body;

    let avatarUrl = null;
    let bannerUrl = null;
    let oldAvatarPublicId = null;
    let oldBannerPublicId = null;

    const currentUser = await pool.query(
      'SELECT avatar_url, banner_url FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (currentUser.rows[0]) {
      if (currentUser.rows[0].avatar_url) {
        oldAvatarPublicId = extractPublicId(currentUser.rows[0].avatar_url);
      }
      if (currentUser.rows[0].banner_url) {
        oldBannerPublicId = extractPublicId(currentUser.rows[0].banner_url);
      }
    }

    if (req.files) {
      if (req.files.avatar) {
        try {
          const avatarResult = await uploadToCloudinary(req.files.avatar[0].buffer, {
            folder: 'umn-discover/avatars',
            transformation: {
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'face',
              quality: 'auto:good',
              fetch_format: 'auto'
            },
            public_id_prefix: `${decoded.userId}_avatar`
          });
          avatarUrl = avatarResult.secure_url;
          if (oldAvatarPublicId) {
            try {
              await deleteFromCloudinary(oldAvatarPublicId);
            } catch (deleteError) {
              console.warn('Failed to delete old avatar:', deleteError);
            }
          }
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          return res.status(500).json({
            success: false,
            error: 'Failed to upload avatar image'
          });
        }
      }

      if (req.files.banner) {
        try {
          const bannerResult = await uploadToCloudinary(req.files.banner[0].buffer, {
            folder: 'umn-discover/banners',
            transformation: {
              width: 1200,
              height: 400,
              crop: 'fill',
              quality: 'auto:good',
              fetch_format: 'auto'
            },
            public_id_prefix: `${decoded.userId}_banner`
          });
          bannerUrl = bannerResult.secure_url;
          if (oldBannerPublicId) {
            try {
              await deleteFromCloudinary(oldBannerPublicId);
            } catch (deleteError) {
              console.warn('Failed to delete old banner:', deleteError);
            }
          }
        } catch (uploadError) {
          console.error('Banner upload error:', uploadError);
          return res.status(500).json({
            success: false,
            error: 'Failed to upload banner image'
          });
        }
      }
    }
    if (username) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          error: 'Username must be between 3 and 30 characters'
        });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
          success: false,
          error: 'Username can only contain letters, numbers, and underscores'
        });
      }
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, decoded.userId]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Username is already taken'
        });
      }
    }
    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Bio must be less than 500 characters'
      });
    }
    const result = await pool.query(`
      UPDATE users SET 
        username = COALESCE($1, username),
        display_name = $2,
        bio = $3,
        avatar_url = COALESCE($4, avatar_url),
        banner_url = COALESCE($5, banner_url),
        youtube_url = $6,
        spotify_url = $7,
        facebook_url = $8,
        discord_username = $9,
        twitter_url = $10,
        instagram_url = $11,
        linkedin_url = $12,
        github_url = $13
      WHERE id = $14
      RETURNING id, email, username, display_name, bio, avatar_url, banner_url, youtube_url, spotify_url, facebook_url, discord_username, twitter_url, instagram_url, linkedin_url, github_url
    `, [
      username,
      display_name,
      bio,
      avatarUrl,
      bannerUrl,
      youtube_url,
      spotify_url,
      facebook_url,
      discord_username,
      twitter_url,
      instagram_url,
      linkedin_url,
      github_url,
      decoded.userId
    ]);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
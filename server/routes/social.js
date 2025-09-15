import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const professorMapPath = path.resolve(__dirname, '../../data/professor_map.json');
const professorMap = JSON.parse(fs.readFileSync(professorMapPath, 'utf-8'));

function getProfessorName(id) {
  const prof = professorMap.find((p) => p.id === Number(id));
  return prof ? prof.name : `#${id}`;
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
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const authenticateTokenOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.bio,
        u.avatar_url,
        u.created_at,
        COUNT(DISTINCT f1.id) as followers_count,
        COUNT(DISTINCT f2.id) as following_count,
        COUNT(DISTINCT p.id) as posts_count
      FROM users u
      LEFT JOIN user_follows f1 ON u.id = f1.following_id
      LEFT JOIN user_follows f2 ON u.id = f2.follower_id
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE u.username ILIKE $1
      GROUP BY u.id, u.username, u.bio, u.avatar_url, u.created_at
      ORDER BY u.username
      LIMIT 20
    `, [`%${q}%`]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, error: 'Failed to search users' });
  }
});

router.get('/users/:identifier', authenticateTokenOptional, async (req, res) => {
  try {
    const { identifier } = req.params;
    const currentUserId = req.user?.userId;
    let result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.bio,
        u.avatar_url,
        u.banner_url,
        u.display_name,
        u.youtube_url,
        u.spotify_url,
        u.facebook_url,
        u.discord_username,
        u.twitter_url,
        u.instagram_url,
        u.linkedin_url,
        u.github_url,
        u.created_at,
        COUNT(DISTINCT f1.id) as followers_count,
        COUNT(DISTINCT f2.id) as following_count,
        COUNT(DISTINCT p.id) as posts_count
      FROM users u
      LEFT JOIN user_follows f1 ON u.id = f1.following_id
      LEFT JOIN user_follows f2 ON u.id = f2.follower_id
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE LOWER(u.username) = LOWER($1)
      GROUP BY u.id, u.username, u.email, u.bio, u.avatar_url, u.banner_url, u.display_name, u.youtube_url, u.spotify_url, u.facebook_url, u.discord_username, u.twitter_url, u.instagram_url, u.linkedin_url, u.github_url, u.created_at
    `, [identifier]);

    if (result.rows.length === 0 && !isNaN(identifier)) {
      result = await pool.query(`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.bio,
          u.avatar_url,
          u.banner_url,
          u.display_name,
          u.youtube_url,
          u.spotify_url,
          u.facebook_url,
          u.discord_username,
          u.twitter_url,
          u.instagram_url,
          u.linkedin_url,
          u.github_url,
          u.created_at,
          COUNT(DISTINCT f1.id) as followers_count,
          COUNT(DISTINCT f2.id) as following_count,
          COUNT(DISTINCT p.id) as posts_count
        FROM users u
        LEFT JOIN user_follows f1 ON u.id = f1.following_id
        LEFT JOIN user_follows f2 ON u.id = f2.follower_id
        LEFT JOIN posts p ON u.id = p.user_id
        WHERE u.id = $1
        GROUP BY u.id, u.username, u.email, u.bio, u.avatar_url, u.banner_url, u.display_name, u.youtube_url, u.spotify_url, u.facebook_url, u.discord_username, u.twitter_url, u.instagram_url, u.linkedin_url, u.github_url, u.created_at
      `, [parseInt(identifier)]);
    }

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    let isFollowing = false;
    if (currentUserId && currentUserId != user.id) {
      const followCheck = await pool.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, user.id]
      );
      isFollowing = followCheck.rows.length > 0;
    }

    res.json({
      success: true,
      data: {
        ...user,
        is_following: isFollowing,
        is_own_profile: currentUserId == user.id
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

router.get("/users/:identifier/reviews", async (req, res) => {
  try {
    const { identifier } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let userResult = await pool.query(
      `SELECT id FROM users WHERE LOWER(username) = LOWER($1)`,
      [identifier]
    );
    if (userResult.rows.length === 0 && !isNaN(identifier)) {
      userResult = await pool.query(
        `SELECT id FROM users WHERE id = $1`,
        [parseInt(identifier)]
      );
    }
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "User not found" });
    }
    const userId = userResult.rows[0].id;
    const result = await pool.query(
      `
      SELECT 
        r.id,
        r.review_type,
        r.target_id,
        r.rating,
        r.comment,
        r.is_anonymous,
        r.created_at,
        CASE 
          WHEN r.is_anonymous THEN 'Anonymous'
          ELSE u.username
        END as username,
        CASE 
          WHEN r.is_anonymous THEN NULL
          ELSE u.avatar_url
        END as avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [userId, limit, offset]
    );
    const enrichedReviews = result.rows.map((r) => ({
      ...r,
      professor_name:
        r.review_type === "professor" ? getProfessorName(r.target_id) : null,
    }));

    res.json({
      success: true,
      data: {
        reviews: enrichedReviews,
        pagination: { page, limit, hasMore: result.rows.length === limit },
      },
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user reviews" });
  }
});

router.get('/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const result = await pool.query(`
      SELECT 
        r.id,
        r.review_type,
        r.target_id,
        r.rating,
        r.comment,
        r.is_anonymous,
        r.created_at,
        CASE 
          WHEN r.is_anonymous THEN 'Anonymous'
          ELSE u.username
        END as username,
        CASE 
          WHEN r.is_anonymous THEN NULL
          ELSE u.avatar_url
        END as avatar_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    const enrichedReviews = result.rows.map(r => ({
      ...r,
      professor_name: r.review_type === 'professor'
        ? getProfessorName(r.target_id)
        : null
    }));
    res.json({
      success: true,
      data: {
        reviews: enrichedReviews,
        pagination: { page, limit, hasMore: result.rows.length === limit }
      }
    });
  } catch (error) {
    console.error('Get explore reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

router.get('/reviews-feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        r.id,
        r.review_type,
        r.target_id,
        r.rating,
        r.comment,
        r.is_anonymous,
        r.created_at,
        CASE 
          WHEN r.is_anonymous THEN 'Anonymous'
          ELSE u.username
        END as username,
        CASE 
          WHEN r.is_anonymous THEN NULL
          ELSE u.avatar_url
        END as avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE (
        r.user_id IN (SELECT following_id FROM user_follows WHERE follower_id = $1)
        OR r.user_id = $1
      )
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const enrichedReviews = result.rows.map(r => ({
      ...r,
      professor_name: r.review_type === 'professor'
        ? getProfessorName(r.target_id)
        : null
    }));

    res.json({
      success: true,
      data: {
        reviews: enrichedReviews,
        pagination: { page, limit, hasMore: result.rows.length === limit }
      }
    });
  } catch (error) {
    console.error('Get feed reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews feed' });
  }
});

router.get('/users/:identifier/followers', async (req, res) => {
  try {
    const { identifier } = req.params;
    let result = await pool.query(`
      SELECT 
        follower.id,
        follower.username,
        follower.bio,
        follower.avatar_url,
        uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.following_id = u.id
      JOIN users follower ON uf.follower_id = follower.id
      WHERE LOWER(u.username) = LOWER($1)
      ORDER BY uf.created_at DESC
    `, [identifier]);

    if (result.rows.length === 0 && !isNaN(identifier)) {
      result = await pool.query(`
        SELECT 
          follower.id,
          follower.username,
          follower.bio,
          follower.avatar_url,
          uf.created_at as followed_at
        FROM user_follows uf
        JOIN users u ON uf.following_id = u.id
        JOIN users follower ON uf.follower_id = follower.id
        WHERE u.id = $1
        ORDER BY uf.created_at DESC
      `, [parseInt(identifier)]);
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch followers' });
  }
});

router.get('/users/:identifier/following', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let result = await pool.query(`
      SELECT 
        following.id,
        following.username,
        following.bio,
        following.avatar_url,
        uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.follower_id = u.id
      JOIN users following ON uf.following_id = following.id
      WHERE LOWER(u.username) = LOWER($1)
      ORDER BY uf.created_at DESC
    `, [identifier]);

    if (result.rows.length === 0 && !isNaN(identifier)) {
      result = await pool.query(`
        SELECT 
          following.id,
          following.username,
          following.bio,
          following.avatar_url,
          uf.created_at as followed_at
        FROM user_follows uf
        JOIN users u ON uf.follower_id = u.id
        JOIN users following ON uf.following_id = following.id
        WHERE u.id = $1
        ORDER BY uf.created_at DESC
      `, [parseInt(identifier)]);
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch following' });
  }
});

router.get('/suggestions/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const result = await pool.query(`
      SELECT DISTINCT
        u.id,
        u.username,
        u.display_name,
        u.bio,
        u.avatar_url
      FROM users u
      JOIN user_follows uf ON u.id = uf.following_id
      JOIN user_follows mutual ON uf.follower_id = mutual.follower_id
      JOIN user_follows my_follows ON mutual.following_id = my_follows.following_id
      WHERE my_follows.follower_id = $1
        AND u.id != $1
        AND u.id NOT IN (
          SELECT following_id FROM user_follows WHERE follower_id = $1
        )
      LIMIT 5
    `, [currentUserId]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
});

router.post('/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Post content is required' });
    }

    if (content.length > 200) {
      return res.status(400).json({ success: false, error: 'Post content must be less than 200 characters' });
    }

    let imageUrl = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'umn-discover/posts',
          transformation: {
            width: 1200,
            height: 800,
            crop: 'limit',
            quality: 'auto:good',
            fetch_format: 'auto'
          },
          public_id_prefix: `${userId}_post`
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Post image upload error:', uploadError);
        return res.status(500).json({ success: false, error: 'Failed to upload image' });
      }
    }

    const result = await pool.query(`
      INSERT INTO posts (user_id, content, image_url)
      VALUES ($1, $2, $3)
      RETURNING id, content, image_url, created_at
    `, [userId, content.trim(), imageUrl]);

    const post = result.rows[0];
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);

    res.status(201).json({
      success: true,
      data: {
        ...post,
        username: userResult.rows[0].username,
        user_id: userId,
        likes_count: 0,
        comments_count: 0,
        user_liked: false
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

router.post('/users/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.user.userId;

    if (followerId == targetUserId) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [targetUserId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const followCheck = await pool.query(
      'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, targetUserId]
    );

    if (followCheck.rows.length > 0) {
      await pool.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, targetUserId]
      );
      res.json({ success: true, following: false, message: 'Unfollowed user' });
    } else {
      await pool.query(
        'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2)',
        [followerId, targetUserId]
      );
      res.json({ success: true, following: true, message: 'Following user' });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ success: false, error: 'Failed to follow/unfollow user' });
  }
});

router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.username,
        u.id as user_id,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
});

router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ success: false, error: 'Comment must be less than 500 characters' });
    }

    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const result = await pool.query(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
    `, [userId, postId, content.trim()]);

    const comment = result.rows[0];
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);

    res.status(201).json({
      success: true,
      data: {
        ...comment,
        username: userResult.rows[0].username,
        user_id: userId
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ success: false, error: 'Failed to create comment' });
  }
});

export default router;
import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'umn-discover-secret-key';

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
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

router.get('/:reviewType/:targetId', async (req, res) => {
  try {
    const { reviewType, targetId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!['professor', 'course'].includes(reviewType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review type'
      });
    }

    const result = await pool.query(
      `
      SELECT 
        r.id,
        r.user_id,
        r.rating,
        r.comment,
        r.location,
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
      WHERE r.review_type = $1 AND r.target_id = $2
      ORDER BY r.created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [reviewType, targetId, limit, offset]
    );

    const statsResult = await pool.query(
      `
      SELECT 
        AVG(rating)::NUMERIC(3,2) as average_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE review_type = $1 AND target_id = $2
      `,
      [reviewType, targetId]
    );

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        stats: statsResult.rows[0],
        pagination: {
          page,
          limit,
          hasMore: result.rows.length === limit
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

router.post('/:reviewType/:targetId', authenticateToken, async (req, res) => {
  try {
    const { reviewType, targetId } = req.params;
    const { rating, comment, location, isAnonymous } = req.body;
    const userId = req.user.userId;

    if (!['professor', 'course'].includes(reviewType)) {
      return res.status(400).json({ success: false, error: 'Invalid review type' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    if (comment && comment.length > 1000) {
      return res.status(400).json({ success: false, error: 'Comment must be less than 1000 characters' });
    }
    
    const insertResult = await pool.query(
      `
      INSERT INTO reviews (user_id, review_type, target_id, rating, comment, location, is_anonymous)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [userId, reviewType, targetId, rating, comment || null, location || null, isAnonymous || false]
    );

    const newReviewId = insertResult.rows[0].id;
    const enriched = await pool.query(
      `
      SELECT 
        r.id,
        r.user_id,
        r.rating,
        r.comment,
        r.location,
        r.is_anonymous,
        r.created_at,
        CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.username END as username,
        CASE WHEN r.is_anonymous THEN NULL ELSE u.avatar_url END as avatar_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
      `,
      [newReviewId]
    );

    res.status(201).json({
      success: true,
      data: enriched.rows[0],
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, error: 'Failed to save review' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or not yours'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

export default router;
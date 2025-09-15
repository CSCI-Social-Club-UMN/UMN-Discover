import React, { useState, useEffect } from "react";
import { FaStar, FaUser, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

const ReviewSection = ({ reviewType, targetId, targetName, user }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ rating: 0, comment: "", isAnonymous: false });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editFormData, setEditFormData] = useState({ rating: 0, comment: "", isAnonymous: false });

  useEffect(() => {
    fetchReviews();
  }, [reviewType, targetId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${reviewType}/${encodeURIComponent(targetId)}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch reviews:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to post a review.");
    if (formData.rating === 0) return alert("Please select a rating.");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/reviews/${reviewType}/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => [data.data, ...prev]);
        setFormData({ rating: 0, comment: "", isAnonymous: false });
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error("Failed to submit review:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error("Failed to delete review:", e);
    }
  };

  const handleUpdate = async (reviewId) => {
    if (!user) return;
    if (editFormData.rating === 0) return alert("Please select a rating.");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/reviews/${reviewType}/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, ...editFormData } : r
          )
        );
        setEditingReviewId(null);
      }
    } catch (e) {
      console.error("Update failed:", e);
    }
  };

  const renderStars = (rating, interactive = false, onClick) => (
    <div className="stars-container">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= rating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
          onClick={interactive ? () => onClick(star) : undefined}
          disabled={!interactive}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="reviews-section">
      <h2>Student Reviews</h2>
      {user && (
        <form onSubmit={handleSubmitNew} className="new-review-box">
          <div className="new-review-header">Write a Review</div>
          {renderStars(formData.rating, true, (s) => setFormData((p) => ({ ...p, rating: s })))}
          <textarea
            className="new-review-textarea"
            value={formData.comment}
            onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value }))}
            placeholder="Share your experience..."
            rows={3}
          />
          <div className="form-actions">
            <button type="submit" className="btn box primary" disabled={submitting}>
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </div>
        </form>
      )}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <motion.div key={r.id} className="review-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="review-body">
                <div className="review-avatar">
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt={r.username} />
                  ) : (
                    <FaUser />
                  )}
                </div>

                <div className="review-content">
                  <div className="review-headerline">
                    <span className="reviewer">{r.is_anonymous ? "Anonymous" : r.username}</span>
                    <span className="review-time">· {formatDate(r.created_at)}</span>
                  </div>

                  {editingReviewId === r.id ? (
                    <>
                      {renderStars(editFormData.rating, true, (s) =>
                        setEditFormData((p) => ({ ...p, rating: s }))
                      )}
                      <textarea
                        className="edit-textarea themed"
                        value={editFormData.comment}
                        onChange={(e) => setEditFormData((p) => ({ ...p, comment: e.target.value }))}
                      />
                      <div className="inline-edit-actions">
                        <button className="btn box save" onClick={() => handleUpdate(r.id)}>Save</button>
                        <button className="btn box cancel" onClick={() => setEditingReviewId(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      {renderStars(r.rating)}
                      {r.comment && <p className="review-text">{r.comment}</p>}
                    </>
                  )}

                  {r.is_anonymous && (
                    <div className="anonymous-badge">
                      <FaEyeSlash /> Anonymous
                    </div>
                  )}

                  {user && r.user_id === user.id && editingReviewId !== r.id && (
                    <div className="review-actions">
                      <button
                        className="btn box edit"
                        onClick={() => {
                          setEditingReviewId(r.id);
                          setEditFormData({ rating: r.rating, comment: r.comment || "", isAnonymous: r.is_anonymous });
                        }}
                      >
                        Edit
                      </button>
                      <button className="btn box delete" onClick={() => handleDelete(r.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

          ))
        ) : (
          <p>No reviews yet. Be the first to review {targetName}!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
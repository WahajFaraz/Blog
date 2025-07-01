import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
// import { useTheme } from './ThemeContext';
import "./CommentSection.css";

export default function CommentSection({ postId, sidebarMode = false, refetchComments }) {
    const { currentUser } = useSelector((state) => state.user);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    // const { theme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim() === '') return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/comments/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({ text: comment }),
            });
            const data = await res.json();
            if (res.ok) {
                setComment('');
                setComments([data, ...comments]);
                if (refetchComments) refetchComments();
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments/${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleDelete = async (commentId) => {
        try {
            if (!currentUser) {
                navigate('/sign-in');
                return;
            }
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });
            if (res.ok) {
                setComments(comments.filter((c) => c._id !== commentId));
                if (refetchComments) refetchComments();
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className={sidebarMode ? "comments-sidebar" : "comments-container"}>
            {!sidebarMode && <h3 className="section-title">Comments ({comments.length})</h3>}
            {currentUser ? (
                <form className="comment-form" onSubmit={handleSubmit}>
                    <textarea
                        className="comment-textarea"
                        placeholder="Join the discussion..."
                        rows="4"
                        maxLength="300"
                        onChange={(e) => setComment(e.target.value)}
                        value={comment}
                    />
                    <div className="form-actions">
                        <p className="chars-remaining">{300 - comment.length} characters remaining</p>
                        <button className="submit-button" type="submit" disabled={isLoading || !comment.trim()}>
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="sign-in-message">
                    You must be <Link to="/login">signed in</Link> to comment.
                </div>
            )}
            <div className="comments-list-scroll">
                <AnimatePresence>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <motion.div key={comment._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Comment
                                    comment={comment}
                                    onDelete={handleDelete}
                                />
                            </motion.div>
                        ))
                    ) : (
                        !currentUser && <p className="no-comments-message">No comments yet. Be the first!</p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 
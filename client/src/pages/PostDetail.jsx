import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import "./PostDetail.css";
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTwitter, FiFacebook, FiEdit2, FiTrash2, FiMessageCircle } from 'react-icons/fi';
// import { useTheme } from '../components/ThemeContext';
import CommentSection from '../components/CommentSection';
import { jwtDecode } from 'jwt-decode';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const postUrl = window.location.href;
  // const { theme } = useTheme();
  const navigate = useNavigate();
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    // Get logged in user id
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLoggedInUserId(decoded.id || decoded._id);
      } catch {}
    }
  }, [id]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!modalImage) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setModalImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalImage]);

  // Add click handler to post content images after render
  useEffect(() => {
    if (!post) return;
    const contentDiv = document.querySelector('.post-content');
    if (contentDiv) {
      const imgs = contentDiv.querySelectorAll('img');
      imgs.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.onclick = () => setModalImage(img.src);
      });
    }
  }, [post]);

  // Fetch comment count
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const res = await fetch(`/api/comments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCommentCount(data.length);
        }
      } catch {}
    };
    fetchCommentCount();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/');
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  if (loading) return <div className="loading-container">Loading post...</div>;
  if (!post) return <div className="loading-container">Sorry, this post could not be found.</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const isAuthor = loggedInUserId && post.author && (post.author._id === loggedInUserId || post.author.id === loggedInUserId);

  return (
    <motion.div
      className="post-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Link to="/" className="back-button">
        <FiArrowLeft /> Back to Home
      </Link>
      <motion.div className="post-header" variants={itemVariants}>
        <div className="post-title-row">
          <motion.h1 className="post-title" variants={itemVariants}>{post.title}</motion.h1>
          <button className="comment-icon-btn" onClick={() => setShowComments(true)}>
            <FiMessageCircle className="comment-icon" />
            <span className="comment-count">{commentCount}</span>
          </button>
        </div>
        <motion.div className="post-meta" variants={itemVariants}>
          <span className="post-author">By {post.author?.username || 'Unknown'}</span>
          <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
          {isAuthor && (
            <motion.div className="post-actions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <button className="edit-btn" onClick={() => navigate(`/edit/${id}`)}><FiEdit2 /> Edit</button>
              <button className="delete-btn" onClick={handleDelete}><FiTrash2 /> Delete</button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      {post.mediaUrl && (
        <motion.div className="media-display" variants={itemVariants}>
          {post.mediaUrl.endsWith('.mp4') ? (
            <video src={post.mediaUrl} controls />
          ) : (
            <img src={post.mediaUrl} alt="Post media" style={{ cursor: 'zoom-in' }} onClick={() => setModalImage(post.mediaUrl)} />
          )}
        </motion.div>
      )}
      <motion.div className="post-content" variants={itemVariants} dangerouslySetInnerHTML={{ __html: post.content }} />
      {modalImage && (
        <div className="image-modal" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="Full view" />
          <span className="modal-close">×</span>
        </div>
      )}
      {/* <motion.div className="social-share-container" variants={itemVariants}>
        <h3>Share this post:</h3>
        <a
          className="share-button twitter"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiTwitter /> Twitter
        </a>
        <a
          className="share-button facebook"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiFacebook /> Facebook
        </a>
      </motion.div> */}
      <motion.div
        className={`comment-sidebar${showComments ? ' open' : ''}`}
        initial={{ x: '100%' }}
        animate={{ x: showComments ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      >
        <button className="close-sidebar-btn" onClick={() => setShowComments(false)}>&times;</button>
        <CommentSection postId={id} sidebarMode={true} />
      </motion.div>
      {showComments && <div className="sidebar-backdrop" onClick={() => setShowComments(false)}></div>}
    </motion.div>
  );
};

export default PostDetail;